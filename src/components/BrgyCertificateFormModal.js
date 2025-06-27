"use client";

import { useState } from "react";
import { X, Search, FileText, User, Calendar, MapPin } from "lucide-react";

export default function BrgyCertificateFormModal({ isOpen, onClose }) {
  const [uniqueId, setUniqueId] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [purpose, setPurpose] = useState("");

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
      } else {
        alert(data.message || "No matching data found for this ID.");
        setFullName("");
        setAge("");
        setAddress("");
      }
    } catch (error) {
      console.error("Error fetching resident data:", error);
      alert("An error occurred while fetching data. Please try again.");
      setFullName("");
      setAge("");
      setAddress("");
    }
  };

  const handlePrint = () => {
    alert("Printing Barangay Certificate...");
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

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
              </div>
            </div>

            {/* Certificate Details Section */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-teal-100 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Certificate Details</h3>
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 text-left">
                    Purpose
                  </label>
                  <textarea
                    id="purpose"
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Enter purpose of certificate..."
                  />
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
              <FileText className="h-4 w-4 mr-2" />
              Print Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 