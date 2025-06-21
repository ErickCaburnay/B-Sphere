import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

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
const statusOptions = ['', 'Pending', 'In Progress', 'Resolved'];

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

  useEffect(() => {
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
  }, [isEdit, initialData, isOpen]);

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
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
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
              <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-8 relative border border-gray-200 text-left align-middle transition-all">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={onClose}
                  type="button"
                >
                  &times;
                </button>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-1">File a Complaint</h2>
                <div className="text-center text-gray-500 mb-8 font-semibold">Please fill out this form</div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type of Complaint */}
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-700 mb-1">Type of Complaint:</label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        required
                        className="rounded border border-gray-300 text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      >
                        <option value="" disabled>Select a type of complaint</option>
                        {complaintTypes.slice(1).map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div></div>
                    {/* Respondent/Address */}
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-700 mb-1">Respondent:</label>
                      <input
                        type="text"
                        name="respondent"
                        value={form.respondent}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                        className="rounded border border-gray-300 text-gray-800 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-700 mb-1">Address:</label>
                      <input
                        type="text"
                        name="respondentAddress"
                        value={form.respondentAddress}
                        onChange={handleChange}
                        placeholder="Respondent's Address"
                        className="rounded border border-gray-300 text-gray-800 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>
                    {/* Complainant/Address */}
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-700 mb-1">Complainant:</label>
                      <input
                        type="text"
                        name="complainant"
                        value={form.complainant}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                        className="rounded border border-gray-300 text-gray-800 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-700 mb-1">Address:</label>
                      <input
                        type="text"
                        name="complainantAddress"
                        value={form.complainantAddress}
                        onChange={handleChange}
                        placeholder="Complainant's Address"
                        className="rounded border border-gray-300 text-gray-800 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>
                    {/* Officer/Status/Date Resolution */}
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-700 mb-1">Assigned Officer:</label>
                      <input
                        type="text"
                        name="officer"
                        value={form.officer}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                        className="rounded border border-gray-300 text-gray-800 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      />
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="flex-1 flex flex-col">
                        <label className="font-bold text-gray-700 mb-1">Status:</label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          required
                          className="rounded border border-gray-300 text-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        >
                          <option value="" disabled>Select a status</option>
                          {statusOptions.slice(1).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label className="font-bold text-gray-700 mb-1">Date Resolution:</label>
                        <input
                          type="date"
                          name="resolutionDate"
                          value={form.resolutionDate}
                          onChange={handleChange}
                          className="rounded border border-gray-300 text-gray-800 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Nature of the Problem */}
                  <div>
                    <label className="font-bold text-gray-700 mb-1">Nature of the Problem:</label>
                    <textarea
                      name="nature"
                      value={form.nature}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the problem..."
                      className="w-full rounded border border-gray-300 text-gray-800 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  </div>
                  <div className="flex justify-center mt-4">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded font-bold hover:bg-blue-700 transition">Submit</button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 