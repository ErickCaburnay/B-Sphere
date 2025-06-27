// officials/page.js
"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import Pagination from '@/components/ui/Pagination';
import DashboardPageContainer from '@/components/DashboardPageContainer';
import { cachedFetch, invalidateCache } from '@/components/ui/ClientCache';

const OfficialsPage = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [officialToEdit, setOfficialToEdit] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageModalTitle, setMessageModalTitle] = useState('');
  const [messageModalContent, setMessageModalContent] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOfficialForView, setSelectedOfficialForView] = useState(null);
  const [newOfficial, setNewOfficial] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    position: '',
    termStart: '',
    termEnd: '',
    chairmanship: '',
    status: 'Active'
  });

  // Add dark mode state for demonstration (replace with your actual logic if needed)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  // Fetch officials on component mount
  useEffect(() => {
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    try {
      const data = await cachedFetch('/api/officials', {}, 300000); // Cache for 5 minutes
      setOfficials(Array.isArray(data) ? data : []);
      setTotalPages(Math.ceil(data.length / rowsPerPage));
      setStartIndex((currentPage - 1) * rowsPerPage);
      setEndIndex(Math.min(startIndex + rowsPerPage, data.length));
    } catch (error) {
      console.error('Error fetching officials:', error);
      setOfficials([]);
    }
  };

  const handleSearchResident = async () => {
    try {
      // Only search if we have at least first name and last name
      if (!newOfficial.firstName || !newOfficial.lastName) {
        setMessageModalTitle("Missing Information");
        setMessageModalContent('Please enter at least first name and last name to search.');
        setIsMessageModalOpen(true);
        return;
      }

      const queryParams = new URLSearchParams({
        firstName: newOfficial.firstName,
        lastName: newOfficial.lastName,
        ...(newOfficial.birthdate && { birthdate: newOfficial.birthdate })
      });

      console.log("Searching residents with query parameters:", queryParams.toString());

      const res = await fetch(`/api/residents/search?${queryParams}`);
      if (!res.ok) {
        throw new Error('Failed to search residents');
      }
      
      const data = await res.json();
      setSearchResults(data);
      
      if (data.length === 0) {
        setMessageModalTitle("No Residents Found");
        setMessageModalContent('No matching residents found.');
        setIsMessageModalOpen(true);
      }
    } catch (error) {
      console.error('Error searching resident:', error);
      setMessageModalTitle("Search Error");
      setMessageModalContent('An error occurred while searching for residents. Please try again.');
      setIsMessageModalOpen(true);
    }
  };

  const handleSelectResident = (resident) => {
    setNewOfficial(prevNewOfficial => {
      const updatedOfficial = {
        ...prevNewOfficial,
        residentId: resident.id,
        firstName: resident.firstName,
        middleName: resident.middleName || '',
        lastName: resident.lastName,
        birthdate: new Date(resident.birthdate).toISOString().split('T')[0]
      };
      console.log("New official state after selecting resident:", updatedOfficial);
      return updatedOfficial;
    });
    setSearchResults([]); // Clear search results after selection
  };

  const handleAddOfficialChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name}, Value: ${value}`);
    const newValue = (name === 'firstName' || name === 'middleName' || name === 'lastName') ? value.toUpperCase() : value;
    console.log(`New value after capitalization: ${newValue}`);
    setNewOfficial(prev => {
      const updatedOfficial = {
        ...prev,
        [name]: newValue
      };
      console.log("Updated newOfficial state:", updatedOfficial);
      return updatedOfficial;
    });
  };

  const handleAddOfficialSubmit = async (e) => {
    e.preventDefault();
    console.log("Attempting to add official with data:", newOfficial);
    try {
      const res = await fetch('/api/officials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOfficial,
          residentId: newOfficial.residentId
        }),
      });
      if (res.ok) {
        console.log('Official added successfully!');
        setIsAddModalOpen(false);
        setNewOfficial({
          firstName: '',
          middleName: '',
          lastName: '',
          birthdate: '',
          position: '',
          termStart: '',
          termEnd: '',
          chairmanship: '',
          status: 'Active'
        });
        fetchOfficials();
      } else {
        const errorData = await res.json();
        if (errorData.error === "Position already taken") {
          setErrorMessage(errorData.message);
          setIsErrorModalOpen(true);
        } else {
          setErrorMessage(`Failed to add official: ${errorData.error}`);
          setIsErrorModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error adding official:', error);
      setErrorMessage('An error occurred while adding official.');
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteClick = (official) => {
    setSelectedOfficial(official);
    setIsDeleteModalOpen(true);
  };

  const handleEditClick = (official) => {
    setOfficialToEdit(official);
    setIsEditModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`/api/officials?residentId=${selectedOfficial.residentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        console.log('Official deleted successfully!');
        setIsDeleteModalOpen(false);
        setSelectedOfficial(null);
        fetchOfficials();
        setMessageModalTitle("Success");
        setMessageModalContent('Official deleted successfully!');
        setIsMessageModalOpen(true);
      } else {
        const errorData = await res.json();
        setMessageModalTitle("Deletion Failed");
        setMessageModalContent(`Failed to delete official: ${errorData.error}`);
        setIsMessageModalOpen(true);
      }
    } catch (error) {
      console.error('Error deleting official:', error);
      setMessageModalTitle("Error");
      setMessageModalContent('An error occurred while deleting official.');
      setIsMessageModalOpen(true);
    }
  };

  const handleUpdateOfficialSubmit = async (updatedData) => {
    try {
      const res = await fetch(`/api/officials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        console.log('Official updated successfully!');
        setIsEditModalOpen(false);
        setOfficialToEdit(null);
        fetchOfficials(); // Refresh the list
      } else {
        const errorData = await res.json();
        alert(`Failed to update official: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating official:', error);
      alert('An error occurred while updating official.');
    }
  };

  const toggleMenu = (id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  const handleViewClick = (official) => {
    setSelectedOfficialForView(official);
    setIsViewModalOpen(true);
  };

  return (
    <DashboardPageContainer 
      heading="Barangay Officials"
      subtitle="Manage elected and appointed officials serving the barangay"
    >
      <div className="flex items-center justify-between mb-6">        
        <div className="flex items-center gap-2">
          {/* <button
            className="p-2 rounded-full transition text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button> */}
        </div>
      </div>
      
      <div className="w-full overflow-auto rounded-xl shadow border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Full Name</th>
              <th className="p-4 text-left font-semibold">Position</th>
              <th className="p-4 text-left font-semibold">Term Start</th>
              <th className="p-4 text-left font-semibold">Term End</th>
              <th className="p-4 text-left font-semibold">Chairmanship</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(officials) && officials.length > 0 ? (
              officials.map((official) => (
                <tr key={official.residentId} className="hover:bg-blue-50 transition-colors border-t border-gray-100 cursor-pointer" onClick={() => handleViewClick(official)}>
                  <td className="p-4">{official.residentId}</td>
                  <td className="p-4">{`${official.resident.firstName} ${official.resident.middleName ? official.resident.middleName + ' ' : ''}${official.resident.lastName}`}</td>
                  <td className="p-4">{official.position}</td>
                  <td className="p-4">{new Date(official.termStart).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(official.termEnd).toLocaleDateString()}</td>
                  <td className="p-4">{official.chairmanship}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        official.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {official.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-full hover:bg-gray-200 transition text-blue-600"
                        onClick={() => handleEditClick(official)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-gray-200 transition text-red-600"
                        onClick={() => handleDeleteClick(official)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No officials found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        totalEntries={officials.length}
        startEntry={startIndex + 1}
        endEntry={Math.min(endIndex, officials.length)}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={v => { setRowsPerPage(v); setCurrentPage(1); }}
        className="mt-2"
      />

      <div className="flex justify-end mt-6">
        <button 
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={20} />
          <span className="font-medium">Add Official</span>
        </button>
      </div>

      {/* Add Official Modal */}
      {isAddModalOpen && (
        <AddOfficialModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          newOfficial={newOfficial}
          handleAddOfficialChange={handleAddOfficialChange}
          handleAddOfficialSubmit={handleAddOfficialSubmit}
          handleSearchResident={handleSearchResident}
          searchResults={searchResults}
          handleSelectResident={handleSelectResident}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedOfficial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete official: <span className="font-bold">{selectedOfficial.resident.firstName} {selectedOfficial.resident.lastName}</span>?</p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Official Modal */}
      {isEditModalOpen && officialToEdit && (
        <EditOfficialModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          official={officialToEdit}
          onUpdate={handleUpdateOfficialSubmit}
        />
      )}

      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Error</h3>
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Message Modal */}
      {isMessageModalOpen && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          title={messageModalTitle}
          content={messageModalContent}
        />
      )}

      {/* View Official Details Modal */}
      {isViewModalOpen && selectedOfficialForView && (
        <ViewOfficialModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          official={selectedOfficialForView}
        />
      )}
    </DashboardPageContainer>
  );
};

export default OfficialsPage;


// Add Official Modal
const AddOfficialModal = ({ isOpen, onClose, newOfficial, handleAddOfficialChange, handleAddOfficialSubmit, handleSearchResident, searchResults, handleSelectResident }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Add New Official</h3>
                <p className="text-green-100 text-sm">Search and assign a resident as a barangay official</p>
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
          <form onSubmit={handleAddOfficialSubmit} className="space-y-8">
            
            {/* Resident Search Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-green-100 rounded-full p-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Search Resident</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>First Name</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={newOfficial.firstName}
                    onChange={handleAddOfficialChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Last Name</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={newOfficial.lastName}
                    onChange={handleAddOfficialChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleSearchResident}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Resident</span>
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults && searchResults.length > 0 && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {searchResults.map((resident, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                        onClick={() => handleSelectResident(resident)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`}
                            </p>
                            <p className="text-sm text-gray-500">ID: {resident.id}</p>
                          </div>
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Details Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-emerald-100 rounded-full p-2">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Official Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Position</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="position"
                    value={newOfficial.position}
                    onChange={handleAddOfficialChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Barangay Captain">Barangay Captain</option>
                    <option value="Barangay Kagawad">Barangay Kagawad</option>
                    <option value="SK Chairman">SK Chairman</option>
                    <option value="Barangay Secretary">Barangay Secretary</option>
                    <option value="Barangay Treasurer">Barangay Treasurer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Chairmanship
                  </label>
                  <select
                    name="chairmanship"
                    value={newOfficial.chairmanship}
                    onChange={handleAddOfficialChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="">Select Chairmanship</option>
                    <option value="Peace and Order">Peace and Order</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Youth and Sports">Youth and Sports</option>
                    <option value="Women and Family">Women and Family</option>
                    <option value="Finance">Finance</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Term Start</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="termStart"
                    value={newOfficial.termStart}
                    onChange={handleAddOfficialChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Term End</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="termEnd"
                    value={newOfficial.termEnd}
                    onChange={handleAddOfficialChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Status</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="status"
                    value={newOfficial.status}
                    onChange={handleAddOfficialChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
              onClick={handleAddOfficialSubmit}
              className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Official
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Official Modal (New Component)
const EditOfficialModal = ({ isOpen, onClose, official, onUpdate }) => {
  const [editedOfficial, setEditedOfficial] = useState({
    residentId: official.residentId,
    position: official.position,
    termStart: new Date(official.termStart).toISOString().split('T')[0],
    termEnd: new Date(official.termEnd).toISOString().split('T')[0],
    chairmanship: official.chairmanship,
    status: official.status,
  });
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Ensure the form is populated with the correct official data when the modal opens or official changes
    if (official) {
      setEditedOfficial({
        residentId: official.residentId,
        position: official.position,
        termStart: new Date(official.termStart).toISOString().split('T')[0],
        termEnd: new Date(official.termEnd).toISOString().split('T')[0],
        chairmanship: official.chairmanship,
        status: official.status,
      });
    }
  }, [official]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOfficial(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/officials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedOfficial),
      });
      if (res.ok) {
        console.log('Official updated successfully!');
        onClose();
        onUpdate(editedOfficial); // Refresh the list
      } else {
        const errorData = await res.json();
        if (errorData.error === "Position already taken") {
          setErrorMessage(errorData.message);
          setIsErrorModalOpen(true);
        } else {
          setErrorMessage(`Failed to update official: ${errorData.error}`);
          setIsErrorModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error updating official:', error);
      setErrorMessage('An error occurred while updating official.');
      setIsErrorModalOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Edit Official</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Resident ID:</label>
            <input type="text" value={editedOfficial.residentId} readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name:</label>
            <input
              type="text"
              value={`${official.resident.firstName} ${official.resident.middleName ? official.resident.middleName + ' ' : ''}${official.resident.lastName}`}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="editPosition" className="block text-gray-700 font-medium mb-1">Position:</label>
            <select
              id="editPosition"
              name="position"
              value={editedOfficial.position}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Position</option>
              <option value="Barangay Captain">Barangay Captain</option>
              <option value="Barangay Kagawad">Barangay Kagawad</option>
              <option value="Barangay Secretary">Barangay Secretary</option>
              <option value="Barangay Treasurer">Barangay Treasurer</option>
              <option value="SK Chairperson">SK Chairperson</option>
              <option value="SK Kagawad">SK Kagawad</option>
            </select>
          </div>
          <div>
            <label htmlFor="editTermStart" className="block text-gray-700 font-medium mb-1">Term Start:</label>
            <input
              type="date"
              id="editTermStart"
              name="termStart"
              value={editedOfficial.termStart}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="editTermEnd" className="block text-gray-700 font-medium mb-1">Term End:</label>
            <input
              type="date"
              id="editTermEnd"
              name="termEnd"
              value={editedOfficial.termEnd}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="editChairmanship" className="block text-gray-700 font-medium mb-1">Chairmanship:</label>
            <select
              id="editChairmanship"
              name="chairmanship"
              value={editedOfficial.chairmanship}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Chairmanship</option>
              <option value="Peace and Order">Peace and Order</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Youth and Sports">Youth and Sports</option>
              <option value="Women and Family">Women and Family</option>
              <option value="Finance">Finance</option>
              <option value="None">None</option>
            </select>
          </div>
          <div>
            <label htmlFor="editStatus" className="block text-gray-700 font-medium mb-1">Status:</label>
            <select
              id="editStatus"
              name="status"
              value={editedOfficial.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-3 rounded-lg shadow-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md"
            >
              Update Official
            </button>
          </div>
        </form>

        {/* Error Modal for Edit Official */}
        {isErrorModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Error</h3>
                <button
                  onClick={() => setIsErrorModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-700 mb-6">{errorMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsErrorModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Generic Message Modal Component
const MessageModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-700 mb-6">{content}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// View Official Modal Component
const ViewOfficialModal = ({ isOpen, onClose, official }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Official Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 text-gray-700 mb-6">
          <p><span className="font-semibold">ID:</span> {official.residentId}</p>
          <p><span className="font-semibold">Full Name:</span> {`${official.resident.firstName} ${official.resident.middleName ? official.resident.middleName + ' ' : ''}${official.resident.lastName}`}</p>
          <p><span className="font-semibold">Birthdate:</span> {new Date(official.resident.birthdate).toLocaleDateString()}</p>
          <p><span className="font-semibold">Position:</span> {official.position}</p>
          <p><span className="font-semibold">Term Start:</span> {new Date(official.termStart).toLocaleDateString()}</p>
          <p><span className="font-semibold">Term End:</span> {new Date(official.termEnd).toLocaleDateString()}</p>
          <p><span className="font-semibold">Chairmanship:</span> {official.chairmanship}</p>
          <p>
            <span className="font-semibold">Status:</span> 
            <span
              className={`px-2 py-1 text-xs rounded-full font-semibold ml-2 ${
                official.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {official.status}
            </span>
          </p>
          <p><span className="font-semibold">Date Added:</span> {new Date(official.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

