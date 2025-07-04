"use client";

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Home, User, MapPin, Phone, Search, Plus, Users, CheckCircle, Calendar, Key } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ContactNumberInput, cleanContactNumber, formatContactNumberDisplay } from '../ui/ContactNumberInput';

// Add Member Modal Component
function AddMemberModal({ isOpen = false, onClose, onAddMember, selectedHead, members = [] }) {
  const [searchType, setSearchType] = useState('id'); // 'id' or 'name'
  const [searchData, setSearchData] = useState({
    uniqueId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearSearch();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    // Don't search if no search criteria
    if (searchType === 'id' && !searchData.uniqueId.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchType === 'name' && !searchData.firstName.trim() && !searchData.lastName.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      
      if (searchType === 'id') {
        params.append('uniqueId', searchData.uniqueId);
      } else {
        if (searchData.firstName) params.append('firstName', searchData.firstName);
        if (searchData.middleName) params.append('middleName', searchData.middleName);
        if (searchData.lastName) params.append('lastName', searchData.lastName);
      }

      const response = await fetch(`/api/residents/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch residents');
      }
      
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for residents');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchData, searchType]);

  const clearSearch = () => {
    setSearchData({
      uniqueId: '',
      firstName: '',
      middleName: '',
      lastName: '',
      birthdate: ''
    });
    setSearchResults([]);
  };

  const handleSelectResident = (resident) => {
    // Add the resident to the household members list
    onAddMember(resident);
    clearSearch();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium mb-4">
                  Add Household Member
                </Dialog.Title>

                {/* Search Type Selection */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="id"
                        checked={searchType === 'id'}
                        onChange={(e) => {
                          setSearchType(e.target.value);
                          clearSearch();
                        }}
                        className="mr-2"
                      />
                      <span>Search by ID</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="name"
                        checked={searchType === 'name'}
                        onChange={(e) => {
                          setSearchType(e.target.value);
                          clearSearch();
                        }}
                        className="mr-2"
                      />
                      <span>Search by Name</span>
                    </label>
                  </div>
                </div>

                {/* Search Form */}
                <div className="mb-4">
                  {searchType === 'id' ? (
                    <div>
                      <input
                        type="text"
                        value={searchData.uniqueId}
                        onChange={(e) => setSearchData({ ...searchData, uniqueId: e.target.value })}
                        placeholder="Enter Resident ID"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={searchData.firstName}
                        onChange={(e) => setSearchData({ ...searchData, firstName: e.target.value })}
                        placeholder="First Name"
                        className="p-2 border rounded"
                      />
                      <input
                        type="text"
                        value={searchData.lastName}
                        onChange={(e) => setSearchData({ ...searchData, lastName: e.target.value })}
                        placeholder="Last Name"
                        className="p-2 border rounded"
                      />
                      <input
                        type="text"
                        value={searchData.middleName}
                        onChange={(e) => setSearchData({ ...searchData, middleName: e.target.value })}
                        placeholder="Middle Name"
                        className="p-2 border rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                <div className="max-h-60 overflow-y-auto mb-4">
                  {isSearching ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((resident) => (
                        <button
                          key={resident.uniqueId}
                          onClick={() => handleSelectResident(resident)}
                          className="w-full p-3 text-left border rounded hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">
                              {resident.firstName} {resident.middleName} {resident.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {resident.uniqueId}
                            </div>
                          </div>
                          <div className="text-blue-500 hover:text-blue-600">
                            <Plus className="h-5 w-5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {searchType === 'id' && searchData.uniqueId || 
                       searchType === 'name' && (searchData.firstName || searchData.lastName) 
                        ? 'No residents found'
                        : 'Enter search criteria'}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function AddHouseholdModal({ isOpen = false, onClose, onSubmit }) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const [isSearchingHead, setIsSearchingHead] = useState(false);
  const [headSearchResults, setHeadSearchResults] = useState([]);
  const [headSearchTerm, setHeadSearchTerm] = useState('');
  const [selectedHead, setSelectedHead] = useState(null);
  const [members, setMembers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleClose = () => {
    // Clear all form data
    reset();
    setSelectedHead(null);
    setMembers([]);
    setHeadSearchResults([]);
    onClose();
  };

  const checkResidentHouseholdStatus = async (uniqueId) => {
    try {
      const response = await fetch(`/api/residents/household-status?uniqueId=${encodeURIComponent(uniqueId)}`);
      if (!response.ok) {
        throw new Error('Failed to check resident household status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking resident household status:', error);
      throw error;
    }
  };

  const handleHeadSelect = async (resident) => {
    try {
      // Check if resident is already in a household
      const status = await checkResidentHouseholdStatus(resident.uniqueId);
      if (status.isInHousehold) {
        toast.error(`This resident is already a ${status.role} in household ${status.householdId} and cannot be added again.`);
        return;
      }

      // Format contact number if it exists
      let formattedContactNumber = '';
      if (resident.contactNumber) {
        // Remove any non-digit characters
        const digits = resident.contactNumber.replace(/\D/g, '');
        // Format as "09XX XXX XXXX"
        if (digits.length === 11) {
          formattedContactNumber = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
        } else {
          formattedContactNumber = resident.contactNumber;
        }
      }

      // Update form data with head information
      setValue('headOfHousehold', resident.uniqueId);
      setValue('address', resident.address || '');
      setValue('contactNumber', formattedContactNumber);
      setSelectedHead(resident);
      setHeadSearchResults([]); // Clear search results
      setHeadSearchTerm(''); // Clear search term
    } catch (error) {
      console.error('Error selecting head of household:', error);
      toast.error('Failed to select head of household');
    }
  };

  const handleAddMember = async (resident) => {
    try {
      // Don't allow adding the head as a member
      if (selectedHead && resident.uniqueId === selectedHead.uniqueId) {
        toast.error('The head of household cannot be added as a member');
        return;
      }

      // Check if resident is already in a household
      const status = await checkResidentHouseholdStatus(resident.uniqueId);
      if (status.isInHousehold) {
        toast.error(`This resident is already a ${status.role} in household ${status.householdId} and cannot be added again.`);
        return;
      }

      // Check if resident is already in the current members list
      if (members.some(m => m.uniqueId === resident.uniqueId)) {
        toast.error('This resident is already added as a member');
        return;
      }

      // Add the resident to members list
      setMembers([...members, resident]);
      setValue('members', [...members.map(m => m.uniqueId), resident.uniqueId]);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    }
  };

  // Function to handle form submission
  const handleFormSubmit = async (data) => {
    if (!selectedHead) {
      toast.error('Please select a head of household');
      return;
    }

    setIsSubmitting(true);
    try {
      // Final validation check for head
      const headStatus = await checkResidentHouseholdStatus(selectedHead.uniqueId);
      if (headStatus.isInHousehold) {
        toast.error(`The selected head is already a ${headStatus.role} of household ${headStatus.householdId}. Please select a different resident.`);
        return;
      }

      // Final validation check for all members
      for (const member of members) {
        const memberStatus = await checkResidentHouseholdStatus(member.uniqueId);
        if (memberStatus.isInHousehold) {
          toast.error(`Member ${member.firstName} ${member.lastName} is already a ${memberStatus.role} of household ${memberStatus.householdId}. Please remove them and try again.`);
          return;
        }
      }

      const householdData = {
        ...data,
        headOfHousehold: selectedHead.uniqueId,
        members: members.map(m => m.uniqueId),
        totalMembers: members.length + 1, // Head + members
      };

      await onSubmit(householdData);
      handleClose();
      toast.success('Household added successfully');
    } catch (error) {
      console.error('Error submitting household:', error);
      toast.error('Failed to add household');
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchHeadOfHousehold = async (searchTerm) => {
    setHeadSearchTerm(searchTerm);
    
    if (!searchTerm.trim()) {
      setHeadSearchResults([]);
      return;
    }

    setIsSearchingHead(true);
    try {
      const response = await fetch(`/api/residents/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (response.ok) {
        setHeadSearchResults(data.data || []);
      } else {
        toast.error('Error searching residents');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching residents');
    } finally {
      setIsSearchingHead(false);
    }
  };

  // Add click outside handler for head search results
  const headSearchRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (headSearchRef.current && !headSearchRef.current.contains(event.target)) {
        setHeadSearchResults([]);
        setHeadSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const removeMember = (memberId) => {
    setMembers(members.filter(m => m.uniqueId !== memberId));
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-teal-600/20"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Home className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <Dialog.Title className="text-2xl font-bold text-white">
                            Add New Household
                          </Dialog.Title>
                          <p className="text-green-100 text-sm">Fill in the information below to register a new household</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                        onClick={handleClose}
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                      
                      {/* Household Information Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center space-x-2 mb-6">
                          <div className="bg-green-100 rounded-full p-2">
                            <Home className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Household Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 text-left">
                              <span>Ownership Type</span>
                              <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select
                              {...register('ownershipType', { required: 'Ownership type is required' })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            >
                              <option value="">Select Ownership Type</option>
                              <option value="OWNED">OWNED</option>
                              <option value="RENT">RENT</option>
                              <option value="MORTGAGED">MORTGAGED</option>
                              <option value="INFORMAL">INFORMAL</option>
                            </select>
                            {errors.ownershipType && (
                              <p className="text-sm text-red-600 flex items-center space-x-1">
                                <span>⚠</span>
                                <span>{errors.ownershipType.message}</span>
                              </p>
                            )}
                          </div>

                          {/* Display current ownership type as a badge if selected */}
                          {watch('ownershipType') && (
                            <div className="col-span-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${ownershipTypeBadgeColors[watch('ownershipType')]}`}>
                                {ownershipTypeLabels[watch('ownershipType')]}
                              </span>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 text-left">
                              <span>Head of Household</span>
                              <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative" ref={headSearchRef}>
                              <input
                                type="text"
                                placeholder="Search for resident..."
                                onChange={(e) => searchHeadOfHousehold(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                              />
                              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              
                              {/* Search Results Dropdown */}
                              {headSearchResults.length > 0 && (
                                <div className="absolute w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 divide-y max-h-60 overflow-y-auto z-10">
                                  {headSearchResults.map((resident) => (
                                    <button
                                      key={resident.uniqueId}
                                      type="button"
                                      onClick={() => handleHeadSelect(resident)}
                                      className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">
                                          {resident.firstName} {resident.middleName} {resident.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">ID: {resident.uniqueId}</div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Selected Head Display */}
                            {selectedHead && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex flex-col gap-1">
                                  <div className="font-bold text-green-800 text-base">
                                    {selectedHead.firstName} {selectedHead.middleName} {selectedHead.lastName}
                                  </div>
                                  <div className="flex flex-row items-center gap-4 text-xs text-green-700 mt-1">
                                    <span className="flex items-center gap-1">
                                      <User className="h-4 w-4 text-green-400" />
                                      <span className="font-medium">ID:</span> {selectedHead.uniqueId || selectedHead.id}
                                    </span>
                                    <span className="h-3 w-px bg-green-200 mx-1" />
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4 text-green-400" />
                                      <span className="font-medium">Born:</span> {selectedHead.birthdate ? new Date(selectedHead.birthdate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase() : 'N/A'}
                                    </span>
                                    <span className="h-3 w-px bg-green-200 mx-1" />
                                    <span className="flex items-center gap-1">
                                      <User className="h-4 w-4 text-green-400" />
                                      <span className="font-medium">Age:</span> {selectedHead.birthdate ? Math.floor((new Date() - new Date(selectedHead.birthdate)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedHead(null);
                                    setValue('address', '');
                                    setValue('contactNumber', '');
                                  }}
                                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 text-left">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              <span>Address</span>
                              <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                              {...register('address', { required: 'Address is required' })}
                              rows={1}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                              placeholder="Enter complete address"
                            />
                            {errors.address && (
                              <p className="text-sm text-red-600 flex items-center space-x-1">
                                <span>⚠</span>
                                <span>{errors.address.message}</span>
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <ContactNumberInput
                              register={register}
                              errors={errors}
                              name="contactNumber"
                              label="Contact Number"
                              required={false}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                              placeholder="Enter contact number"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Household Members Section */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-2">
                            <div className="bg-purple-100 rounded-full p-2">
                              <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Household Members</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddMemberModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Member
                          </button>
                        </div>
                        
                        {/* Members List */}
                        <div className="space-y-3">
                          {members.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p>No members added yet</p>
                              <p className="text-sm">Click "Add Member" to add household members</p>
                            </div>
                          ) : (
                            members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-lg mb-1"
                              >
                                <div>
                                  <div className="font-bold text-green-800 text-base">
                                    {member.firstName} {member.middleName} {member.lastName}
                                  </div>
                                  <div className="flex flex-row items-center gap-4 text-xs text-green-700 mt-1">
                                    <span className="flex items-center gap-1">
                                      <User className="h-4 w-4 text-green-400" />
                                      <span className="font-medium">ID:</span> {member.uniqueId || member.id}
                                    </span>
                                    <span className="h-3 w-px bg-green-200 mx-1" />
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4 text-green-400" />
                                      <span className="font-medium">Born:</span> {member.birthdate ? new Date(member.birthdate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase() : 'N/A'}
                                    </span>
                                    <span className="h-3 w-px bg-green-200 mx-1" />
                                    <span className="flex items-center gap-1">
                                      <User className="h-4 w-4 text-green-400" />
                                      <span className="font-medium">Age:</span> {member.birthdate ? Math.floor((new Date() - new Date(member.birthdate)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeMember(member.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {/* Member Count */}
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-800">
                            <strong>Total Members: {members.length + (selectedHead ? 1 : 0)}</strong>
                            {selectedHead && (
                              <span className="ml-2">(including head of household)</span>
                            )}
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
                        onClick={handleClose}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        onClick={handleSubmit(handleFormSubmit)}
                        className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Add Household
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAddMember={handleAddMember}
        selectedHead={selectedHead}
        members={members}
      />
    </>
  );
} 