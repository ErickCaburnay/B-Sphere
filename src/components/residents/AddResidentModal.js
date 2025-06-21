"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

export function AddResidentModal({ isOpen, onClose, onSubmit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
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
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <h3 className="text-xl font-semibold leading-6 text-gray-900">
                    Add New Resident
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        {...register('firstName', { required: 'First name is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        {...register('middleName')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        {...register('lastName', { required: 'Last name is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Suffix
                      </label>
                      <input
                        type="text"
                        {...register('suffix')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        {...register('address')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                    </div>

                    

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Citizenship
                      </label>
                      <input
                        type="text"
                        {...register('citizenship')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Birthdate
                      </label>
                      <input
                        type="date"
                        {...register('birthdate', { required: 'Birthdate is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      {errors.birthdate && (
                        <p className="mt-1 text-sm text-red-600">{errors.birthdate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Birthplace
                      </label>
                      <input
                        type="text"
                        {...register('birthplace')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        {...register('gender', { required: 'Gender is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                      >
                        <option value="">SELECT GENDER</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Voter Status
                      </label>
                      <select
                        {...register('voterStatus', { required: 'Voter status is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                      >
                        <option value="">SELECT STATUS</option>
                        <option value="REGISTERED">REGISTERED</option>
                        <option value="NOT REGISTERED">NOT REGISTERED</option>
                      </select>
                      {errors.voterStatus && (
                        <p className="mt-1 text-sm text-red-600">{errors.voterStatus.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Marital Status
                      </label>
                      <select
                        {...register('maritalStatus', { required: 'Marital status is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                      >
                        <option value="">SELECT STATUS</option>
                        <option value="SINGLE">SINGLE</option>
                        <option value="MARRIED">MARRIED</option>
                        <option value="WIDOWED">WIDOWED</option>
                        <option value="SEPARATED">SEPARATED</option>
                      </select>
                      {errors.maritalStatus && (
                        <p className="mt-1 text-sm text-red-600">{errors.maritalStatus.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Employment Status
                      </label>
                      <select
                        {...register('employmentStatus')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                      >
                        <option value="">SELECT EMPLOYMENT STATUS</option>
                        <option value="EMPLOYED">EMPLOYED</option>
                        <option value="UNEMPLOYED">UNEMPLOYED</option>
                        <option value="SELF-EMPLOYED">SELF-EMPLOYED</option>
                        <option value="STUDENT">STUDENT</option>
                        <option value="RETIRED">RETIRED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Educational Attainment
                      </label>
                      <select
                        {...register('educationalAttainment')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                      >
                        <option value="">SELECT EDUCATION LEVEL</option>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contact No.
                      </label>
                      <input
                        type="text"
                        {...register('contactNunmber')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm lowercase"
                        onInput={(e) => e.target.value = e.target.value.toLowerCase()}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Occupation
                      </label>
                      <input
                        type="text"
                        {...register('occupation')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm uppercase"
                        onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Programs & Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('isTUPAD')}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          TUPAD
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('is4Ps')}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          4Ps
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('isPWD')}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          PWD
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('isSoloParent')}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Solo Parent
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add Resident
                    </button>
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