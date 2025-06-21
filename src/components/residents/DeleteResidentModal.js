import { X } from 'lucide-react';

export function DeleteResidentModal({ resident, onClose, onConfirm }) {
  if (!resident) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-red-600">Delete Resident</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Are you sure you want to delete the resident record for{' '}
            <span className="font-semibold">
              {resident.firstName} {resident.middleName ? resident.middleName + ' ' : ''}{resident.lastName}
            </span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            This action cannot be undone. All associated data will be permanently deleted.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(resident.id)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Resident
          </button>
        </div>
      </div>
    </div>
  );
} 