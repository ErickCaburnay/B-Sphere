"use client";

import { useState, useRef } from "react";
import { MoreVertical, Pencil, Trash2, Plus, Search, Filter, Download, Upload, Table, Grid, FileSpreadsheet, FileText as FileTextIcon } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { Menu, Transition } from '@headlessui/react';
import { cachedFetch, invalidateCache } from '@/components/ui/ClientCache';

export function HouseholdClientComponent({ initialHouseholds }) {
  const [households, setHouseholds] = useState(initialHouseholds);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedHouseholdForView, setSelectedHouseholdForView] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [householdToDelete, setHouseholdToDelete] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const fileInputRef = useRef(null);

  // Function to re-fetch data (for CRUD operations)
  const refreshHouseholds = async () => {
    try {
      const data = await cachedFetch('/api/households', { bypassCache: true }); // Bypass cache for fresh data
      setHouseholds(data);
    } catch (error) {
      console.error('Error fetching households:', error);
    }
  };

  const handleSearch = () => {
    // This will trigger re-filtering based on the current state
    console.log('Triggering search/filter update.');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredHouseholds = households.filter(household => {
    const fullName = `${household.head.firstName} ${household.head.middleName ? household.head.middleName + ' ' : ''}${household.head.lastName}`;
    return fullName.toLowerCase().includes(searchText.toLowerCase()) ||
           household.id.toLowerCase().includes(searchText.toLowerCase()) ||
           household.address.toLowerCase().includes(searchText.toLowerCase());
  });

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
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const handleEditClick = (household) => {
    setSelectedHousehold(household);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (household) => {
    setHouseholdToDelete(household);
    setIsDeleteModalOpen(true);
  };

  const handleRowClick = (household) => {
    setSelectedHouseholdForView(household);
    setIsViewModalOpen(true);
  };

  return (
    <div className={`w-full font-sans ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>      
      
      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <button 
              onClick={handleSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <Search size={18} />
            </button>
            <input
              type="text"
              placeholder="Search households..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-12 py-2 border border-gray-300 text-gray-900 rounded-md w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchText && (
              <button
                onClick={() => {
                  setSearchText("");
                  handleSearch();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Filter Icon Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900"
          title="Show filters"
        >
          <Filter className="h-5 w-5" />
        </button>
        {/* Table/Grid Toggle */}
        <button
          onClick={() => setViewMode('table')}
          className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Table className="h-5 w-5" />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Grid className="h-5 w-5" />
        </button>
        {/* Export Dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className={`p-2 rounded-lg text-gray-600 hover:text-gray-900`}>
            <Download className="h-5 w-5" />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 bg-white`}>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {}}
                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm w-full`}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to Excel
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {}}
                    className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm w-full`}
                  >
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    Export to PDF
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
        {/* Import Excel Button */}
        <button
          onClick={() => {}}
          className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2`}
        >
          <Upload className="h-5 w-5" />
          <span>Import Excel</span>
        </button>
        {/* Add Household Button */}
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-5 w-5" />
          <span>Add Household</span>
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-auto rounded-xl shadow border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">Household ID</th>
              <th className="p-4 text-left font-semibold">Head</th>
              <th className="p-4 text-left font-semibold">Total Members</th>
              <th className="p-4 text-left font-semibold">Address</th>
              <th className="p-4 text-left font-semibold">Contact #</th>
              <th className="p-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentHouseholds.map((household) => (
              <tr
                key={household.id}
                className="hover:bg-green-50 transition-colors border-t border-gray-100 cursor-pointer"
                onClick={() => handleRowClick(household)}
              >
                <td className="p-4">{household.id}</td>
                <td className="p-4">{`${household.head.firstName} ${household.head.middleName ? household.head.middleName + ' ' : ''}${household.head.lastName}`}</td>
                <td className="p-4">{household.totalMembers}</td>
                <td className="p-4">{household.address}</td>
                <td className="p-4">{household.contactNumber}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 transition text-blue-600"
                      onClick={() => handleEditClick(household)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 transition text-red-600"
                      onClick={() => handleDeleteClick(household)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredHouseholds.length)} of {filteredHouseholds.length} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                // Show current page, first page, last page, and pages around current page
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 rounded-md border text-sm ${
                        currentPage === pageNumber
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* View Household Details Modal */}
      {isViewModalOpen && selectedHouseholdForView && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Household Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Household ID</p>
                <p className="mt-1">{selectedHouseholdForView.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Head of Family</p>
                <p className="mt-1">{`${selectedHouseholdForView.head.firstName} ${selectedHouseholdForView.head.middleName ? selectedHouseholdForView.head.middleName + ' ' : ''}${selectedHouseholdForView.head.lastName}`}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <p className="mt-1">{selectedHouseholdForView.totalMembers}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Number</p>
                <p className="mt-1">{selectedHouseholdForView.contactNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="mt-1">{selectedHouseholdForView.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date Added</p>
                <p className="mt-1">{new Date(selectedHouseholdForView.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Household Modal */}
      {isAddModalOpen && (
        <AddHouseholdModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={async (householdData) => {
            try {
              // Here you would typically make an API call to create the household
              console.log('Creating household:', householdData);
              await refreshHouseholds();
              setIsAddModalOpen(false);
            } catch (error) {
              console.error('Failed to create household:', error);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && householdToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-center">Delete Household</h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete this household? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setHouseholdToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Household Modal Component
const AddHouseholdModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    address: '',
    headOfHouseholdFirstName: '',
    headOfHouseholdLastName: '',
    headOfHouseholdMiddleName: '',
    contactNumber: '',
    totalMembers: 1,
  });
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [householdMembers, setHouseholdMembers] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const householdData = {
      ...formData,
      members: householdMembers
    };
    onSubmit(householdData);
    setFormData({
      address: '',
      headOfHouseholdFirstName: '',
      headOfHouseholdLastName: '',
      headOfHouseholdMiddleName: '',
      contactNumber: '',
      totalMembers: 1,
    });
    setHouseholdMembers([]);
  };

  const handleAddMember = (memberData) => {
    setHouseholdMembers(prev => [...prev, memberData]);
    setFormData(prev => ({
      ...prev,
      totalMembers: prev.totalMembers + 1
    }));
  };

  const handleRemoveMember = (memberId) => {
    setHouseholdMembers(prev => prev.filter(member => member.id !== memberId));
    setFormData(prev => ({
      ...prev,
      totalMembers: Math.max(1, prev.totalMembers - 1)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Add New Household</h3>
                <p className="text-green-100 text-sm">Create a new household record</p>
              </div>
            </div>
            <button
              type="button"
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              onClick={onClose}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Household Information Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-green-100 rounded-full p-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Household Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Household Address</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter complete household address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Contact Number</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="+63 XXX XXX XXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Total Members</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalMembers"
                    value={formData.totalMembers}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                    readOnly
                  />
                  <p className="text-xs text-gray-500">This will update automatically as you add members</p>
                </div>
              </div>
            </div>

            {/* Head of Household Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-emerald-100 rounded-full p-2">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Head of Household</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>First Name</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="headOfHouseholdFirstName"
                    value={formData.headOfHouseholdFirstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="headOfHouseholdMiddleName"
                    value={formData.headOfHouseholdMiddleName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Middle name (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Last Name</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="headOfHouseholdLastName"
                    value={formData.headOfHouseholdLastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Household Members Section */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="bg-teal-100 rounded-full p-2">
                    <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Household Members</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Member
                </button>
              </div>
              
              {/* Members List */}
              <div className="space-y-3">
                {householdMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-2 text-sm">No members added yet</p>
                    <p className="text-xs text-gray-400">Click "Add Member" to add household members</p>
                  </div>
                ) : (
                  householdMembers.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="bg-teal-100 rounded-full p-2">
                          <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.fullName}</p>
                          <p className="text-sm text-gray-500">ID: {member.id} • Born: {member.birthdate}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Household
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onAddMember={handleAddMember}
          existingMembers={householdMembers}
        />
      )}
    </div>
  );
};

// Add Member Modal Component
const AddMemberModal = ({ isOpen, onClose, onAddMember, existingMembers }) => {
  const [residentId, setResidentId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async () => {
    if (!residentId.trim()) {
      setErrorMessage('Please enter a resident ID');
      return;
    }

    // Check if member is already added
    if (existingMembers.some(member => member.id === residentId)) {
      setErrorMessage('This resident is already a member of this household');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');
    setSearchResult(null);

    try {
      const response = await fetch(`/api/residents/${residentId}`);
      const data = await response.json();

      if (response.ok && data) {
        setSearchResult({
          id: data.id || residentId,
          fullName: `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`,
          birthdate: data.birthdate ? new Date(data.birthdate).toLocaleDateString() : 'N/A'
        });
      } else {
        setErrorMessage('Resident not found in the database. Please verify the ID and try again.');
      }
    } catch (error) {
      console.error('Error searching for resident:', error);
      setErrorMessage('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = () => {
    if (searchResult) {
      onAddMember(searchResult);
      handleClear();
      onClose();
    }
  };

  const handleClear = () => {
    setResidentId('');
    setSearchResult(null);
    setErrorMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-[60]">
      <div className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-6 py-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-cyan-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Add Member</h3>
                <p className="text-teal-100 text-sm">Search for a resident to add</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-left">
                Resident ID
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={residentId}
                  onChange={(e) => setResidentId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="Enter resident ID"
                  disabled={isSearching}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSearching ? (
                    <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Search Result or Error */}
            <div className="min-h-[120px]">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <div className="bg-red-100 rounded-full p-1 mt-0.5">
                      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Error</h4>
                      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {searchResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-green-800">Resident Found</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-green-700"><span className="font-medium">ID:</span> {searchResult.id}</p>
                        <p className="text-sm text-green-700"><span className="font-medium">Name:</span> {searchResult.fullName}</p>
                        <p className="text-sm text-green-700"><span className="font-medium">Birthdate:</span> {searchResult.birthdate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!errorMessage && !searchResult && !isSearching && (
                <div className="text-center py-8 text-gray-400">
                  <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="mt-2 text-sm">Enter a resident ID and click search</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClear}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={!searchResult}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Add Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 