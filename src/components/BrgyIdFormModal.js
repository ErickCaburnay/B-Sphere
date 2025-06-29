"use client";

import { useState } from "react";
import { X, Search, CreditCard, User, Calendar, MapPin, Camera } from "lucide-react";

export default function BrgyIdFormModal({ isOpen, onClose }) {
  const [uniqueId, setUniqueId] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

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
        setAge(data.age || "");
        setAddress(data.address || "Address will be fetched from household data if available.");
        setEmergencyContact(data.contactNumber ? data.contactNumber.replace(/\s/g, '') : "");
      } else {
        alert(data.message || "No matching data found for this ID.");
        setFullName("");
        setAge("");
        setAddress("");
        setEmergencyContact("");
      }
    } catch (error) {
      console.error("Error fetching resident data:", error);
      alert("An error occurred while fetching data. Please try again.");
      setFullName("");
      setAge("");
      setAddress("");
      setEmergencyContact("");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handlePrint = () => {
    alert("Printing Barangay ID...");
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Barangay ID</h2>
                <p className="text-green-100 text-sm">Official barangay identification card</p>
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
            
            {/* ID Lookup Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-green-100 rounded-full p-2">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Resident Lookup</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="uniqueId" className="block text-sm font-medium text-gray-700 text-left">
                    Unique ID (optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      id="uniqueId"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      value={uniqueId}
                      onChange={(e) => setUniqueId(e.target.value)}
                      placeholder="Enter resident ID"
                    />
                    <button
                      onClick={handleFetchData}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2"
                    >
                      <Search className="h-4 w-4" />
                      <span>Fetch</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Enter the resident's ID to auto-fill their information</p>
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
                    <span>Address</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 text-left">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="0921 234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 text-left">
                    <span>Issue Date</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    id="issueDate"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-teal-100 rounded-full p-2">
                  <Camera className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Photo Upload</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 text-left">
                    <span>ID Photo</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        required
                      />
                    </div>
                    {photoFile && (
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
                        ✓ Photo uploaded
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Upload a clear 2x2 photo for the ID card (JPG, PNG format)</p>
                </div>

                {/* Photo Preview */}
                {photoFile && (
                  <div className="mt-4">
                    <div className="w-32 h-32 border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <img
                        src={URL.createObjectURL(photoFile)}
                        alt="ID Photo Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Photo preview</p>
                  </div>
                )}
              </div>

              {/* Information Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">ID Requirements</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      The Barangay ID serves as an official identification document for residents. Please ensure all information is accurate and the photo is clear and recent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Generate ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 