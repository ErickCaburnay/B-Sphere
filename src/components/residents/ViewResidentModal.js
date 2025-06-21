import { X } from 'lucide-react';

export function ViewResidentModal({ resident, onClose }) {
  if (!resident) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Resident Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
              <p className="mt-1">{`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName} ${resident.suffix || ''}`}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Address</h4>
              <p className="mt-1">{resident.address}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Birth Information</h4>
              <p className="mt-1">
                {new Date(resident.birthdate).toLocaleDateString()} in {resident.birthplace}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Citizenship</h4>
              <p className="mt-1">{resident.citizenship}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
              <p className="mt-1">Gender: {resident.gender}</p>
              <p className="mt-1">Marital Status: {resident.maritalStatus}</p>
              <p className="mt-1">Voter Status: {resident.voterStatus}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Education & Employment</h4>
              <p className="mt-1">Education: {resident.educationalAttainment}</p>
              <p className="mt-1">Employment: {resident.employmentStatus}</p>
              <p className="mt-1">Occupation: {resident.occupation}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
              <p className="mt-1">Phone: {resident.contactNumber}</p>
              <p className="mt-1">Email: {resident.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Special Categories</h4>
          <div className="flex flex-wrap gap-2">
            {resident.isTUPAD && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                TUPAD
              </span>
            )}
            {resident.isPWD && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                PWD
              </span>
            )}
            {resident.is4Ps && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                4Ps
              </span>
            )}
            {resident.isSoloParent && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Solo Parent
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 