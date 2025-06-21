"use client";

import { useState } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';

export function AdvancedFilters({ onFilterChange, onClose }) {
  const [filters, setFilters] = useState({
    ageRange: { min: '', max: '' },
    dateRange: { start: '', end: '' },
    employmentStatus: [],
    educationalAttainment: [],
    specialPrograms: [],
    voterStatus: '',
    maritalStatus: '',
    gender: ''
  });

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleMultiSelect = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      ageRange: { min: '', max: '', },
      dateRange: { start: '', end: '', },
      employmentStatus: [],
      educationalAttainment: [],
      specialPrograms: [],
      voterStatus: '',
      maritalStatus: '',
      gender: ''
    });
    onFilterChange(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Advanced Filters</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Range
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.ageRange.min}
                onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, min: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.ageRange.max}
                onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, max: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Date Range
            </label>
            <div className="flex gap-4">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Status
            </label>
            <div className="space-y-2">
              {['Employed', 'Unemployed', 'Self-employed', 'Student'].map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.employmentStatus.includes(status)}
                    onChange={() => handleMultiSelect('employmentStatus', status)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Educational Attainment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Educational Attainment
            </label>
            <div className="space-y-2">
              {[
                'No Formal Education',
                'Elementary',
                'High School',
                'Vocational',
                'College',
                'Post Graduate'
              ].map(level => (
                <label key={level} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.educationalAttainment.includes(level)}
                    onChange={() => handleMultiSelect('educationalAttainment', level)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Programs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Programs
            </label>
            <div className="space-y-2">
              {['TUPAD', 'PWD', '4Ps', 'Solo Parent'].map(program => (
                <label key={program} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.specialPrograms.includes(program)}
                    onChange={() => handleMultiSelect('specialPrograms', program)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{program}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Voter Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voter Status
            </label>
            <select
              value={filters.voterStatus}
              onChange={(e) => handleFilterChange('voterStatus', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="Registered">Registered</option>
              <option value="Not Registered">Not Registered</option>
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marital Status
            </label>
            <select
              value={filters.maritalStatus}
              onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
} 