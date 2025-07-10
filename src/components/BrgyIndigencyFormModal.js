"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, FileText, User, Calendar, MapPin } from "lucide-react";
import { debounce } from 'lodash';
// Import the CSS module
import styles from './BrgyCertificateFormModal.module.css';

const BARANGAY_OFFICIALS = {
  chairman: "Hon. CARTER P. MANZANO",
  secretary: "ROXANNE A. PADILLA",
  treasurer: "LYDIA E. AQUINO"
};

export default function BrgyIndigencyFormModal({ isOpen, onClose }) {
  const [uniqueId, setUniqueId] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [address, setAddress] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUniqueId("");
      setFullName("");
      setAge("");
      setBirthdate("");
      setAddress("");
      setIssueDate(new Date().toISOString().split('T')[0]);
      setPurpose("");
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

  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
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
    setAge(calculateAge(resident.birthdate));
    setAddress((resident.address || "").toUpperCase());
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handlePrint = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      if (!uniqueId || !fullName || !purpose) {
        setError("Please fill in all required fields");
        return;
      }

      // Create request data
      const requestData = {
        residentId: uniqueId,
        documentType: "Barangay Indigency",
        fullName: fullName.toUpperCase(),
        age: age,
        address: address.toUpperCase(),
        purpose: purpose.toUpperCase(),
        requestedAt: new Date().toISOString(),
        chairman: BARANGAY_OFFICIALS.chairman,
        secretary: BARANGAY_OFFICIALS.secretary,
        treasurer: BARANGAY_OFFICIALS.treasurer,
      };

      // First save the document request
      const saveResponse = await fetch('/api/document-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveResult.error || 'Failed to save request');
      }

      // Generate the document
      const printResponse = await fetch(`/api/document-requests/${saveResult.requestId}/generate`, {
        method: 'POST',
      });

      if (!printResponse.ok) {
        throw new Error('Failed to generate document');
      }

      // Get the document as a blob
      const blob = await printResponse.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `barangay_indigency_${saveResult.requestId}.docx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 1000);

      // Create notification for admin
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientId: 'admin',
            type: 'document_request',
            documentId: saveResult.requestId,
            documentType: 'Barangay Indigency',
            message: `New Barangay Indigency request from ${fullName} for ${purpose}`
          })
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error handling print:', error);
      setError(error.message || 'An error occurred while processing your request');
    } finally {
      setIsSubmitting(false);
    }
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
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Barangay Indigency</h2>
                <p className="text-green-100 text-sm">Official indigency application form</p>
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
                {/* Search Bar */}
                <div className="relative">
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Search className="w-4 h-4" /> Resident Search
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        placeholder="Search by Name or ID"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                      {/* Suggestions Dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
                          {suggestions.map((resident) => (
                            <div
                              key={resident.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelectResident(resident)}
                            >
                              <div className="text-gray-900">
                                {resident.firstName} {resident.middleName} {resident.lastName}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {resident.uniqueId || resident.id}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-gray-100">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Age</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={age}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    readOnly
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Issue Date</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    readOnly
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    <span>Purpose</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value.toUpperCase())}
                    placeholder="Enter purpose"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-8 py-2">
            <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-8 py-6 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Print'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 