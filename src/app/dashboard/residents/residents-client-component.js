"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Plus, Search, Upload } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

// Utility function to calculate age from birthdate
const calculateAge = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function ResidentsClientComponent({ initialResidents }) {
  const [residents, setResidents] = useState(initialResidents);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResidentForView, setSelectedResidentForView] = useState(null);

  // Function to re-fetch data (for CRUD operations)
  const refreshResidents = async () => {
    const res = await fetch('/api/residents');
    const data = await res.json();
    setResidents(data);
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

  const filteredResidents = residents.filter(resident => {
    const residentAge = calculateAge(resident.birthdate);

    const fullName = `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`;

    const matchesSearch = 
      fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      resident.id.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case "senior":
        return residentAge >= 60;
      case "voters":
        return resident.voterStatus === "Registered";
      case "non-voters":
        return resident.voterStatus !== "Registered";
      case "minors":
        return residentAge < 18;
      case "head-household":
        return true; 
      case "no-education":
        return true; 
      case "elementary":
        return true; 
      case "high-school":
        return true; 
      case "college":
        return true; 
      default:
        return true;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredResidents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentResidents = filteredResidents.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const filterOptions = [
    { label: "Filter By", value: "" },
    { label: "Senior Citizens", value: "senior" },
    { label: "Voters", value: "voters" },
    { label: "Non-Voters", value: "non-voters" },
    { label: "Minors", value: "minors" },
    { label: "Head of Household", value: "head-household" },
    { label: "No Formal Education", value: "no-education" },
    { label: "Elementary", value: "elementary" },
    { label: "High School", value: "high-school" },
    { label: "College", value: "college" },
  ];

  // Add Resident Modal State and Handlers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [newResident, setNewResident] = useState({
    firstName: '', middleName: '', lastName: '',
    birthdate: '', civilStatus: '', gender: '', voterStatus: ''
  });

  const handleAddResidentChange = (e) => {
    const { name, value } = e.target;
    console.log(`[Add Resident] Input changed: ${name}, Value: ${value}`);
    const newValue = (name === 'firstName' || name === 'middleName' || name === 'lastName') ? value.toUpperCase() : value;
    console.log(`[Add Resident] New value after capitalization: ${newValue}`);
    setNewResident(prev => {
      const updatedResident = {
        ...prev,
        [name]: newValue
      };
      console.log("[Add Resident] Updated newResident state:", updatedResident);
      return updatedResident;
    });
  };

  const handleUpdateResidentChange = (e) => {
    const { name, value } = e.target;
    console.log(`[Update Resident] Input changed: ${name}, Value: ${value}`);
    const newValue = (name === 'firstName' || name === 'middleName' || name === 'lastName') ? value.toUpperCase() : value;
    console.log(`[Update Resident] New value after capitalization: ${newValue}`);
    setSelectedResident(prev => {
      const updatedResident = {
        ...prev,
        [name]: newValue
      };
      console.log("[Update Resident] Updated selectedResident state:", updatedResident);
      return updatedResident;
    });
  };

  const handleAddResidentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResident),
      });
      if (res.ok) {
        console.log('Resident added successfully!');
        setIsAddModalOpen(false);
        setNewResident({ firstName: '', middleName: '', lastName: '', birthdate: '', civilStatus: '', gender: '', voterStatus: '' });
        refreshResidents();
      } else {
        const errorData = await res.json();
        alert(`Failed to add resident: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding resident:', error);
      alert('An error occurred while adding resident.');
    }
  };

  const handleUpdateResidentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/residents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedResident),
      });
      if (res.ok) {
        console.log('Resident updated successfully!');
        setIsUpdateModalOpen(false);
        setSelectedResident(null);
        refreshResidents();
      } else {
        const errorData = await res.json();
        alert(`Failed to update resident: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating resident:', error);
      alert('An error occurred while updating resident.');
    }
  };

  const handleEditClick = (resident) => {
    setSelectedResident({
      ...resident,
      birthdate: new Date(resident.birthdate).toISOString().split('T')[0] // Format date for input
    });
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (resident) => {
    setResidentToDelete(resident);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch('/api/residents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: residentToDelete.id }),
      });

      if (res.ok) {
        console.log('Resident deleted successfully!');
        setIsDeleteModalOpen(false);
        setResidentToDelete(null);
        refreshResidents();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete resident: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting resident:', error);
      alert('An error occurred while deleting resident.');
    }
  };

  const handleRowClick = (resident) => {
    setSelectedResidentForView(resident);
    setIsViewModalOpen(true);
  };

  return (
    <div className="w-full font-sans text-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-center">Resident Records</h2>
      <div className="h-1 bg-red-500 w-full mb-6"></div>

      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Add Button */}
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} /> Add Resident
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
            placeholder="Search resident..."
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

        {/* Choose File */}
        <label className="bg-gray-100 px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-200">
          <input
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          Choose File
        </label>

        {/* File Preview */}
        {selectedFile && (
          <span className="text-sm text-gray-700 truncate max-w-[200px]">
            {selectedFile.name}
          </span>
        )}

        {/* Batch Upload */}
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Upload size={18} /> Batch Upload
        </button>

        {/* Filter Dropdown (Custom) */}
        <CustomSelect
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          placeholder="Filter By"
        />
      </div>

      {/* Resident Table */}
      <div className="w-full overflow-auto rounded-xl shadow border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">Unique ID</th>
              <th className="p-4 text-left font-semibold">Full Name</th>
              <th className="p-4 text-left font-semibold">Age</th>
              <th className="p-4 text-left font-semibold">Civil Status</th>
              <th className="p-4 text-left font-semibold">Gender</th>
              <th className="p-4 text-left font-semibold">Voter Status</th>
              <th className="p-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentResidents.map((resident) => (
              <tr
                key={resident.id}
                className="hover:bg-green-50 transition-colors border-t border-gray-100 cursor-pointer"
                onClick={() => handleRowClick(resident)}
              >
                <td className="p-4">{resident.id}</td>
                <td className="p-4">{`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`}</td>
                <td className="p-4">{calculateAge(resident.birthdate)}</td>
                <td className="p-4">{resident.civilStatus}</td>
                <td className="p-4">{resident.gender}</td>
                <td className="p-4">{resident.voterStatus}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 transition text-blue-600"
                      onClick={() => handleEditClick(resident)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-gray-200 transition text-red-600"
                      onClick={() => handleDeleteClick(resident)}
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
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
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
              Showing {startIndex + 1}-{Math.min(endIndex, filteredResidents.length)} of {filteredResidents.length} entries
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
              {[...Array(totalPages)].map((_, index) => {
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

      {/* Add Resident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-6 text-center">Add New Resident</h3>
            <form onSubmit={handleAddResidentSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={newResident.firstName}
                  onChange={handleAddResidentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                  required
                />
              </div>
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle Name"
                  value={newResident.middleName}
                  onChange={handleAddResidentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={newResident.lastName}
                  onChange={handleAddResidentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                  required
                />
              </div>
              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">Birthdate</label>
                <input type="date" id="birthdate" name="birthdate" value={newResident.birthdate} onChange={handleAddResidentChange} required
                       className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="civilStatus" className="block text-sm font-medium text-gray-700">Civil Status</label>
                <select id="civilStatus" name="civilStatus" value={newResident.civilStatus} onChange={handleAddResidentChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white">
                  <option value="">Select Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                <select id="gender" name="gender" value={newResident.gender} onChange={handleAddResidentChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label htmlFor="voterStatus" className="block text-sm font-medium text-gray-700">Voter Status</label>
                <select id="voterStatus" name="voterStatus" value={newResident.voterStatus} onChange={handleAddResidentChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white">
                  <option value="">Select Voter Status</option>
                  <option value="Registered">Registered</option>
                  <option value="Not Registered">Not Registered</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                <button type="submit"
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Add Resident</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Resident Modal */}
      {isUpdateModalOpen && selectedResident && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-6 text-center">Update Resident</h3>
            <form onSubmit={handleUpdateResidentSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={selectedResident.firstName}
                  onChange={handleUpdateResidentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                  required
                />
              </div>
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle Name"
                  value={selectedResident.middleName || ''}
                  onChange={handleUpdateResidentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={selectedResident.lastName}
                  onChange={handleUpdateResidentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                  required
                />
              </div>
              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">Birthdate</label>
                <input type="date" id="birthdate" name="birthdate" value={selectedResident.birthdate} onChange={handleUpdateResidentChange} required
                       className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="civilStatus" className="block text-sm font-medium text-gray-700">Civil Status</label>
                <select id="civilStatus" name="civilStatus" value={selectedResident.civilStatus} onChange={handleUpdateResidentChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white">
                  <option value="">Select Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                <select id="gender" name="gender" value={selectedResident.gender} onChange={handleUpdateResidentChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label htmlFor="voterStatus" className="block text-sm font-medium text-gray-700">Voter Status</label>
                <select id="voterStatus" name="voterStatus" value={selectedResident.voterStatus} onChange={handleUpdateResidentChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white">
                  <option value="">Select Voter Status</option>
                  <option value="Registered">Registered</option>
                  <option value="Not Registered">Not Registered</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                <button type="submit"
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Update Resident</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && residentToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-center">Delete Resident</h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete {residentToDelete.firstName} {residentToDelete.lastName}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setResidentToDelete(null);
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

      {/* View Resident Details Modal */}
      {isViewModalOpen && selectedResidentForView && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Resident Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unique ID</p>
                  <p className="mt-1">{selectedResidentForView.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="mt-1">{`${selectedResidentForView.firstName} ${selectedResidentForView.middleName ? selectedResidentForView.middleName + ' ' : ''}${selectedResidentForView.lastName}`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="mt-1">{calculateAge(selectedResidentForView.birthdate)} years old</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Birthdate</p>
                  <p className="mt-1">{new Date(selectedResidentForView.birthdate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Civil Status</p>
                  <p className="mt-1">{selectedResidentForView.civilStatus}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="mt-1">{selectedResidentForView.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Voter Status</p>
                  <p className="mt-1">{selectedResidentForView.voterStatus}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date Added</p>
                  <p className="mt-1">{new Date(selectedResidentForView.createdAt).toLocaleDateString()}</p>
                </div>
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
    </div>
  );
} 