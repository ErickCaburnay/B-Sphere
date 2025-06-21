"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Plus, Search } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

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

  // Function to re-fetch data (for CRUD operations)
  const refreshHouseholds = async () => {
    const res = await fetch('/api/households');
    const data = await res.json();
    setHouseholds(data);
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
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Household Records</h2>
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-full transition ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {/* Filter icon SVG, width=20, height=20 */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </div>
      </div>
      <div className="h-1 bg-red-500 w-full mb-6"></div>

      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Add Button */}
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} /> Add Household
        </button>

        {/* Search Box with Icons */}
        <div className="relative">
          <button 
            onClick={handleSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <Search size={18} />
          </button>
          <input
            type="text"
            placeholder="Search household..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border pl-10 pr-10 py-2 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
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