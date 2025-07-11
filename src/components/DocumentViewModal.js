"use client";

import { useState } from 'react';
import { X, FileText, Calendar, User, Clock, Download, AlertCircle, Briefcase } from 'lucide-react';

export function DocumentViewModal({ isOpen, onClose, document }) {
  if (!isOpen || !document) return null;

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' },
    completed: { color: 'bg-green-100 text-green-800', dot: 'bg-green-400' },
    rejected: { color: 'bg-red-100 text-red-800', dot: 'bg-red-400' },
    processing: { color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-400' },
  };

  const priorityConfig = {
    low: { label: 'Low Priority', color: 'text-gray-600' },
    medium: { label: 'Medium Priority', color: 'text-blue-600' },
    high: { label: 'High Priority', color: 'text-red-600' },
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
                <h2 className="text-2xl font-bold text-white">Document Details</h2>
                <p className="text-green-100 text-sm">{document.type}</p>
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

        {/* Content */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-green-100 rounded-full p-2">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction No.</label>
                    <p className="text-gray-900 font-medium">{document.transactionNo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusConfig[document.status]?.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[document.status]?.dot}`}></div>
                      {document.status}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Applicant Name</label>
                  <p className="text-gray-900 font-medium">{document.nameOfApplicant}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Purpose</label>
                  <p className="text-gray-900">{document.purpose}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Filed</label>
                    <p className="text-gray-900">{new Date(document.dateFiled).toLocaleDateString()}</p>
                  </div>
                  {document.dateIssued && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date Issued</label>
                      <p className="text-gray-900">{new Date(document.dateIssued).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Permit Information - Only show for business permits */}
            {(document.type === 'Business Permit' || document.documentType === 'Business Permit') && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="bg-green-100 rounded-full p-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Business Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Control No.</label>
                    <p className="text-gray-900 font-medium">{document.printPermit || document.controlNo || document.Control_No}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Nature of Business</label>
                    <p className="text-gray-900">{document.natureOfBusiness || document.businessType}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                    <p className="text-gray-900">{document.businessName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Address</label>
                    <p className="text-gray-900">{document.businessAddress}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">CTC No.</label>
                      <p className="text-gray-900">{document.ctcNo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">OR No.</label>
                      <p className="text-gray-900">{document.orNo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusConfig[document.status?.toLowerCase()]?.color || statusConfig['pending'].color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[document.status?.toLowerCase()]?.dot || statusConfig['pending'].dot}`}></div>
                        {document.status || 'PENDING'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valid Until</label>
                      <p className="text-gray-900">{document.validity || document.validityPeriod || '1 YEAR'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-green-100 rounded-full p-2">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Additional Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Processing Time</label>
                    <p className="text-gray-900">{document.processingTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fee</label>
                    <p className="text-gray-900">{document.fee}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Priority Level</label>
                  <p className={`text-sm font-medium ${priorityConfig[document.priority]?.color}`}>
                    {priorityConfig[document.priority]?.label}
                  </p>
                </div>

                {document.estimatedCompletion && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimated Completion</label>
                    <p className="text-gray-900">{new Date(document.estimatedCompletion).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded Files Section */}
            {document.files && document.files.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="bg-green-100 rounded-full p-2">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Uploaded Files</h3>
                </div>

                <div className="space-y-2">
                  {document.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                      </div>
                      <a
                        href={file.url}
                        download
                        className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remarks/Notes Section */}
            {document.remarks && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="bg-green-100 rounded-full p-2">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Remarks</h3>
                </div>

                <p className="text-gray-600">{document.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 