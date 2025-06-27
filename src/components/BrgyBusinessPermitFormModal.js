"use client";

import { useState } from "react";
import { X, Search, Briefcase, User, Calendar, MapPin, FileText } from "lucide-react";

export default function BrgyBusinessPermitFormModal({ isOpen, onClose }) {
  const [uniqueId, setUniqueId] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [validityPeriod, setValidityPeriod] = useState("");

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
    alert("Printing Barangay Business Permit...");
    onClose();
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Business Permit</h2>
                <p className="text-green-100 text-sm">Barangay business permit application</p>
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
                <h3 className="text-lg font-semibold text-gray-800">Applicant Lookup</h3>
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
                  <p className="text-xs text-gray-500">Enter the applicant's ID to auto-fill their information</p>
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
              <Briefcase className="h-4 w-4 mr-2" />
              Issue Permit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 