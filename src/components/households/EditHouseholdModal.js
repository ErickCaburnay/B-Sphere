"use client";

import { useState } from 'react';
import { X, Home, User, Edit } from 'lucide-react';

export function EditHouseholdModal({ household, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    address: household.address || '',
    headOfHouseholdFirstName: household.head?.firstName || '',
    headOfHouseholdLastName: household.head?.lastName || '',
    headOfHouseholdMiddleName: household.head?.middleName || '',
    contactNumber: household.contactNumber || '',
    totalMembers: household.totalMembers || 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 rounded-full p-3">
            <Edit className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Edit Household</h2>
            <p className="text-gray-600">Update household information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Household Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-100 rounded-full p-2">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Household Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="Enter complete household address"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="0921 234 5678"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="totalMembers" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Members <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="totalMembers"
                  name="totalMembers"
                  value={formData.totalMembers}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* Head of Household Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-indigo-100 rounded-full p-2">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Head of Household</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="headOfHouseholdFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="headOfHouseholdFirstName"
                  name="headOfHouseholdFirstName"
                  value={formData.headOfHouseholdFirstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="First name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="headOfHouseholdMiddleName" className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  id="headOfHouseholdMiddleName"
                  name="headOfHouseholdMiddleName"
                  value={formData.headOfHouseholdMiddleName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="Middle name (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="headOfHouseholdLastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="headOfHouseholdLastName"
                  name="headOfHouseholdLastName"
                  value={formData.headOfHouseholdLastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Edit className="h-4 w-4 mr-2 inline" />
              Update Household
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 