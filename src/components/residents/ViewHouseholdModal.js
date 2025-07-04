"use client";

import { X, Home, User, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { formatContactNumberDisplay } from '../ui/ContactNumberInput';

export function ViewHouseholdModal({ household, onClose }) {
  if (!household) return null;

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-teal-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Home className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Household Information</h2>
                <p className="text-green-100 text-sm">Complete household details and records</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Home className="h-4 w-4 text-green-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Basic Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Household ID</label>
                  <p className="text-gray-900 font-medium text-sm">{household.id}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total Members</label>
                  <p className="text-gray-900 font-medium text-sm">{household.totalMembers || 0}</p>
                </div>
              </div>
            </div>

            {/* Head of Household */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="h-4 w-4 text-blue-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Head of Household</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium text-sm">
                    {household.head ? 
                      `${household.head.firstName} ${household.head.middleName ? household.head.middleName + ' ' : ''}${household.head.lastName}` :
                      'N/A'
                    }
                  </p>
                </div>
                {household.head?.birthdate && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Birth Date</label>
                    <p className="text-gray-900 font-medium text-sm">{formatDateDisplay(household.head.birthdate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Phone className="h-4 w-4 text-purple-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Contact Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-3 w-3 text-gray-400 mr-2 mt-1" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 font-medium text-sm">{household.address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-3 w-3 text-gray-400 mr-2 mt-1" />
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Phone Number</label>
                    <p className="text-gray-900 font-medium text-sm">
                      {formatContactNumberDisplay(household.contactNumber) || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Record Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 text-gray-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">Record Information</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date Added</label>
                  <p className="text-gray-900 font-medium text-sm">{formatDateDisplay(household.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-gray-900 font-medium text-sm">{formatDateDisplay(household.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Household Members Section */}
          {household.members && household.members.length > 0 && (
            <div className="mt-6">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Household Members</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {household.members.map((member, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="bg-teal-100 rounded-full p-2">
                          <User className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.fullName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">
                            {member.relationship || 'Member'} • {member.age ? `${member.age} years old` : 'Age N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 