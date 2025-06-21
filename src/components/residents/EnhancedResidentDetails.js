"use client";

import { useState } from 'react';
import { 
  User, Home, Phone, Mail, Calendar, 
  FileText, Edit, Trash2, Camera,
  MapPin, Heart, Star, Award, Plus, Download
} from 'lucide-react';
import { Tab } from '@headlessui/react';
import { toast } from 'react-hot-toast';

export function EnhancedResidentDetails({ resident, onClose, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tabs = [
    { name: 'Basic Info', icon: User },
    { name: 'Documents', icon: FileText },
    { name: 'History', icon: Calendar },
    { name: 'Family', icon: Home },
  ];

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(resident.id);
    setShowDeleteModal(false);
    onClose();
    toast.success('Resident deleted successfully');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Resident Details</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Profile Header */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {resident.firstName} {resident.middleName} {resident.lastName}
              </h3>
              <p className="text-gray-500">ID: {resident.id}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{resident.address}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{resident.contactNumber || 'No contact number'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{resident.email || 'No email'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tab.Group onChange={setActiveTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                    ${selected
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                    }`
                  }
                >
                  <div className="flex items-center justify-center space-x-2">
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-6">
              {/* Basic Info Panel */}
              <Tab.Panel className="rounded-xl bg-white p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Birthdate</label>
                        <p className="mt-1 text-gray-900">{new Date(resident.birthdate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Age</label>
                        <p className="mt-1 text-gray-900">{resident.age} years old</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Gender</label>
                        <p className="mt-1 text-gray-900">{resident.gender}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Marital Status</label>
                        <p className="mt-1 text-gray-900">{resident.maritalStatus}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Voter Status</label>
                        <p className="mt-1 text-gray-900">{resident.voterStatus}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Educational Attainment</label>
                        <p className="mt-1 text-gray-900">{resident.educationalAttainment}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Employment Status</label>
                        <p className="mt-1 text-gray-900">{resident.employmentStatus}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Occupation</label>
                        <p className="mt-1 text-gray-900">{resident.occupation || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Programs */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Special Programs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${resident.isTUPAD ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-gray-700">TUPAD</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${resident.isPWD ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-gray-700">PWD</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${resident.is4Ps ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-gray-700">4Ps</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${resident.isSoloParent ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-gray-700">Solo Parent</span>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* Documents Panel */}
              <Tab.Panel className="rounded-xl bg-white p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Documents</h4>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Document items would go here */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Barangay ID</p>
                            <p className="text-sm text-gray-500">Added on Jan 1, 2024</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* History Panel */}
              <Tab.Panel className="rounded-xl bg-white p-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Activity History</h4>
                  <div className="space-y-4">
                    {/* History items would go here */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Profile updated</p>
                        <p className="text-xs text-gray-500">Jan 1, 2024 at 10:00 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* Family Panel */}
              <Tab.Panel className="rounded-xl bg-white p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Family Members</h4>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Family member items would go here */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">John Doe</p>
                          <p className="text-sm text-gray-500">Father</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Resident</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this resident? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 