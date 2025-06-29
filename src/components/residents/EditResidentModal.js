"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, MapPin, Calendar, Phone, Mail, Briefcase, GraduationCap, Users, Heart, CheckCircle, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatContactNumberDisplay, cleanContactNumber } from '../ui/ContactNumberInput';

export function EditResidentModal({ resident, isOpen, onClose, onUpdate }) {
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (resident) {
      // Handle birthdate formatting - check if it's already a string or needs conversion
      let formattedBirthdate = '';
      if (resident.birthdate) {
        if (typeof resident.birthdate === 'string') {
          // Check if it's already in YYYY-MM-DD format
          if (resident.birthdate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            formattedBirthdate = resident.birthdate;
          } else {
            // Try to parse it as a date string and convert
            try {
              formattedBirthdate = new Date(resident.birthdate).toISOString().split('T')[0];
            } catch (error) {
              console.error('Error parsing birthdate string:', error);
              formattedBirthdate = '';
            }
          }
        } else if (resident.birthdate.seconds) {
          // Firebase timestamp
          formattedBirthdate = new Date(resident.birthdate.seconds * 1000).toISOString().split('T')[0];
        } else if (resident.birthdate instanceof Date) {
          // JavaScript Date object
          formattedBirthdate = resident.birthdate.toISOString().split('T')[0];
        } else {
          // Try to convert whatever it is to a date
          try {
            formattedBirthdate = new Date(resident.birthdate).toISOString().split('T')[0];
          } catch (error) {
            console.error('Error converting birthdate:', error);
            formattedBirthdate = '';
          }
        }
      }




      setFormData({
        ...resident,
        birthdate: formattedBirthdate,
        contactNumber: formatContactNumberDisplay(resident.contactNumber) || ''
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
    } else if (name === 'firstName' || name === 'middleName' || name === 'lastName' || name === 'suffix' || name === 'birthplace' || name === 'citizenship') {
      // Convert to uppercase for name fields
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else if (name === 'address') {
      // Convert address to uppercase
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else if (name === 'email') {
      // Convert email to lowercase
      setFormData(prev => ({
        ...prev,
        [name]: value.toLowerCase()
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
    setIsSubmitting(true);
    
    try {
      // Clean contact number for database storage
      const cleanedData = {
        ...formData,
        contactNumber: cleanContactNumber(formData.contactNumber)
      };
      await onUpdate(resident.id, cleanedData);
      toast.success('Resident updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating resident:', error);
      toast.error('Failed to update resident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resident) return null;

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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Edit className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold text-white">
                          Edit Resident
                        </Dialog.Title>
                        <p className="text-blue-100 text-sm">Update resident information below</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                      onClick={onClose}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Personal Information Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-blue-100 rounded-full p-2">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>First Name</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter first name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Middle Name
                          </label>
                          <input
                            type="text"
                            name="middleName"
                            value={formData.middleName || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter middle name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Last Name</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter last name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Suffix
                          </label>
                          <input
                            type="text"
                            name="suffix"
                            value={formData.suffix || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Jr., Sr., III, etc."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Basic Details Section */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-indigo-100 rounded-full p-2">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Basic Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            <span>Birthdate</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            <span>Birthplace</span>
                          </label>
                          <input
                            type="text"
                            name="birthplace"
                            value={formData.birthplace}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter birthplace"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Users className="h-4 w-4 inline mr-1" />
                            <span>Gender</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Citizenship
                          </label>
                          <input
                            type="text"
                            name="citizenship"
                            value={formData.citizenship}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter citizenship"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Heart className="h-4 w-4 inline mr-1" />
                            <span>Marital Status</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            name="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            required
                          >
                            <option value="">Select Marital Status</option>
                            <option value="SINGLE">SINGLE</option>
                            <option value="MARRIED">MARRIED</option>
                            <option value="WIDOWED">WIDOWED</option>
                            <option value="SEPARATED">SEPARATED</option>
                            <option value="DIVORCED">DIVORCED</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            <span>Voter Status</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            name="voterStatus"
                            value={formData.voterStatus}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                            required
                          >
                            <option value="">Select Voter Status</option>
                            <option value="REGISTERED">REGISTERED</option>
                            <option value="NOT REGISTERED">NOT REGISTERED</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Address & Contact Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-purple-100 rounded-full p-2">
                          <MapPin className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Address & Contact Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            <span>Address</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter complete address"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Phone className="h-4 w-4 inline mr-1" />
                            <span>Contact Number</span>
                          </label>
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Mail className="h-4 w-4 inline mr-1" />
                            <span>Email Address</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md lowercase placeholder:normal-case"
                            placeholder="example@domain.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Education & Employment Section */}
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-green-100 rounded-full p-2">
                          <Briefcase className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Education & Employment</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <GraduationCap className="h-4 w-4 inline mr-1" />
                            <span>Educational Attainment</span>
                          </label>
                          <select
                            name="educationalAttainment"
                            value={formData.educationalAttainment || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          >
                            <option value="">Select Education Level</option>
                            <option value="ELEMENTARY">ELEMENTARY</option>
                            <option value="HIGH SCHOOL">HIGH SCHOOL</option>
                            <option value="COLLEGE">COLLEGE</option>
                            <option value="VOCATIONAL">VOCATIONAL</option>
                            <option value="POST GRADUATE">POST GRADUATE</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Briefcase className="h-4 w-4 inline mr-1" />
                            <span>Employment Status</span>
                          </label>
                          <select
                            name="employmentStatus"
                            value={formData.employmentStatus || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          >
                            <option value="">Select Employment Status</option>
                            <option value="EMPLOYED">EMPLOYED</option>
                            <option value="UNEMPLOYED">UNEMPLOYED</option>
                            <option value="SELF-EMPLOYED">SELF-EMPLOYED</option>
                            <option value="STUDENT">STUDENT</option>
                            <option value="RETIRED">RETIRED</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Occupation</span>
                          </label>
                          <input
                            type="text"
                            name="occupation"
                            value={formData.occupation || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter occupation"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Special Programs Section */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-yellow-100 rounded-full p-2">
                          <CheckCircle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Special Programs & Benefits</h3>
                        <span className="text-sm text-gray-500">(Check all that apply)</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div 
                          className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                            formData.isTUPAD 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => handleChange({ target: { name: 'isTUPAD', type: 'checkbox', checked: !formData.isTUPAD } })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.isTUPAD 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {formData.isTUPAD && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">TUPAD</label>
                          </div>
                        </div>

                        <div 
                          className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                            formData.is4Ps 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => handleChange({ target: { name: 'is4Ps', type: 'checkbox', checked: !formData.is4Ps } })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.is4Ps 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {formData.is4Ps && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">4Ps</label>
                          </div>
                        </div>

                        <div 
                          className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                            formData.isPWD 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => handleChange({ target: { name: 'isPWD', type: 'checkbox', checked: !formData.isPWD } })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.isPWD 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {formData.isPWD && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">PWD</label>
                          </div>
                        </div>

                        <div 
                          className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                            formData.isSoloParent 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => handleChange({ target: { name: 'isSoloParent', type: 'checkbox', checked: !formData.isSoloParent } })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.isSoloParent 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {formData.isSoloParent && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">Solo Parent</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                          isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Resident'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
