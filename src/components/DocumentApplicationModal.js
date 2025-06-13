"use client";

import { X } from "lucide-react";

export default function DocumentApplicationModal({ isOpen, onClose, onSelectDocumentType }) {
  if (!isOpen) return null;

  const documentTypes = [
    "Barangay Certificate",
    "Barangay Clearance",
    "Barangay Indigency",
    "Barangay ID",
    "Barangay Business Permit",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Apply for Document</h2>
        <div className="space-y-4">
          {documentTypes.map((docType) => (
            <button
              key={docType}
              className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              onClick={() => {
                onSelectDocumentType(docType);
              }}
            >
              {docType}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 