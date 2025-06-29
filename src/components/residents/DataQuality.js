"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function DataQuality({ residents }) {
  const [qualityChecks, setQualityChecks] = useState({
    completeness: [],
    consistency: [],
    accuracy: [],
    duplicates: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    performQualityChecks();
  }, [residents]);

  const performQualityChecks = () => {
    setIsLoading(true);
    
    // Completeness checks
    const completeness = residents.map(resident => {
      const missingFields = [];
      if (!resident.firstName) missingFields.push('First Name');
      if (!resident.lastName) missingFields.push('Last Name');
      if (!resident.birthdate) missingFields.push('Birthdate');
      if (!resident.address) missingFields.push('Address');
      if (!resident.contactNumber) missingFields.push('Contact Number');
      
      return {
        residentId: resident.id,
        name: `${resident.firstName} ${resident.lastName}`,
        missingFields,
        severity: missingFields.length > 2 ? 'high' : missingFields.length > 0 ? 'medium' : 'low'
      };
    }).filter(check => check.missingFields.length > 0);

    // Consistency checks
    const consistency = residents.map(resident => {
      const issues = [];
      
      // Age consistency
      if (resident.birthdate) {
        const age = calculateAge(resident.birthdate);
        if (age < 0 || age > 120) {
          issues.push('Invalid age calculated from birthdate');
        }
      }

          // Contact number format
    if (resident.contactNumber) {
      const cleanNumber = resident.contactNumber.replace(/\s/g, '');
      if (!/^09\d{9}$/.test(cleanNumber)) {
        issues.push('Invalid contact number format');
      }
    }

      // Email format
      if (resident.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resident.email)) {
        issues.push('Invalid email format');
      }

      return {
        residentId: resident.id,
        name: `${resident.firstName} ${resident.lastName}`,
        issues,
        severity: issues.length > 0 ? 'medium' : 'low'
      };
    }).filter(check => check.issues.length > 0);

    // Accuracy checks
    const accuracy = residents.map(resident => {
      const issues = [];
      
      // Name format
      if (resident.firstName && !/^[A-Za-z\s-']+$/.test(resident.firstName)) {
        issues.push('First name contains invalid characters');
      }
      if (resident.lastName && !/^[A-Za-z\s-']+$/.test(resident.lastName)) {
        issues.push('Last name contains invalid characters');
      }

      // Address format
      if (resident.address && resident.address.length < 5) {
        issues.push('Address seems too short');
      }

      return {
        residentId: resident.id,
        name: `${resident.firstName} ${resident.lastName}`,
        issues,
        severity: issues.length > 0 ? 'medium' : 'low'
      };
    }).filter(check => check.issues.length > 0);

    // Duplicate checks
    const duplicates = findDuplicates(residents);

    setQualityChecks({
      completeness,
      consistency,
      accuracy,
      duplicates
    });
    setIsLoading(false);
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const findDuplicates = (residents) => {
    const duplicates = [];
    const nameMap = new Map();

    residents.forEach(resident => {
      const fullName = `${resident.firstName} ${resident.lastName}`.toLowerCase();
      if (nameMap.has(fullName)) {
        duplicates.push({
          residentId: resident.id,
          name: fullName,
          duplicateOf: nameMap.get(fullName),
          details: `Potential duplicate of record ID: ${nameMap.get(fullName)}`,
          severity: 'high'
        });
      } else {
        nameMap.set(fullName, resident.id);
      }
    });

    return duplicates;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="ml-2 text-gray-600">Performing data quality checks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Resident Data Quality Report</h3>
        <button
          onClick={performQualityChecks}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Checks
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completeness Issues</p>
            <p className="text-2xl font-semibold text-gray-900">{qualityChecks.completeness.length}</p>
          </div>
          <AlertTriangle size={32} className="text-yellow-500" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Consistency Issues</p>
            <p className="text-2xl font-semibold text-gray-900">{qualityChecks.consistency.length}</p>
          </div>
          <AlertTriangle size={32} className="text-orange-500" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Accuracy Issues</p>
            <p className="text-2xl font-semibold text-gray-900">{qualityChecks.accuracy.length}</p>
          </div>
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Duplicate Records</p>
            <p className="text-2xl font-semibold text-gray-900">{qualityChecks.duplicates.length}</p>
          </div>
          <XCircle size={32} className="text-red-500" />
        </div>
      </div>

      {/* Detailed Report Sections */}
      {[ 'completeness', 'consistency', 'accuracy', 'duplicates' ].map(type => (
        <div key={type} className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 capitalize">{type.replace('s', ' Errors')}</h4>
          {qualityChecks[type].length > 0 ? (
            <div className="space-y-4">
              {qualityChecks[type].map((check, index) => (
                <div key={index} className="flex items-start gap-3">
                  {getSeverityIcon(check.severity)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Resident ID: {check.residentId}</p>
                    <p className="text-sm text-gray-500">{check.details}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No {type.replace('s', '')} issues found.</p>
          )}
        </div>
      ))}
    </div>
  );
} 