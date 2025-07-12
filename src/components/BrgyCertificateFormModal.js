"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, FileText, User, Calendar, MapPin, Eye } from "lucide-react";
import { debounce } from 'lodash';
import Image from 'next/image';
import styles from './BrgyCertificateFormModal.module.css';

const BARANGAY_OFFICIALS = [
  { name: "Hon. CARTER P. MANZANO", position: "Barangay Chairman" },
  { name: "Hon. CLARA A. FIGUEROA", position: "Committee on Appropriation" },
  { name: "Hon. MERCEDES C. PEREZ", position: "Committee on Environmental Protection" },
  { name: "Hon. AMADOR A. TITULOS", position: "Committee on Human Rights, Peace & Order" },
  { name: "Hon. DEXTER G. MACABARE", position: "Committee on Education / Programs and Health Protection" },
  { name: "Hon. MARIA GABBY", position: "Committee on Rules and Privileges Ways & Means" },
  { name: "Hon. ABDULLA B. ORACION", position: "Committee on Infrastructure" },
  { name: "Hon. REBECCA M. FLORDELIZE", position: "Committee on Cooperatives / Livelihood" },
  { name: "Hon. GERALD L. ESPINA", position: "S.K Chairman" },
  { name: "ROXANNE A. PADILLA", position: "Brgy. Secretary" },
  { name: "LYDIA E. AQUINO", position: "Brgy. Treasurer" }
];

export default function BrgyCertificateFormModal({ isOpen, onClose }) {
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
  const [isPreviewing, setIsPreviewing] = useState(false);

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

  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    const today = new Date();
    const birthDate = new Date(birthdate);
    if (isNaN(birthDate.getTime())) return ""; // Return empty string if invalid date
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
    
    // Handle different birthdate formats
    let birthdateValue = "";
    if (resident.birthDate) {
      // If it's a Timestamp or Date object
      if (resident.birthDate.toDate) {
        birthdateValue = resident.birthDate.toDate().toISOString().split('T')[0];
      } 
      // If it's already an ISO string
      else if (typeof resident.birthDate === 'string') {
        birthdateValue = resident.birthDate.split('T')[0];
      }
    }
    
    setBirthdate(birthdateValue);
    setAge(calculateAge(birthdateValue));
    setAddress((resident.address || "").toUpperCase());
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      setAge(value);
    }
  };

  const handlePrint = async (requestId) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create request data
      const requestData = {
        residentId: uniqueId,
        documentType: "Barangay Certificate",
        fullName: fullName.toUpperCase(),
        age: age,
        address: address.toUpperCase(),
        purpose: purpose.toUpperCase(),
        requestedAt: new Date().toISOString(),
        chairman: BARANGAY_OFFICIALS.find(o => o.position.includes("Chairman"))?.name || "",
        secretary: BARANGAY_OFFICIALS.find(o => o.position.includes("Secretary"))?.name || "",
        treasurer: BARANGAY_OFFICIALS.find(o => o.position.includes("Treasurer"))?.name || "",
      };

      // First save the document request
      const saveResponse = await fetch('/api/document-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveResult.error || 'Failed to save request');
      }

      if (!saveResult.success || !saveResult.requestId) {
        throw new Error('Invalid response from server');
      }

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
            documentType: 'Barangay Certificate',
            message: `New Barangay Certificate request from ${fullName} for ${purpose}`
          })
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      // Generate and print the document
      const printResponse = await fetch(`/api/document-requests/${saveResult.requestId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!printResponse.ok) {
        throw new Error('Failed to generate document');
      }

      // Get the document as a blob
      const blob = await printResponse.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Download the file directly
      const a = document.createElement('a');
      a.href = url;
      a.download = `barangay_certificate_${saveResult.requestId}.docx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Show success message and close modal
      alert(`Document request processed successfully!\nControl No: ${saveResult.requestId}`);
      onClose();

    } catch (error) {
      console.error('Error handling print:', error);
      setError(error.message || 'An error occurred while processing your request');
    }
  };

  const handlePreview = async () => {
    try {
      setIsPreviewing(true);
      setError("");

      if (!fullName || !purpose) {
        setError("Please fill in all required fields");
        return;
      }

      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create request data
      const requestData = {
        residentId: uniqueId,
        documentType: "Barangay Certificate",
        fullName: fullName.toUpperCase(),
        age: age,
        address: address.toUpperCase(),
        purpose: purpose.toUpperCase(),
        requestedAt: new Date().toISOString(),
        chairman: BARANGAY_OFFICIALS.find(o => o.position.includes("Chairman"))?.name || "",
        secretary: BARANGAY_OFFICIALS.find(o => o.position.includes("Secretary"))?.name || "",
        treasurer: BARANGAY_OFFICIALS.find(o => o.position.includes("Treasurer"))?.name || "",
      };

      // First save the document request
      const saveResponse = await fetch('/api/document-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveResult.error || 'Failed to save request');
      }

      if (!saveResult.requestId) {
        throw new Error('No request ID received from server');
      }

      // Create notification for admin
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientId: 'admin',
            type: 'document_request',
            documentId: saveResult.requestId,
            documentType: 'Barangay Certificate',
            message: `New Barangay Certificate request from ${fullName} for ${purpose}`
          })
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      // Generate and print the document
      const printResponse = await fetch(`/api/document-requests/${saveResult.requestId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!printResponse.ok) {
        const errorData = await printResponse.json();
        throw new Error(errorData.error || 'Failed to generate document');
      }

      // Get the document as a blob
      const blob = await printResponse.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Download the file directly
      const a = document.createElement('a');
      a.href = url;
      a.download = `barangay_certificate_${saveResult.requestId}.docx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Show success message and close modal
      alert(`Document request processed successfully!\nControl No: ${saveResult.requestId}`);
      onClose();

    } catch (error) {
      console.error('Error processing document:', error);
      setError(error.message || 'Failed to process document. Please try again.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      if (!uniqueId || !fullName || !purpose) {
        setError("Please fill in all required fields");
        return;
      }

      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create the document request with all necessary data
      const requestData = {
        residentId: uniqueId,
        documentType: "Barangay Certificate",
        fullName: fullName.toUpperCase(),
        age: age,
        address: address.toUpperCase(),
        purpose: purpose.toUpperCase(),
        requestedAt: new Date().toISOString(),
        chairman: BARANGAY_OFFICIALS.find(o => o.position.includes("Chairman"))?.name || "",
        secretary: BARANGAY_OFFICIALS.find(o => o.position.includes("Secretary"))?.name || "",
        treasurer: BARANGAY_OFFICIALS.find(o => o.position.includes("Treasurer"))?.name || "",
      };

      const response = await fetch('/api/document-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request');
      }

      if (!result.success || !result.requestId) {
        throw new Error('Invalid response from server');
      }

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
            documentId: result.requestId,
            documentType: 'Barangay Certificate',
            message: `New Barangay Certificate request from ${fullName} for ${purpose}`
          })
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      // Show success message
      alert(`Document request submitted successfully!\nControl No: ${result.requestId}`);

      // Generate and print
      await handlePrint(result.requestId);
      
      // Close the modal
      onClose();

    } catch (error) {
      console.error('Error in form submission:', error);
      setError(error.message || 'Failed to submit request. Please try again.');
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
                <h2 className="text-2xl font-bold text-white">Barangay Certificate</h2>
                <p className="text-green-100 text-sm">Official certificate application form</p>
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
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                      {suggestions.map((resident, index) => (
                        <button
                          key={resident.id}
                          onClick={() => handleSelectResident(resident)}
                          className="w-full px-4 py-2 text-left hover:bg-green-50 focus:bg-green-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                        >
                          <span className="font-medium">{resident.firstName} {resident.middleName} {resident.lastName}</span>
                          <span className="text-gray-500 text-sm ml-2">({resident.uniqueId || resident.id})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-green-100 rounded-full p-2">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              </div>

              <div className="space-y-4">
                {/* Full Name and Age Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4" /> Age
                    </label>
                    <input
                      type="text"
                      value={age}
                      onChange={handleAgeChange}
                      placeholder="Enter Age"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Birthdate and Issue Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4" /> Birthdate
                    </label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={e => setBirthdate(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4" /> Issue Date
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Address Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4" /> Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Purpose Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4" /> Purpose
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value.toUpperCase())}
                    placeholder="Enter Purpose"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-5 flex items-center justify-end">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={handlePreview}
              disabled={isSubmitting || isPreviewing}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isPreviewing ? (
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