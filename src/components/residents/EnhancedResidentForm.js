"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  User, Home, Phone, Mail, Calendar, 
  FileText, X, Camera, MapPin,
  Upload, Check, AlertCircle
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export function EnhancedResidentForm({ resident, onSubmit, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: resident || {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      birthdate: new Date(),
      birthplace: '',
      citizenship: '',
      gender: '',
      maritalStatus: '',
      address: '',
      contactNumber: '',
      email: '',
      voterStatus: '',
      educationalAttainment: '',
      employmentStatus: '',
      occupation: '',
      isTUPAD: false,
      isPWD: false,
      is4Ps: false,
      isSoloParent: false
    }
  });

  const tabs = [
    { name: 'Basic Information', icon: User },
    { name: 'Contact Details', icon: Phone },
    { name: 'Additional Information', icon: FileText },
    { name: 'Special Programs', icon: Home },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitForm = async (data) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success('Resident saved successfully');
      onClose();
    } catch (error) {
      toast.error('Error saving resident');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {resident ? 'Edit Resident' : 'Add New Resident'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 overflow-y-auto">
          {/* Profile Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {selectedImage ? (
                  <img src={selectedImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 cursor-pointer">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {tabs.map((tab, index) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(index)}
                  className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5
                    ${activeTab === index
                      ? 'bg-white text-blue-600 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {activeTab === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    {...register('middleName')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suffix</label>
                  <input
                    type="text"
                    {...register('suffix')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Birthdate</label>
                  <DatePicker
                    selected={watch('birthdate')}
                    onChange={(date) => setValue('birthdate', date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Birthplace</label>
                  <input
                    type="text"
                    {...register('birthplace', { required: 'Birthplace is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.birthplace && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthplace.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                  <select
                    {...register('maritalStatus', { required: 'Marital status is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                  {errors.maritalStatus && (
                    <p className="mt-1 text-sm text-red-600">{errors.maritalStatus.message}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    {...register('address', { required: 'Address is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    {...register('contactNumber', {
                      pattern: {
                        value: /^09\d{2}\s\d{3}\s\d{4}$/,
                        message: 'Contact number must be in format: 0921 234 5678'
                      }
                    })}
                    placeholder="0921 234 5678"
                    onInput={(e) => {
                      const numbers = e.target.value.replace(/\D/g, '');
                      let formatted = '';
                      
                      if (numbers.length > 11) {
                        e.target.value = e.target.value.slice(0, -1);
                        return;
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
                      
                      e.target.value = formatted;
                    }}
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
                    {...register('email')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Voter Status</label>
                  <select
                    {...register('voterStatus', { required: 'Voter status is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="Registered">Registered</option>
                    <option value="Not Registered">Not Registered</option>
                  </select>
                  {errors.voterStatus && (
                    <p className="mt-1 text-sm text-red-600">{errors.voterStatus.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Educational Attainment</label>
                  <select
                    {...register('educationalAttainment')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select level</option>
                    <option value="No Formal Education">No Formal Education</option>
                    <option value="Elementary">Elementary</option>
                    <option value="High School">High School</option>
                    <option value="Vocational">Vocational</option>
                    <option value="College">College</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                  <select
                    {...register('employmentStatus')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <input
                    type="text"
                    {...register('occupation')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isTUPAD')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">TUPAD Beneficiary</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isPWD')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Person with Disability (PWD)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('is4Ps')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">4Ps Beneficiary</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isSoloParent')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Solo Parent</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Resident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 