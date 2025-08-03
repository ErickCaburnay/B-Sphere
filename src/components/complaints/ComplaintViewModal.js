import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertTriangle, User, MapPin, Calendar, Clock, FileText } from 'lucide-react';

export default function ComplaintViewModal({ isOpen, onClose, complaint }) {
  if (!isOpen || !complaint) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 px-8 py-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Complaint Details</h2>
                        <p className="text-blue-100 text-sm">{complaint.type}</p>
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-blue-100 rounded-full p-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Complaint Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Complaint ID</p>
                          <p className="text-gray-900 font-semibold">{complaint.complaintId}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                          <p className="text-gray-900">{complaint.type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Date Filed</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-900">{complaint.dateFiled}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Assigned Officer</p>
                          <p className="text-gray-900">{complaint.officer}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            complaint.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {complaint.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Resolution Date</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-900">{complaint.resolutionDate || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Parties Involved */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-indigo-100 rounded-full p-2">
                          <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Parties Involved</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Respondent</p>
                          <p className="text-gray-900 font-medium">{complaint.respondent}</p>
                          {complaint.respondentAddress && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-500 mb-1">Respondent Address</p>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 text-sm">{complaint.respondentAddress}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Complainant</p>
                          <p className="text-gray-900 font-medium">{complaint.complainant}</p>
                          {complaint.complainantAddress && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-500 mb-1">Complainant Address</p>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 text-sm">{complaint.complainantAddress}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nature of Problem */}
                    {complaint.nature && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="bg-blue-100 rounded-full p-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Nature of Problem</h3>
                        </div>
                        <div className="bg-white/70 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">{complaint.nature}</p>
                        </div>
                      </div>
                    )}

                    {/* Record Information */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-gray-100 rounded-full p-2">
                          <Clock className="h-5 w-5 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Record Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {complaint.createdAt && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                            <p className="text-gray-900">{new Date(complaint.createdAt).toLocaleString()}</p>
                          </div>
                        )}
                        {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                            <p className="text-gray-900">{new Date(complaint.updatedAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
        </div>
      </div>
    </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="inline-flex items-center px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 