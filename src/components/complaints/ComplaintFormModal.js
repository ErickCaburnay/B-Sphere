import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertTriangle, User, MapPin, Calendar, Phone, Edit } from 'lucide-react';

const complaintTypes = [
  '',
  'Noise Disturbance',
  'Property Dispute',
  'Pet Nuisance',
  'Illegal Parking',
  'Vandalism',
  'Garbage Disposal',
  'Construction Noise',
  'Street Light Outage',
  'Water Leak',
  'Illegal Vending',
  'Road Damage',
  'Loitering',
];
const statusOptions = ['', 'Pending', 'In Progress', 'Resolved', 'Cancelled'];

export default function ComplaintFormModal({ isOpen, onClose, onSubmit, initialData = {}, isEdit = false }) {
  const [form, setForm] = useState({
    type: '',
    respondent: '',
    respondentAddress: '',
    complainant: '',
    complainantAddress: '',
    dateFiled: '',
    officer: '',
    status: '',
    resolutionDate: '',
    nature: '',
  });
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    // Reset form when modal opens (transition from closed to open)
    if (isOpen && !prevIsOpenRef.current) {
      if (isEdit && initialData) {
        setForm({
          ...initialData,
          respondentAddress: initialData.respondentAddress || '',
          complainantAddress: initialData.complainantAddress || '',
          nature: initialData.nature || '',
        });
      } else {
        setForm({
          type: '',
          respondent: '',
          respondentAddress: '',
          complainant: '',
          complainantAddress: '',
          dateFiled: '',
          officer: '',
          status: '',
          resolutionDate: '',
          nature: '',
        });
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-8 py-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        {isEdit ? (
                          <Edit className="h-6 w-6 text-white" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {isEdit ? 'Edit Complaint' : 'File a Complaint'}
                        </h2>
                        <p className="text-violet-100 text-sm">
                          {isEdit ? 'Update complaint information' : 'Submit your complaint for proper resolution'}
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                      onClick={onClose}
                      type="button"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Complaint Information Section */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-violet-100 rounded-full p-2">
                          <AlertTriangle className="h-5 w-5 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Complaint Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Type of Complaint</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          >
                            <option value="" disabled>Select a type of complaint</option>
                            {complaintTypes.slice(1).map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Date Filed</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="date"
                            name="dateFiled"
                            value={form.dateFiled}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Assigned Officer</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="officer"
                            value={form.officer}
                            onChange={handleChange}
                            placeholder="Officer name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Parties Involved Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-purple-100 rounded-full p-2">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Parties Involved</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Respondent</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="respondent"
                            value={form.respondent}
                            onChange={handleChange}
                            placeholder="Respondent name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Respondent Address
                          </label>
                          <input
                            type="text"
                            name="respondentAddress"
                            value={form.respondentAddress}
                            onChange={handleChange}
                            placeholder="Respondent's address"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Complainant</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="complainant"
                            value={form.complainant}
                            onChange={handleChange}
                            placeholder="Complainant name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Complainant Address
                          </label>
                          <input
                            type="text"
                            name="complainantAddress"
                            value={form.complainantAddress}
                            onChange={handleChange}
                            placeholder="Complainant's address"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status & Resolution Section */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-indigo-100 rounded-full p-2">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Status & Resolution</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Status</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          >
                            <option value="" disabled>Select a status</option>
                            {statusOptions.slice(1).map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Date Resolution
                          </label>
                          <input
                            type="date"
                            name="resolutionDate"
                            value={form.resolutionDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Nature of the Problem
                          </label>
                          <textarea
                            name="nature"
                            value={form.nature}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe the problem in detail..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      {isEdit ? (
                        <Edit className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                      )}
                      {isEdit ? 'Update Complaint' : 'Submit Complaint'}
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