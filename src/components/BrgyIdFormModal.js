"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, FileText, User, Calendar, MapPin } from "lucide-react";
import { debounce } from 'lodash';

// Make sure to import the CSS module
import styles from './BrgyCertificateFormModal.module.css';

export default function BrgyIdFormModal({ isOpen, onClose }) {
  const [uniqueId, setUniqueId] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUniqueId("");
      setFullName("");
      setBirthdate("");
      setAddress("");
      setContactNumber("");
      setEmergencyContact("");
      setEmergencyNumber("");
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      setError("");
    }
  }, [isOpen]);

  // Add useEffect for ESC key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Add clear search function
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const searchResidents = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(`/api/residents/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (response.ok) {
          setSuggestions(data.data || []);
          setShowSuggestions(true);
        } else {
          console.error("Error searching residents:", data.error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error searching residents:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  const handleSearchInputChange = (e) => {
    const query = e.target.value.toUpperCase();
    setSearchQuery(query);
    searchResidents(query);
  };

  const handleSelectResident = (resident) => {
    setUniqueId(resident.uniqueId || resident.id);
    setFullName(`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`.toUpperCase());
    setBirthdate(resident.birthdate?.split('T')[0] || "");
    setAddress((resident.address || "").toUpperCase());
    setContactNumber(resident.contactNumber || "");
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  const handleFetchData = async () => {
    if (!uniqueId) {
      alert("Please enter a Unique ID.");
      return;
    }

    try {
      const response = await fetch(`/api/residents/${uniqueId}`);
      const data = await response.json();

      if (response.ok) {
        setFullName(`${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`);
        setBirthdate(data.birthdate?.split('T')[0] || "");
        setAddress(data.address || "Address will be fetched from household data if available.");
        setContactNumber(data.contactNumber || "");
        setEmergencyContact(data.emergencyContact || "");
        setEmergencyNumber(data.emergencyNumber || "");
      } else {
        alert(data.message || "No matching data found for this ID.");
        setFullName("");
        setBirthdate("");
        setAddress("");
        setContactNumber("");
        setEmergencyContact("");
        setEmergencyNumber("");
      }
    } catch (error) {
      console.error("Error fetching resident data:", error);
      alert("An error occurred while fetching data. Please try again.");
      setFullName("");
      setBirthdate("");
      setAddress("");
      setContactNumber("");
      setEmergencyContact("");
      setEmergencyNumber("");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // setPhotoFile(file); // This state was removed, so this function is no longer relevant
    }
  };

  const handlePreview = () => {
    alert("Printing Barangay ID...");
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Barangay ID</h2>
                <p className="text-green-100 text-sm">Official ID application form</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="space-y-8">
            {/* Search Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-green-100 rounded-full p-2">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Resident Search</h3>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="mb-2">Search by Name or ID</div>
                  <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200"
                      placeholder="Search by name or ID..."
                    />
                    <div className="absolute right-3 top-3 flex items-center space-x-1">
                      {searchQuery && (
                        <button
                          onClick={clearSearch}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute w-full bg-white border-t border-gray-100 max-h-60 overflow-y-auto">
                        {suggestions.map((resident) => (
                          <div
                            key={resident.id}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleSelectResident(resident)}
                          >
                            <div className="text-gray-900 uppercase">{resident.firstName} {resident.middleName} {resident.lastName}</div>
                            <div className="text-gray-500 text-sm uppercase">{resident.uniqueId || resident.id}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-emerald-100 rounded-full p-2">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Full Name</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Birthdate</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Address</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase"
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Contact Number</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter contact number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Emergency Contact</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase"
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Emergency Number</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    value={emergencyNumber}
                    onChange={(e) => setEmergencyNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter emergency contact number"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={handlePreview}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Print
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 