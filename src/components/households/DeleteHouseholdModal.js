"use client";

import { X, Trash2, AlertTriangle } from 'lucide-react';

export function DeleteHouseholdModal({ household, onClose, onConfirm }) {
  if (!household) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 rounded-full p-3">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-600">Delete Household</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">
                Are you sure you want to delete this household?
              </p>
              <p className="text-red-700 text-sm mt-1">
                Household: {household.head ? 
                  `${household.head.firstName} ${household.head.middleName ? household.head.middleName + ' ' : ''}${household.head.lastName}` :
                  `Household ${household.id}`
                }
              </p>
              <p className="text-red-600 text-sm mt-2">
                This action cannot be undone. All associated data will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 mr-2 inline" />
            Delete Household
          </button>
        </div>
      </div>
    </div>
  );
} 