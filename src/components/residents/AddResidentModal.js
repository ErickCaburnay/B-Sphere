"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, User, MapPin, Calendar, Phone, Mail, Briefcase, GraduationCap, Users, Heart, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ContactNumberInput, cleanContactNumber } from '../ui/ContactNumberInput';

export function AddResidentModal({ isOpen, onClose, onSubmit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleFormSubmit = async (data) => {
    try {
      // Clean contact number for database storage
      const cleanedData = {
        ...data,
        contactNumber: cleanContactNumber(data.contactNumber)
      };
      await onSubmit(cleanedData);
      reset();
      onClose();
      toast.success('Resident added successfully!');
    } catch (error) {
      toast.error('Failed to add resident. Please try again.');
    }
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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold text-white">
                          Add New Resident
                        </Dialog.Title>
                        <p className="text-green-100 text-sm">Fill in the information below to register a new resident</p>
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
                  <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                    
                    {/* Personal Information Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-green-100 rounded-full p-2">
                          <User className="h-5 w-5 text-green-600" />
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
                            {...register('firstName', { 
                              required: 'First name is required',
                              pattern: {
                                value: /^[A-Za-z\s]+$/,
                                message: 'First name should only contain letters and spaces'
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter first name"
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                          />
                          {errors.firstName && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.firstName.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Middle Name
                          </label>
                          <input
                            type="text"
                            {...register('middleName', {
                              pattern: {
                                value: /^[A-Za-z\s]*$/,
                                message: 'Middle name should only contain letters and spaces'
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter middle name"
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                          />
                          {errors.middleName && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.middleName.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <span>Last Name</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            {...register('lastName', { 
                              required: 'Last name is required',
                              pattern: {
                                value: /^[A-Za-z\s]+$/,
                                message: 'Last name should only contain letters and spaces'
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter last name"
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                          />
                          {errors.lastName && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.lastName.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Suffix
                          </label>
                          <input
                            type="text"
                            {...register('suffix', {
                              pattern: {
                                value: /^[A-Za-z.\s]*$/,
                                message: 'Suffix should only contain letters, dots, and spaces'
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Jr., Sr., III, etc."
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                          />
                          {errors.suffix && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.suffix.message}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Basic Details Section */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-emerald-100 rounded-full p-2">
                          <Calendar className="h-5 w-5 text-emerald-600" />
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
                            {...register('birthdate', { 
                              required: 'Birthdate is required',
                              validate: {
                                notFuture: value => {
                                  const today = new Date();
                                  const birthDate = new Date(value);
                                  return birthDate <= today || 'Birthdate cannot be in the future';
                                },
                                validAge: value => {
                                  const today = new Date();
                                  const birthDate = new Date(value);
                                  const age = today.getFullYear() - birthDate.getFullYear();
                                  return age <= 150 || 'Please enter a valid birthdate';
                                }
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          />
                          {errors.birthdate && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.birthdate.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            <span>Birthplace</span>
                          </label>
                          <input
                            type="text"
                            {...register('birthplace', {
                              pattern: {
                                value: /^[A-Za-z\s,.-]*$/,
                                message: 'Birthplace should only contain letters, spaces, and common punctuation'
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter birthplace"
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                          />
                          {errors.birthplace && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.birthplace.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Users className="h-4 w-4 inline mr-1" />
                            <span>Gender</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register('gender', { required: 'Gender is required' })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                          </select>
                          {errors.gender && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.gender.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Citizenship
                          </label>
                          <input
                            type="text"
                            {...register('citizenship', {
                              pattern: {
                                value: /^[A-Za-z\s]*$/,
                                message: 'Citizenship should only contain letters and spaces'
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter citizenship"
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                          />
                          {errors.citizenship && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.citizenship.message}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address & Contact Section */}
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-teal-100 rounded-full p-2">
                          <MapPin className="h-5 w-5 text-teal-600" />
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
                            {...register('address')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter complete address"
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                          />
                        </div>

                        <ContactNumberInput
                          register={register}
                          errors={errors}
                          name="contactNumber"
                          label="Contact Number"
                          required={false}
                        />

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Mail className="h-4 w-4 inline mr-1" />
                            <span>Email Address</span>
                          </label>
                          <input
                            type="email"
                            {...register('email', {
                              pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/,
                                message: 'Email must be in format: example@domain.com'
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md lowercase placeholder:normal-case"
                            placeholder="example@domain.com"
                            onInput={(e) => e.target.value = e.target.value.toLowerCase()}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.email.message}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status & Classification Section */}
                    <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-green-100 rounded-full p-2">
                          <Heart className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Status & Classification</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            <span>Voter Status</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register('voterStatus', { required: 'Voter status is required' })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          >
                            <option value="">Select Voter Status</option>
                            <option value="REGISTERED">REGISTERED</option>
                            <option value="NOT REGISTERED">NOT REGISTERED</option>
                          </select>
                          {errors.voterStatus && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.voterStatus.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Heart className="h-4 w-4 inline mr-1" />
                            <span>Marital Status</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register('maritalStatus', { required: 'Marital status is required' })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          >
                            <option value="">Select Marital Status</option>
                            <option value="SINGLE">SINGLE</option>
                            <option value="MARRIED">MARRIED</option>
                            <option value="WIDOWED">WIDOWED</option>
                            <option value="SEPARATED">SEPARATED</option>
                          </select>
                          {errors.maritalStatus && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.maritalStatus.message}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Information Section */}
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-emerald-100 rounded-full p-2">
                          <Briefcase className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Professional Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <Briefcase className="h-4 w-4 inline mr-1" />
                            <span>Employment Status</span>
                          </label>
                          <select
                            {...register('employmentStatus')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
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
                            <Briefcase className="h-4 w-4 inline mr-1" />
                            <span>Occupation</span>
                          </label>
                          <input
                            type="text"
                            {...register('occupation', {
                              pattern: {
                                value: /^[A-Za-z\s.-]*$/,
                                message: 'Occupation should only contain letters, spaces, dots, and hyphens'
                              }
                            })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase placeholder:normal-case"
                            placeholder="Enter occupation"
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                          />
                          {errors.occupation && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <span>⚠</span>
                              <span>{errors.occupation.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            <GraduationCap className="h-4 w-4 inline mr-1" />
                            <span>Educational Attainment</span>
                          </label>
                          <select
                            {...register('educationalAttainment')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          >
                            <option value="">Select Education Level</option>
                            <option value="NO FORMAL EDUCATION">NO FORMAL EDUCATION</option>
                            <option value="ELEMENTARY LEVEL">ELEMENTARY LEVEL</option>
                            <option value="ELEMENTARY GRADUATE">ELEMENTARY GRADUATE</option>
                            <option value="HIGH SCHOOL LEVEL">HIGH SCHOOL LEVEL</option>
                            <option value="HIGH SCHOOL GRADUATE">HIGH SCHOOL GRADUATE</option>
                            <option value="VOCATIONAL/TECHNICAL GRADUATE">VOCATIONAL/TECHNICAL GRADUATE</option>
                            <option value="COLLEGE LEVEL">COLLEGE LEVEL</option>
                            <option value="COLLEGE GRADUATE">COLLEGE GRADUATE</option>
                            <option value="POST GRADUATE">POST GRADUATE</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Programs & Benefits Section */}
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-teal-100 rounded-full p-2">
                          <CheckCircle className="h-5 w-5 text-teal-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Programs & Benefits</h3>
                        <span className="text-sm text-gray-500">(Check all that apply)</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <input
                                type="checkbox"
                                {...register('isTUPAD')}
                                className="sr-only"
                                id="tupad-checkbox"
                              />
                              <label
                                htmlFor="tupad-checkbox"
                                className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-full cursor-pointer transition-all duration-200 hover:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
                              >
                                <div className="w-3 h-3 bg-teal-500 rounded-full opacity-0 transition-opacity duration-200 checkbox-checked:opacity-100"></div>
                              </label>
                            </div>
                            <label htmlFor="tupad-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                              TUPAD
                            </label>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <input
                                type="checkbox"
                                {...register('is4Ps')}
                                className="sr-only"
                                id="4ps-checkbox"
                              />
                              <label
                                htmlFor="4ps-checkbox"
                                className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-full cursor-pointer transition-all duration-200 hover:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
                              >
                                <div className="w-3 h-3 bg-teal-500 rounded-full opacity-0 transition-opacity duration-200 checkbox-checked:opacity-100"></div>
                              </label>
                            </div>
                            <label htmlFor="4ps-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                              4Ps
                            </label>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <input
                                type="checkbox"
                                {...register('isPWD')}
                                className="sr-only"
                                id="pwd-checkbox"
                              />
                              <label
                                htmlFor="pwd-checkbox"
                                className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-full cursor-pointer transition-all duration-200 hover:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
                              >
                                <div className="w-3 h-3 bg-teal-500 rounded-full opacity-0 transition-opacity duration-200 checkbox-checked:opacity-100"></div>
                              </label>
                            </div>
                            <label htmlFor="pwd-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                              PWD
                            </label>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <input
                                type="checkbox"
                                {...register('isSoloParent')}
                                className="sr-only"
                                id="solo-parent-checkbox"
                              />
                              <label
                                htmlFor="solo-parent-checkbox"
                                className="flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-full cursor-pointer transition-all duration-200 hover:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
                              >
                                <div className="w-3 h-3 bg-teal-500 rounded-full opacity-0 transition-opacity duration-200 checkbox-checked:opacity-100"></div>
                              </label>
                            </div>
                            <label htmlFor="solo-parent-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                              Solo Parent
                            </label>
                          </div>
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
                      onClick={reset}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit(handleFormSubmit)}
                      className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Add Resident
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