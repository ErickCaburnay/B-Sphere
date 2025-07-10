"use client";

import { useState } from 'react';
import { FileUploadForm } from './FileUploadForm';
import { FileList } from './FileList';

export default function BusinessPermitForm() {
  const [permitId, setPermitId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAdmin] = useState(false); // Set this based on your user role logic

  const handleUploadComplete = (newFiles) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileDeleted = (deletedFile) => {
    setUploadedFiles(prev => 
      prev.filter(file => file.fileName !== deletedFile.fileName)
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Permit Application</h2>
          <p className="mt-1 text-sm text-gray-500">
            Please fill out all required information and upload necessary documents.
          </p>
        </div>

        {/* Business Information Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Type
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. Retail, Restaurant, Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Address
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter complete business address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter contact number"
              />
            </div>
          </div>
        </div>

        {/* Required Documents Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              <li>Valid Government-issued ID (Scanned copy)</li>
              <li>DTI Business Registration or SEC Registration</li>
              <li>Barangay Clearance</li>
              <li>Proof of Business Location (Contract of Lease if rented)</li>
            </ul>
          </div>

          {/* File Upload Section */}
          <div className="mt-6">
            <FileUploadForm
              permitId={permitId}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          {/* Uploaded Files List */}
          <div className="mt-6">
            <FileList
              files={uploadedFiles}
              permitId={permitId}
              isAdmin={isAdmin}
              onFileDeleted={handleFileDeleted}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
} 