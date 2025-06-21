// officials/page.js
"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import Pagination from '@/components/ui/Pagination';

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
      const res = await fetch('/api/officials');
      const data = await res.json();
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
    <div className={`w-full font-sans ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Barangay Officials</h2>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full transition text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </div>
      </div>
      <div className="h-1 bg-red-500 w-full mb-6"></div>

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
    </div>
  );
};

export default OfficialsPage;


// Add Official Modal
const AddOfficialModal = ({ isOpen, onClose, newOfficial, handleAddOfficialChange, handleAddOfficialSubmit, handleSearchResident, searchResults, handleSelectResident }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <h3 className="text-xl font-bold mb-6 text-center">Add New Official</h3>
        <form onSubmit={handleAddOfficialSubmit} className="space-y-4">
          {/* Resident Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="searchFirstName" className="block text-sm font-medium text-gray-700">Search Resident First Name</label>
              <input
                type="text"
                id="searchFirstName"
                name="firstName"
                value={newOfficial.firstName}
                onChange={handleAddOfficialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                placeholder="Enter first name..."
                required
              />
            </div>
            <div>
              <label htmlFor="searchLastName" className="block text-sm font-medium text-gray-700">Search Resident Last Name</label>
              <input
                type="text"
                id="searchLastName"
                name="lastName"
                value={newOfficial.lastName}
                onChange={handleAddOfficialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                placeholder="Enter last name..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="searchBirthdate" className="block text-sm font-medium text-gray-700">Search Resident Birthdate (Optional)</label>
              <input
                type="date"
                id="searchBirthdate"
                name="birthdate"
                value={newOfficial.birthdate}
                onChange={handleAddOfficialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSearchResident}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-300"
          >
            Search Resident
          </button>

          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
              <h3 className="font-semibold mb-2">Search Results:</h3>
              {searchResults.map(resident => (
                <div key={resident.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSelectResident(resident)}
                >
                  <span>{`${resident.firstName} ${resident.lastName} (${new Date(resident.birthdate).toLocaleDateString()})`}</span>
                  <span className="text-sm text-blue-600">Select</span>
                </div>
              ))}
            </div>
          )}

          {newOfficial.residentId && (
            <div className="space-y-4 p-4 border border-blue-300 rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold">Selected Resident Details:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID:</label>
                  <input type="text" value={newOfficial.residentId} readOnly className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name:</label>
                  <input type="text" value={`${newOfficial.firstName} ${newOfficial.middleName ? newOfficial.middleName + ' ' : ''}${newOfficial.lastName}`} readOnly className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Birthdate:</label>
                  <input type="text" value={newOfficial.birthdate} readOnly className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {/* Official Specific Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
              <select
                id="position"
                name="position"
                value={newOfficial.position}
                onChange={handleAddOfficialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
              <label htmlFor="termStart" className="block text-sm font-medium text-gray-700">Term Start</label>
              <input
                type="date"
                id="termStart"
                name="termStart"
                value={newOfficial.termStart}
                onChange={handleAddOfficialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label htmlFor="termEnd" className="block text-sm font-medium text-gray-700">Term End</label>
              <input
                type="date"
                id="termEnd"
                name="termEnd"
                value={newOfficial.termEnd}
                onChange={handleAddOfficialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label htmlFor="chairmanship" className="block text-sm font-medium text-gray-700">Chairmanship</label>
              <select
                id="chairmanship"
                name="chairmanship"
                value={newOfficial.chairmanship}
                onChange={handleAddOfficialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
            <div className="md:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={newOfficial.status}
                onChange={handleAddOfficialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Add Official
            </button>
          </div>
        </form>
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

