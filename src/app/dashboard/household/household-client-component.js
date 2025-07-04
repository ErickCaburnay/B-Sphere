"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Upload, Download, Filter, Eye, Pencil, Trash2, RefreshCw, Grid3x3, List, ChevronDown, X, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatContactNumberDisplay } from '@/components/ui/ContactNumberInput';
import { ViewHouseholdModal } from '@/components/households/ViewHouseholdModal';
import { AddHouseholdModal } from '@/components/households/AddHouseholdModal';
import { EditHouseholdModal } from '@/components/households/EditHouseholdModal';
import { DeleteHouseholdModal } from '@/components/households/DeleteHouseholdModal';

export function HouseholdClientComponent({ initialHouseholds }) {
  const [households, setHouseholds] = useState(initialHouseholds || []);
  const [filteredHouseholds, setFilteredHouseholds] = useState(initialHouseholds || []);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    familySize: '',
    area: '',
    status: ''
  });
  const debounceTimeout = useRef(null);

  // Function to re-fetch data (for CRUD operations)
  const refreshHouseholds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/households');
      const data = await res.json();
      setHouseholds(data.data || data);
      setFilteredHouseholds(data.data || data);
    } catch (error) {
      console.error('Error fetching households:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
  
    if (value.trim()) {
      const keyword = value.toLowerCase();
      const filtered = households.filter(h => {
        const headName = `${h.head?.firstName || ''} ${h.head?.middleName || ''} ${h.head?.lastName || ''}`.toLowerCase();
        const fields = [
          h.id,
          headName,
          h.address,
          h.contactNumber,
          h.totalMembers?.toString()
        ];
        const haystack = fields.filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(keyword);
      });
      setFilteredHouseholds(filtered);
      setCurrentPage(1);
    } else {
      setFilteredHouseholds(households);
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setFilters({
      familySize: '',
      area: '',
      status: ''
    });
    setFilteredHouseholds(households);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredHouseholds.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentHouseholds = filteredHouseholds.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleViewHousehold = (household) => {
    setSelectedHousehold(household);
    setShowViewModal(true);
  };

  const handleEditHousehold = (household) => {
    setSelectedHousehold(household);
    setShowEditModal(true);
  };

  const handleDeleteHousehold = (household) => {
    setSelectedHousehold(household);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch('/api/households', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedHousehold.id }),
      });

      if (res.ok) {
        toast.success('Household deleted successfully');
        setShowDeleteModal(false);
        setSelectedHousehold(null);
        refreshHouseholds();
      } else {
        const errorData = await res.json();
        toast.error(`Failed to delete household: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting household:', error);
      toast.error('An error occurred while deleting household.');
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    refreshHouseholds();
    // eslint-disable-next-line
  }, []);

  // Ownership type badge colors
  const ownershipTypeBadgeColors = {
    'OWNED': 'bg-green-100 text-green-800 border-green-200',
    'MORTGAGED': 'bg-orange-100 text-orange-800 border-orange-200',
    'RENTED': 'bg-blue-100 text-blue-800 border-blue-200',
    'INFORMAL_SETTLER': 'bg-red-100 text-red-800 border-red-200'
  };

  const ownershipTypeLabels = {
    'OWNED': 'Owned',
    'MORTGAGED': 'Mortgaged',
    'RENTED': 'Rented',
    'INFORMAL_SETTLER': 'Informal Settler'
  };

  // Function to format ownership type display
  const formatOwnershipType = (type) => {
    if (!type) return 'N/A';
    return ownershipTypeLabels[type] || type.replace(/_/g, ' ');
  };

  return (
    <>
      {/* Blurred Background Overlay for Modals */}
      {(showAddModal || showViewModal || showEditModal || showDeleteModal) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      )}

      <div className="space-y-6">
        {/* Action Bar */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Search Bar and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search households..."
                  className="pl-9 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchText}
                  onChange={handleSearchChange}
            />
            {searchText && (
              <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    onClick={() => setSearchText("")}
                  >
                    <X size={16} />
              </button>
            )}
          </div>

              {/* Filter Button */}
              <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-lg border transition-colors flex items-center space-x-1.5 text-sm flex-shrink-0 ${
                    showFilters 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Filters"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
                
                {/* Active filters indicator */}
                {(searchText || Object.values(filters).some(f => f && f !== '')) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-center lg:space-y-0 lg:gap-4">
              {/* View Controls */}
              <div className="flex items-center justify-center space-x-2 flex-shrink-0">
                {/* Refresh Button */}
        <button
                  onClick={refreshHouseholds}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid" 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="Card View"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "table" 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="Table View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Export Button */}
                <div className="relative">
        <button
                    className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1.5 text-sm"
                    title="Export"
        >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
        </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center space-x-2 flex-shrink-0">
        {/* Add Household Button */}
        <button 
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1.5 text-sm font-medium flex-shrink-0"
                  onClick={() => setShowAddModal(true)}
                  title="Add Household"
                >
                  <Plus className="h-4 w-4" />
                  <span className="whitespace-nowrap">Add Household</span>
                </button>

                {/* Batch Upload Button */}
                <button 
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1.5 text-sm font-medium flex-shrink-0"
                  title="Batch Upload"
                >
                  <Upload className="h-4 w-4" />
                  <span className="whitespace-nowrap hidden sm:inline">Batch Upload</span>
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Family Size</label>
                  <select 
                    value={filters.familySize}
                    onChange={(e) => setFilters({...filters, familySize: e.target.value})}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sizes</option>
                    <option value="1-3">Small (1-3 members)</option>
                    <option value="4-6">Medium (4-6 members)</option>
                    <option value="7+">Large (7+ members)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select 
                    value={filters.area}
                    onChange={(e) => setFilters({...filters, area: e.target.value})}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Areas</option>
                    <option value="zone1">Zone 1</option>
                    <option value="zone2">Zone 2</option>
                    <option value="zone3">Zone 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Filters</span>
        </button>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Table */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HOUSEHOLD ID</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Members</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Address</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">House Ownership</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentHouseholds.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        'No households found'
                      )}
                    </td>
                  </tr>
                ) : (
                  currentHouseholds.map((household) => (
                    <tr key={household.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {household.householdId || household.id}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {household.head ? [household.head.firstName, household.head.middleName, household.head.lastName].filter(Boolean).join(' ') : 'N/A'}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {household.totalMembers || 0}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 max-w-xs truncate hidden lg:table-cell">
                        {household.address}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                        {formatContactNumberDisplay(household.contactNumber)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ownershipTypeBadgeColors[household.ownershipType] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {formatOwnershipType(household.ownershipType)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleViewHousehold(household)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                    <button
                            onClick={() => handleEditHousehold(household)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Edit"
                    >
                            <Pencil className="h-4 w-4" />
                    </button>
                    <button
                            onClick={() => handleDeleteHousehold(household)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete"
                    >
                            <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
                  ))
                )}
          </tbody>
        </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 gap-3">
            <div className="flex items-center justify-center sm:justify-start">
              <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
              <span className="ml-4 text-sm text-gray-700">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredHouseholds.length)} of {filteredHouseholds.length} entries
            </span>
          </div>

            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) ? (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-2 sm:px-3 py-1 border text-sm rounded ${
                        currentPage === pageNumber
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ) : (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) ? (
                    <span key={pageNumber} className="px-1">...</span>
                  ) : null
                ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </button>
          </div>
        </div>
      </div>

        {/* Modals */}
        {showViewModal && selectedHousehold && (
          <ViewHouseholdModal
            household={selectedHousehold}
            onClose={() => {
              setShowViewModal(false);
              setSelectedHousehold(null);
            }}
          />
        )}

        {showAddModal && (
        <AddHouseholdModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
          onSubmit={async (householdData) => {
            try {
                const res = await fetch('/api/households', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(householdData),
                });
                
                if (res.ok) {
                  toast.success('Household added successfully');
                  setShowAddModal(false);
                  refreshHouseholds();
                } else {
                  const errorData = await res.json();
                  toast.error(`Failed to add household: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Error adding household:', error);
                toast.error('An error occurred while adding household.');
            }
          }}
        />
      )}

        {showEditModal && selectedHousehold && (
          <EditHouseholdModal
            household={selectedHousehold}
            onClose={() => {
              setShowEditModal(false);
              setSelectedHousehold(null);
            }}
            onSubmit={async (householdData) => {
              try {
                const res = await fetch('/api/households', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...householdData, id: selectedHousehold.id }),
                });
                
                if (res.ok) {
                  toast.success('Household updated successfully');
                  setShowEditModal(false);
                  setSelectedHousehold(null);
                  refreshHouseholds();
        } else {
                  const errorData = await res.json();
                  toast.error(`Failed to update household: ${errorData.error}`);
                }
              } catch (error) {
                console.error('Error updating household:', error);
                toast.error('An error occurred while updating household.');
              }
            }}
          />
        )}

        {showDeleteModal && selectedHousehold && (
          <DeleteHouseholdModal
            household={selectedHousehold}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedHousehold(null);
            }}
            onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
    </>
  );
}

 