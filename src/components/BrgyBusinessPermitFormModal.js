"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";

export default function BrgyBusinessPermitFormModal({ isOpen, onClose }) {
  const [uniqueId, setUniqueId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [purpose, setPurpose] = useState(""); // Specific to Business Permit, e.g., "new application", "renewal"

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
        setOwnerName(`${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`);
        // Address is on Household, for now, we'll keep a placeholder or leave it for manual input
        setBusinessAddress("Address will be fetched from household data if available.");
        // Business Name is not directly from resident, so it remains a manual input
      } else {
        alert(data.message || "No matching data found for this ID.");
        setOwnerName("");
        setBusinessAddress("");
      }
    } catch (error) {
      console.error("Error fetching resident data:", error);
      alert("An error occurred while fetching data. Please try again.");
      setOwnerName("");
      setBusinessAddress("");
    }
  };

  const handlePrint = () => {
    alert("Printing Barangay Business Permit Form...");
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-lg mx-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Barangay Business Permit Form</h2>

        {/* Unique ID with Fetch Data */}
        <div className="mb-4">
          <label htmlFor="uniqueId" className="block text-sm font-medium text-gray-700 mb-2">
            Unique ID (optional)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="uniqueId"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              placeholder="Enter ID"
            />
            <button
              onClick={handleFetchData}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name
            </label>
            <input
              type="text"
              id="ownerName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <input
              type="text"
              id="businessAddress"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Issue Date
            </label>
            <input
              type="date"
              id="issueDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <textarea
              id="purpose"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
} 