import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatContactNumberDisplay, cleanContactNumber } from '../ui/ContactNumberInput';

export function EditResidentModal({ resident, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    address: '',
    birthdate: '',
    birthplace: '',
    citizenship: '',
    gender: '',
    voterStatus: '',
    maritalStatus: '',
    employmentStatus: '',
    educationalAttainment: '',
    occupation: '',
    contactNumber: '',
    email: '',
    isTUPAD: false,
    isPWD: false,
    is4Ps: false,
    isSoloParent: false
  });

  useEffect(() => {
    if (resident) {
      setFormData({
        ...resident,
        birthdate: new Date(resident.birthdate).toISOString().split('T')[0],
        contactNumber: formatContactNumberDisplay(resident.contactNumber)
      });
    }
  }, [resident]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'contactNumber') {
      // Format contact number as user types
      const numbers = value.replace(/\D/g, '');
      let formatted = '';
      
      if (numbers.length > 11) {
        return; // Don't allow more than 11 digits
      }
      
      if (numbers.length > 0) {
        if (numbers.length <= 4) {
          formatted = numbers;
        } else if (numbers.length <= 7) {
          formatted = `${numbers.substring(0, 4)} ${numbers.substring(4)}`;
        } else {
          formatted = `${numbers.substring(0, 4)} ${numbers.substring(4, 7)} ${numbers.substring(7, 11)}`;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean contact number for database storage
      const cleanedData = {
        ...formData,
        contactNumber: cleanContactNumber(formData.contactNumber)
      };
      await onUpdate(resident.id, cleanedData);
      onClose();
    } catch (error) {
      console.error('Error updating resident:', error);
    }
  };

  if (!resident) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Edit Resident</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Personal Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Suffix</label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Additional Information</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700">Birthdate</label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Birthplace</label>
                <input
                  type="text"
                  name="birthplace"
                  value={formData.birthplace}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Citizenship</label>
                <input
                  type="text"
                  name="citizenship"
                  value={formData.citizenship}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Information</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="0921 234 5678"
                  onKeyDown={(e) => {
                    // Allow backspace, delete, tab, escape, enter, arrow keys
                    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true) ||
                      // Allow home, end
                      (e.keyCode >= 35 && e.keyCode <= 36)) {
                      return;
                    }
                    // Ensure that it is a number and stop the keypress
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                      e.preventDefault();
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Special Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Special Categories</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isTUPAD"
                  checked={formData.isTUPAD}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">TUPAD</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPWD"
                  checked={formData.isPWD}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">PWD</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is4Ps"
                  checked={formData.is4Ps}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">4Ps</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isSoloParent"
                  checked={formData.isSoloParent}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Solo Parent</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Resident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 