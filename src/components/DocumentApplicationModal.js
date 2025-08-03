"use client";

import { X, FileText, CheckCircle } from "lucide-react";

export default function DocumentApplicationModal({ isOpen, onClose, onSelectDocumentType }) {
  if (!isOpen) return null;

  const documentTypes = [
    {
      name: "Barangay Certificate",
      description: "Official certificate for various purposes",
      icon: "📄"
    },
    {
      name: "Barangay Clearance", 
      description: "Clearance for business or legal purposes",
      icon: "✅"
    },
    {
      name: "Barangay Indigency",
      description: "Certificate of indigency for assistance",
      icon: "🏠"
    },
    {
      name: "Barangay ID",
      description: "Official barangay identification card",
      icon: "🆔"
    },
    {
      name: "Barangay Business Permit",
      description: "Permit for business operations",
      icon: "🏢"
    }
  ];

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
                <h2 className="text-2xl font-bold text-white">Apply for Document</h2>
                <p className="text-green-100 text-sm">Select the type of document you need</p>
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

        {/* Content Section */}
        <div className="px-8 py-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-green-100 rounded-full p-2">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Available Documents</h3>
            </div>
            
            <div className="space-y-4">
              {documentTypes.map((docType) => (
                <button
                  key={docType.name}
                  className="w-full text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 group"
                  onClick={() => {
                    onSelectDocumentType(docType.name);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center group-hover:bg-green-100 transition-colors duration-200">
                        {docType.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                          {docType.name}
                        </h4>
                        <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-200">
                          {docType.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
          <div className="flex justify-center">
            <p className="text-sm text-gray-600">
              Select a document type to proceed with your application
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 