"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, Briefcase, User, Calendar, MapPin, FileText, AlertCircle, Loader2 } from "lucide-react";
import { debounce } from 'lodash';
import { useFileUpload } from '@/hooks/useFileUpload';
import { doc, setDoc, runTransaction, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function BrgyBusinessPermitFormModal({ isOpen, onClose }) {
  const router = useRouter();
  const [uniqueId, setUniqueId] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityPeriod, setValidityPeriod] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    files,
    uploadProgress,
    errors: uploadErrors,
    isUploading,
    uploadedFiles,
    handleFileSelect,
    removeFile,
    deleteFile,
    handleUpload,
    clearAll
  } = useFileUpload('business_permits', uniqueId);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const newUniqueId = `BBP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6)}`;
      setUniqueId(newUniqueId);
      setFullName("");
      setAge("");
      setAddress("");
      setBusinessName("");
      setBusinessType("");
      setBusinessAddress("");
      setIssueDate(new Date().toISOString().split('T')[0]);
      setValidityPeriod("");
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      setError("");
    }
  }, [isOpen]);

  // Check admin session using Firebase Auth
  const checkAdminSession = useCallback(async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No user logged in');
      }

      // Check admin status in both collections
      const adminAccountRef = doc(db, 'admin_accounts', user.uid);
      const residentRef = doc(db, 'residents', user.uid);
      
      const [adminDoc, residentDoc] = await Promise.all([
        getDoc(adminAccountRef),
        getDoc(residentRef)
      ]);

      // Check if user is admin in either collection
      const isAdminAccount = adminDoc.exists() && adminDoc.data().role === 'admin';
      const isAdminResident = residentDoc.exists() && ['admin', 'sub-admin'].includes(residentDoc.data().role);

      if (!isAdminAccount && !isAdminResident) {
        throw new Error('User is not an admin');
      }

      return true;
    } catch (error) {
      console.error('Session verification failed:', error);
      return false;
    }
  }, []);

  // Initialize session check when modal opens
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (isOpen) {
        const isValid = await checkAdminSession();
        if (!isValid) {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [isOpen, router, checkAdminSession]);

  // Add useEffect for ESC key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchResidents(query);
  };

  const handleSelectResident = (resident) => {
    setUniqueId(resident.uniqueId || resident.id);
    setFullName(`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`.toUpperCase());
    
    // Calculate age from birthDate
    const calculateAge = (birthDateStr) => {
      try {
        const birthDate = new Date(birthDateStr);
        if (isNaN(birthDate.getTime())) return null; // Invalid date
        
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      } catch (error) {
        console.error('Error calculating age:', error);
        return null;
      }
    };

    // Try to get age from different possible date formats
    const birthDate = resident.birthDate || resident.birthdate;
    let age = null;

    if (birthDate) {
      if (typeof birthDate === 'string') {
        age = calculateAge(birthDate);
      } else if (birthDate.toDate) { // Firestore Timestamp
        age = calculateAge(birthDate.toDate());
      }
    }

    // If we couldn't calculate age from birthDate, try to use provided age
    if (age === null) {
      age = resident.age || "";
    }

    setAge(age.toString());
    setAddress((resident.address || "").toUpperCase());
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Log for debugging
    console.log('Resident data:', {
      birthDate,
      calculatedAge: age,
      residentAge: resident.age,
      finalAge: age.toString()
    });
  };

  // Remove duplicate handler since we've merged the functionality
  const handleResidentSelect = handleSelectResident;

  // Add function to clear form
  const clearForm = async () => {
    try {
      // Reset all form fields
      setUniqueId("");
      setFullName("");
      setAge("");
      setAddress("");
      setBusinessName("");
      setBusinessType("");
      setBusinessAddress("");
      setIssueDate(new Date().toISOString().split('T')[0]);
      setValidityPeriod("");
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      setError("");
      
      // Clear all files using the new clearAll method
      await clearAll();
    } catch (error) {
      console.error('Error clearing form:', error);
      setError('Failed to clear form completely. Please try again.');
    }
  };

  const generatePermitNumber = async () => {
    try {
      // Verify admin session
      const isValid = await checkAdminSession();
      if (!isValid) {
        throw new Error('Unauthorized access');
      }

      const result = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'Business Permit');
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists() ? counterDoc.data().count : 0;
        const newCount = currentCount + 1;
        
        // Format: 000-00
        const formattedId = `${Math.floor(newCount/100).toString().padStart(3, '0')}-${(newCount % 100).toString().padStart(2, '0')}`;
        
        transaction.set(counterRef, { 
          count: newCount,
          lastUpdated: new Date(),
          documentType: 'Business Permit',
          lastGeneratedId: formattedId
        });
        
        return formattedId;
      });
      return result;
    } catch (error) {
      console.error('Error generating permit number:', error);
      if (error.message.includes('Unauthorized') || error.code === 'permission-denied') {
        router.push('/login');
      }
      throw error;
    }
  };

  const generateCTCNumber = async () => {
    try {
      // Verify admin session
      const isValid = await checkAdminSession();
      if (!isValid) {
        throw new Error('Unauthorized access');
      }

      const result = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'CTC');
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists() ? counterDoc.data().count : 0;
        const newCount = currentCount + 1;
        
        // Format: 0000-0000
        const part1 = Math.floor((newCount - 1) / 10000) + 1;
        const part2 = ((newCount - 1) % 10000) + 1;
        const formattedId = `${part1.toString().padStart(4, '0')}-${part2.toString().padStart(4, '0')}`;
        
        transaction.set(counterRef, { 
          count: newCount,
          lastUpdated: new Date(),
          documentType: 'CTC',
          lastGeneratedId: formattedId
        });
        
        return formattedId;
      });
      return result;
    } catch (error) {
      console.error('Error generating CTC number:', error);
      if (error.message.includes('Unauthorized') || error.code === 'permission-denied') {
        router.push('/login');
      }
      throw error;
    }
  };

  const generateORNumber = async () => {
    try {
      // Verify admin session
      const isValid = await checkAdminSession();
      if (!isValid) {
        throw new Error('Unauthorized access');
      }

      const result = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'OR');
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists() ? counterDoc.data().count : 0;
        const newCount = currentCount + 1;
        
        // Format: 0000-000
        const part1 = Math.floor((newCount - 1) / 1000) + 1;
        const part2 = ((newCount - 1) % 1000) + 1;
        const formattedId = `${part1.toString().padStart(4, '0')}-${part2.toString().padStart(3, '0')}`;
        
        transaction.set(counterRef, { 
          count: newCount,
          lastUpdated: new Date(),
          documentType: 'OR',
          lastGeneratedId: formattedId
        });
        
        return formattedId;
      });
      return result;
    } catch (error) {
      console.error('Error generating OR number:', error);
      if (error.message.includes('Unauthorized') || error.code === 'permission-denied') {
        router.push('/login');
      }
      throw error;
    }
  };

  // Update handlePrint to handle async clearForm
  const handlePrint = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      // Upload files first if there are any
      if (files.length > 0) {
        try {
          await handleUpload();
        } catch (error) {
          console.error('Error uploading files:', error);
          setError('Failed to upload files. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Generate permit number
      const permitNumber = await generatePermitNumber();
      if (!permitNumber) {
        setError('Failed to generate permit number');
        setIsSubmitting(false);
        return;
      }

      // Generate CTC number
      const ctcNumber = await generateCTCNumber();
      if (!ctcNumber) {
        setError('Failed to generate CTC number');
        setIsSubmitting(false);
        return;
      }

      // Generate OR number
      const orNumber = await generateORNumber();
      if (!orNumber) {
        setError('Failed to generate OR number');
        setIsSubmitting(false);
        return;
      }

      // Verify admin session first
      const isValid = await checkAdminSession();
      if (!isValid) {
        throw new Error('Unauthorized access');
      }

      // Create request data
      const requestData = {
        residentId: uniqueId,
        documentType: "Business Permit",
        fullName: fullName.toUpperCase(),
        age: age,
        address: address.toUpperCase(),
        businessName: businessName.toUpperCase(),
        businessType: businessType.toUpperCase(),
        businessAddress: businessAddress.toUpperCase(),
        issueDate: new Date(issueDate).toISOString(),
        validityPeriod: validityPeriod || '1 YEAR',
        requestedAt: new Date().toISOString(),
        status: 'PENDING',
        attachments: uploadedFiles.map(file => ({
          fileName: file.fileName,
          fileURL: file.downloadURL,
          fileType: file.fileName.split('.').pop().toLowerCase()
        }))
      };

      // First save the document request
      const saveResponse = await fetch('/api/document-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveResult.error || 'Failed to save request');
      }

      // Generate the document
      const response = await fetch(`/api/document-requests/${saveResult.requestId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Business_Permit_${fullName.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Show success message
      alert(`Document request processed successfully!\nControl No: ${saveResult.requestId}`);
      
      // Clear form and close modal
      await clearForm();
      onClose();
      
    } catch (error) {
      console.error('Error generating document:', error);
      setError(error.message || 'Failed to generate document');
      
      // If unauthorized, redirect to login
      if (error.message.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add file removal handler
  const handleFileRemove = async (fileName) => {
    try {
      await deleteFile(fileName);
      // The file list will be automatically updated through the useFileUpload hook
    } catch (error) {
      console.error('Error removing file:', error);
      setError('Failed to remove file. Please try again.');
    }
  };

  // Update the file list rendering to include remove button
  const renderFileList = () => {
    if (!uploadedFiles.length) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900">Uploaded Files:</h4>
        <ul className="mt-2 divide-y divide-gray-200">
          {uploadedFiles.map((file, index) => (
            <li key={index} className="py-2 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{file.fileName}</span>
              </div>
              <button
                onClick={() => handleFileRemove(file.fileName)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const handleCancel = () => {
    onClose();
  };

  const businessTypes = [
    "Retail Store",
    "Restaurant/Food Service",
    "Grocery Store",
    "Sari-sari Store",
    "Beauty Salon",
    "Barbershop",
    "Internet Cafe",
    "Laundry Shop",
    "Auto Repair Shop",
    "Pharmacy",
    "Hardware Store",
    "Clothing Store",
    "Other"
  ];

  return (
    <>
      {isOpen && (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Business Permit</h2>
                <p className="text-green-100 text-sm">Official business permit application form</p>
              </div>
            </div>
            <button
                  onClick={handleCancel}
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
                      onChange={handleSearchChange}
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
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-emerald-100 rounded-full p-2">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Applicant Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Full Name</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Age</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Residential Address</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete residential address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-teal-100 rounded-full p-2">
                  <Briefcase className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Business Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Business Name</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter business name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Business Type</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="businessType"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    required
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Business Address</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="businessAddress"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Enter complete business address"
                    required
                  />
                </div>
              </div>
            </div>

                {/* File Upload Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="bg-blue-100 rounded-full p-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Required Documents</h3>
                  </div>

                  {/* Document Requirements List */}
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                      <li>Valid Government-issued ID (Scanned copy)</li>
                      <li>DTI Business Registration or SEC Registration</li>
                      <li>Barangay Clearance</li>
                      <li>Proof of Business Location (Contract of Lease if rented)</li>
                    </ul>
                  </div>

                  {/* Drag and Drop Area */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                      isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                          <p className="text-blue-600">Uploading files...</p>
                        </>
                      ) : (
                        <>
                          <FileText className="h-12 w-12 text-gray-400" />
                          <div className="text-center">
                            <p className="text-gray-600">Drag and drop your files here, or</p>
                            <label className="mt-2 cursor-pointer">
                              <span className="text-blue-500 hover:text-blue-600">Browse files</span>
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                          <p className="text-sm text-gray-500">
                            Supported formats: PDF, JPEG, PNG (max 5MB per file)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Selected Files (Before Upload) */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <h4 className="font-medium text-gray-700">Selected Files:</h4>
                      <div className="space-y-2">
                        {files.map((file) => (
                          <div
                            key={file.name}
                            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(file.name)}
                              className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                              disabled={isUploading}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && Object.keys(uploadProgress).length > 0 && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <div key={fileName} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{fileName}</span>
                            <span className="text-gray-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Error Messages */}
                  {Object.entries(uploadErrors).length > 0 && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(uploadErrors).map(([fileName, error]) => (
                        <div
                          key={fileName}
                          className="flex items-center space-x-2 text-red-500 text-sm"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

            {/* Permit Details Section */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-cyan-100 rounded-full p-2">
                  <FileText className="h-5 w-5 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Permit Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Issue Date</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    id="issueDate"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="validityPeriod" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Validity Period</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="validityPeriod"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={validityPeriod}
                    onChange={(e) => setValidityPeriod(e.target.value)}
                    required
                  >
                    <option value="">Select validity period</option>
                    <option value="1 year">1 Year</option>
                    <option value="2 years">2 Years</option>
                    <option value="3 years">3 Years</option>
                  </select>
                </div>
              </div>

              {/* Information Note */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <div className="bg-amber-100 rounded-full p-1 mt-0.5">
                    <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Important Requirements</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Please ensure you have all required documents: Valid ID, Proof of Address, Business Registration (if applicable), and Barangay Clearance. Additional fees may apply based on business type.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-8 py-4 bg-gray-50/50">
              <div className="flex justify-between items-center">
            <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  disabled={isSubmitting}
            >
              Cancel
            </button>
                <div className="flex space-x-3">
            <button
              onClick={handlePrint}
                    disabled={isSubmitting || !fullName || !businessName || !businessAddress}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                </>
              ) : (
                      'Generate Permit'
              )}
            </button>
          </div>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
        </div>
      </div>
    </div>
      )}
    </>
  );
} 