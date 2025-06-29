"use client";

import { useRef, useState, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, Plus, Search, Upload, Eye } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { ViewResidentModal } from '@/components/residents/ViewResidentModal';
import { EditResidentModal } from '@/components/residents/EditResidentModal';
import { DeleteResidentModal } from '@/components/residents/DeleteResidentModal';
import { toast } from "react-hot-toast";
import Pagination from '@/components/ui/Pagination';
import { formatContactNumberDisplay } from '@/components/ui/ContactNumberInput';

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
  const [residents, setResidents] = useState(initialResidents || []);
  const [filteredResidents, setFilteredResidents] = useState(initialResidents || []);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResidentForView, setSelectedResidentForView] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const debounceTimeout = useRef(null);

  // Function to re-fetch data (for CRUD operations)
  const refreshResidents = async () => {
    const res = await fetch('/api/residents');
    const data = await res.json();
    setResidents(data);
    setFilteredResidents(data);
  };

  const fetchSearchResults = async (query) => {
    const res = await fetch(`/api/residents/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setFilteredResidents(data);
    setCurrentPage(1);
  };
  

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
  
    if (value.trim()) {
      const keyword = value.toLowerCase();
      const filtered = residents.filter(r => {
        // Check all relevant fields
        const fields = [
          r.firstName,
          r.middleName,
          r.lastName,
          r.suffix,
          r.id,
          r.address,
          r.gender,
          r.voterStatus,
          r.maritalStatus,
          r.occupation,
          r.citizenship,
          r.educationalAttainment,
          r.contactNumber,
          r.email
        ];
        // Concatenate all fields into one string
        const haystack = fields.filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(keyword);
      });
      setFilteredResidents(filtered);
      setCurrentPage(1);
    } else {
      setFilteredResidents(residents);
      setCurrentPage(1);
    }
  };
  
  

  

  // Clear search and show all residents
  const clearSearch = () => {
    setSearchText("");
    setFilteredResidents(residents);
    setCurrentPage(1);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
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

  

  // Calculate pagination
  const totalPages = Math.ceil(filteredResidents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentResidents = filteredResidents.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
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
  const [newResident, setNewResident] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    address: '',
    birthdate: '',
    birthplace: '',
    citizenship: '',
    gender: '',
    voterStatus: '',
    maritalStatus: '',
    employmentStatus: '',
    educationalAttainment: '',
    occupation: '',
    contactNumber: '',
    email: '',
    isTUPAD: false,
    isPWD: false,
    is4Ps: false,
    isSoloParent: false
  });

  const handleAddResidentChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'contactNumber') {
      // Format contact number as user types
      const numbers = value.replace(/\D/g, '');
      let formatted = '';
      
      if (numbers.length > 11) {
        return; // Don't allow more than 11 digits
      }
      
      if (numbers.length > 0) {
        if (numbers.length <= 4) {
          formatted = numbers;
        } else if (numbers.length <= 7) {
          formatted = `${numbers.substring(0, 4)} ${numbers.substring(4)}`;
        } else {
          formatted = `${numbers.substring(0, 4)} ${numbers.substring(4, 7)} ${numbers.substring(7, 11)}`;
        }
      }
      
      setNewResident({ ...newResident, [name]: formatted });
    } else if (type === 'text' && name !== 'email') {
      // Force uppercase for text inputs except email and contactNumber
      setNewResident({ ...newResident, [name]: value.toUpperCase() });
    } else {
      setNewResident({ ...newResident, [name]: value });
    }
  };

  const handleClearForm = () => {
    setNewResident({
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      address: '',
      birthdate: '',
      birthplace: '',
      citizenship: '',
      gender: '',
      voterStatus: '',
      maritalStatus: '',
      employmentStatus: '',
      educationalAttainment: '',
      occupation: '',
      contactNumber: '',
      email: '',
      isTUPAD: false,
      isPWD: false,
      is4Ps: false,
      isSoloParent: false
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
        setNewResident({
          firstName: '',
          middleName: '',
          lastName: '',
          suffix: '',
          address: '',
          birthdate: '',
          birthplace: '',
          citizenship: '',
          gender: '',
          voterStatus: '',
          maritalStatus: '',
          employmentStatus: '',
          educationalAttainment: '',
          occupation: '',
          contactNumber: '',
          email: '',
          isTUPAD: false,
          isPWD: false,
          is4Ps: false,
          isSoloParent: false
        });
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
    setSelectedResident(resident);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch('/api/residents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedResident.id }),
      });

      if (res.ok) {
        console.log('Resident deleted successfully!');
        setShowDeleteModal(false);
        setSelectedResident(null);
        refreshResidents();
        toast.success('Resident deleted successfully');
      } else {
        const errorData = await res.json();
        toast.error(`Failed to delete resident: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting resident:', error);
      toast.error('An error occurred while deleting resident.');
    }
  };

  const handleRowClick = (resident) => {
    setSelectedResidentForView(resident);
    setIsViewModalOpen(true);
  };

  const handleViewResident = (resident) => {
    setSelectedResident(resident);
    setShowViewModal(true);
  };

  const handleEditResident = (resident) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  const handleDeleteResident = async (residentId) => {
    try {
      const response = await fetch(`/api/residents/${residentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete resident');
      }

      await refreshResidents();
      setShowDeleteModal(false);
      setSelectedResident(null);
      toast.success('Resident deleted successfully');
    } catch (error) {
      console.error('Error deleting resident:', error);
      toast.error('Failed to delete resident');
    }
  };

  const handleUpdateResident = async (residentId, formData) => {
    try {
      const response = await fetch(`/api/residents/${residentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update resident');
      }

      await refreshResidents();
      setShowEditModal(false);
      setSelectedResident(null);
      toast.success('Resident updated successfully');
    } catch (error) {
      console.error('Error updating resident:', error);
      toast.error('Failed to update resident');
    }
  };

  return (
    <div className="w-full font-sans text-gray-900 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Resident Records</h2>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full transition text-gray-600 hover:text-gray-900"
          >
            {/* Filter icon SVG, width=20, height=20 */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </div>
      </div>
      <div className="h-1 bg-green-600 w-full mb-6 rounded"></div>

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
          <input
            type="text"
            placeholder="Search resident..."
            value={searchText}
            onChange={handleSearchChange}            
            className="border pl-10 pr-10 py-2 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
          {searchText && (
            <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>        

        {/* Filter Dropdown (Custom) */}
        <CustomSelect
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          placeholder="Filter By"
        />
      </div>

      {/* Resident Table and Pagination in a single container */}
      <div>
        <div className="w-full overflow-auto rounded-xl shadow border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-4 text-left font-semibold">Unique ID</th>
                <th className="p-4 text-left font-semibold">Full Name</th>
                <th className="p-4 text-left font-semibold">Age</th>
                <th className="p-4 text-left font-semibold">Marital Status</th>
                <th className="p-4 text-left font-semibold">Gender</th>
                <th className="p-4 text-left font-semibold">Voter Status</th>
                <th className="p-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentResidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">No residents found.</td>
                </tr>
              ) : (
                currentResidents.map((resident) => (
                  <tr
                    key={resident.id}
                    className="hover:bg-green-50 transition-colors border-t border-gray-100"
                  >
                    <td className="p-4">{resident.id}</td>
                    <td className="p-4">{`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`}</td>
                    <td className="p-4">{calculateAge(resident.birthdate)}</td>
                    <td className="p-4">{resident.maritalStatus}</td>
                    <td className="p-4">{resident.gender}</td>
                    <td className="p-4">{resident.voterStatus}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-full hover:bg-gray-200 transition text-blue-600"
                          onClick={() => handleViewResident(resident)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-gray-200 transition text-green-600"
                          onClick={() => handleEditResident(resident)}
                          title="Edit Resident"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-gray-200 transition text-red-600"
                          onClick={() => handleDeleteResident(resident)}
                          title="Delete Resident"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
          totalEntries={filteredResidents.length}
          startEntry={startIndex + 1}
          endEntry={Math.min(endIndex, filteredResidents.length)}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          className="mt-2"
        />
      </div>

      {/* Add Resident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl overflow-y-auto relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6">Add New Resident</h2>
            <form onSubmit={handleAddResidentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Required Fields */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
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
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
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
                  <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">Suffix</label>
                  <input
                    type="text"
                    name="suffix"
                    placeholder="e.g., Jr., Sr., III"
                    value={newResident.suffix}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 uppercase"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Complete Address"
                    value={newResident.address}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">Birthdate *</label>
                  <input
                    type="date"
                    name="birthdate"
                    value={newResident.birthdate}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="birthplace" className="block text-sm font-medium text-gray-700">Birthplace *</label>
                  <input
                    type="text"
                    name="birthplace"
                    placeholder="Place of Birth"
                    value={newResident.birthplace}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="citizenship" className="block text-sm font-medium text-gray-700">Citizenship *</label>
                  <input
                    type="text"
                    name="citizenship"
                    placeholder="Citizenship"
                    value={newResident.citizenship}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender *</label>
                  <select
                    name="gender"
                    value={newResident.gender}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="voterStatus" className="block text-sm font-medium text-gray-700">Voter Status *</label>
                  <select
                    name="voterStatus"
                    value={newResident.voterStatus}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Voter Status</option>
                    <option value="Registered">Registered</option>
                    <option value="Not Registered">Not Registered</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">Marital Status *</label>
                  <select
                    name="maritalStatus"
                    value={newResident.maritalStatus}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>

                {/* Optional Fields */}
                <div>
                  <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700">Employment Status</label>
                  <select
                    name="employmentStatus"
                    value={newResident.employmentStatus}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Employment Status</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="educationalAttainment" className="block text-sm font-medium text-gray-700">Educational Attainment</label>
                  <select
                    name="educationalAttainment"
                    value={newResident.educationalAttainment}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Educational Attainment</option>
                    <option value="No Formal Education">No Formal Education</option>
                    <option value="Elementary">Elementary</option>
                    <option value="High School">High School</option>
                    <option value="Vocational">Vocational</option>
                    <option value="College">College</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    placeholder="Occupation"
                    value={newResident.occupation}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="0921 234 5678"
                    value={newResident.contactNumber}
                    onChange={handleAddResidentChange}
                    onKeyDown={(e) => {
                      // Allow backspace, delete, tab, escape, enter, arrow keys
                      if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                        (e.keyCode === 65 && e.ctrlKey === true) ||
                        (e.keyCode === 67 && e.ctrlKey === true) ||
                        (e.keyCode === 86 && e.ctrlKey === true) ||
                        (e.keyCode === 88 && e.ctrlKey === true) ||
                        // Allow home, end
                        (e.keyCode >= 35 && e.keyCode <= 36)) {
                        return;
                      }
                      // Ensure that it is a number and stop the keypress
                      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                      }
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={newResident.email}
                    onChange={handleAddResidentChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Special Programs */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isTUPAD"
                        checked={newResident.isTUPAD}
                        onChange={(e) => setNewResident(prev => ({ ...prev, isTUPAD: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isTUPAD" className="ml-2 block text-sm text-gray-700">TUPAD</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPWD"
                        checked={newResident.isPWD}
                        onChange={(e) => setNewResident(prev => ({ ...prev, isPWD: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPWD" className="ml-2 block text-sm text-gray-700">PWD</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is4Ps"
                        checked={newResident.is4Ps}
                        onChange={(e) => setNewResident(prev => ({ ...prev, is4Ps: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is4Ps" className="ml-2 block text-sm text-gray-700">4Ps</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isSoloParent"
                        checked={newResident.isSoloParent}
                        onChange={(e) => setNewResident(prev => ({ ...prev, isSoloParent: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isSoloParent" className="ml-2 block text-sm text-gray-700">Solo Parent</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Resident
                </button>
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
                <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select id="maritalStatus" name="maritalStatus" value={selectedResident.maritalStatus} onChange={handleUpdateResidentChange} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500 bg-white">
                  <option value="">Select Marital Status</option>
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

      {/* View Resident Details Modal */}
      {isViewModalOpen && selectedResidentForView && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Resident Information</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Unique ID</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="mt-1 text-gray-900">
                      {`${selectedResidentForView.firstName} ${selectedResidentForView.middleName ? selectedResidentForView.middleName + ' ' : ''}${selectedResidentForView.lastName}${selectedResidentForView.suffix ? ' ' + selectedResidentForView.suffix : ''}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Age</p>
                    <p className="mt-1 text-gray-900">{calculateAge(selectedResidentForView.birthdate)} years old</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Birthdate</p>
                    <p className="mt-1 text-gray-900">{new Date(selectedResidentForView.birthdate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Birthplace</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.birthplace}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Citizenship</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.citizenship}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Marital Status</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.maritalStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Voter Status</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.voterStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.address}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employment Status</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.employmentStatus || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Educational Attainment</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.educationalAttainment || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Occupation</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.occupation || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                    <p className="mt-1 text-gray-900">{formatContactNumberDisplay(selectedResidentForView.contactNumber) || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-gray-900">{selectedResidentForView.email || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Special Programs */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Special Programs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${selectedResidentForView.isTUPAD ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-900">TUPAD</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${selectedResidentForView.isPWD ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-900">PWD</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${selectedResidentForView.is4Ps ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-900">4Ps</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${selectedResidentForView.isSoloParent ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-900">Solo Parent</span>
                  </div>
                </div>
              </div>

              {/* Record Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Record Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date Added</p>
                    <p className="mt-1 text-gray-900">{new Date(selectedResidentForView.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="mt-1 text-gray-900">{new Date(selectedResidentForView.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showViewModal && (
        <ViewResidentModal
          resident={selectedResident}
          onClose={() => {
            setShowViewModal(false);
            setSelectedResident(null);
          }}
        />
      )}

      {showEditModal && (
        <EditResidentModal
          resident={selectedResident}
          onClose={() => {
            setShowEditModal(false);
            setSelectedResident(null);
          }}
          onUpdate={handleUpdateResident}
        />
      )}

      {showDeleteModal && (
        <DeleteResidentModal
          resident={selectedResident}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedResident(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
} 