"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Home, Users } from 'lucide-react';

export function HouseholdDataQuality({ households, residents }) {
  const [qualityChecks, setQualityChecks] = useState({
    completeness: [],
    consistency: [],
    accuracy: [],
    duplicates: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    performQualityChecks();
  }, [households, residents]);

  const performQualityChecks = () => {
    setIsLoading(true);
    
    const completeness = [];
    const consistency = [];
    const accuracy = [];
    const duplicates = [];

    // Convert households object to an array for easier processing
    const householdsArray = Object.values(households);

    // Completeness checks for households
    householdsArray.forEach(household => {
      const missingFields = [];
      if (!household.address) missingFields.push('Address');
      if (!household.members || household.members.length === 0) missingFields.push('Members');
      if (!household.members.some(m => m.isHeadOfHousehold)) missingFields.push('Head of Household');

      if (missingFields.length > 0) {
        completeness.push({
          householdId: household.id,
          details: `Missing fields: ${missingFields.join(', ')}`,
          severity: missingFields.length > 2 ? 'high' : 'medium'
        });
      }
    });

    // Consistency checks for households
    householdsArray.forEach(household => {
      const issues = [];

      // Check for members without a householdId pointing back to this household
      household.members.forEach(member => {
        const residentData = residents.find(r => r.id === member.id);
        if (residentData && residentData.householdId !== household.id) {
          issues.push(`Member ${member.firstName} ${member.lastName} has inconsistent household assignment.`);
        }
      });

      // Check for multiple heads of household
      const heads = household.members.filter(m => m.isHeadOfHousehold);
      if (heads.length > 1) {
        issues.push('Multiple heads of household detected.');
      }

      if (issues.length > 0) {
        consistency.push({
          householdId: household.id,
          details: `Consistency issues: ${issues.join('; ')}`,
          severity: 'high'
        });
      }
    });

    // Accuracy checks (e.g., address format validation - simplified for now)
    householdsArray.forEach(household => {
      const issues = [];
      if (household.address && household.address.length < 5) {
        issues.push('Address seems too short or invalid.');
      }
      // More complex address validation could go here

      if (issues.length > 0) {
        accuracy.push({
          householdId: household.id,
          details: `Accuracy issues: ${issues.join('; ')}`,
          severity: 'medium'
        });
      }
    });

    // Duplicate household detection (simplified by address)
    const addressMap = new Map();
    householdsArray.forEach(household => {
      const normalizedAddress = household.address.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (addressMap.has(normalizedAddress)) {
        duplicates.push({
          householdId: household.id,
          duplicateOf: addressMap.get(normalizedAddress),
          details: `Potential duplicate with household ID ${addressMap.get(normalizedAddress)} based on address.`,
          severity: 'high'
        });
      } else {
        addressMap.set(normalizedAddress, household.id);
      }
    });

    setQualityChecks({
      completeness,
      consistency,
      accuracy,
      duplicates
    });
    setIsLoading(false);
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
        <h3 className="text-lg font-semibold text-gray-900">Household Data Quality Report</h3>
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
            <p className="text-sm font-medium text-gray-500">Duplicate Households</p>
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
                    <p className="text-sm font-medium text-gray-900">Household ID: {check.householdId}</p>
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