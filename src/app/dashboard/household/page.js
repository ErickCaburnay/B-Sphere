"use client";

import { useState, useEffect } from 'react';
import { HouseholdClientComponent } from "./household-client-component";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function toISOStringSafe(val) {
  if (!val) return null;
  if (typeof val === 'object' && val.seconds) {
    // Firestore Timestamp
    return new Date(val.seconds * 1000).toISOString();
  }
  if (typeof val === 'object' && val._seconds) {
    // Another Firestore Timestamp format
    return new Date(val._seconds * 1000).toISOString();
  }
  const date = new Date(val);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

export default function HouseholdPage({ searchParams }) {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get page and pageSize from searchParams
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSize = parseInt(searchParams?.pageSize || '10', 10);

  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/households?page=${page}&pageSize=${pageSize}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch households: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        let householdsData = data.data || data;

        // Ensure dates are serializable
        householdsData = Array.isArray(householdsData) ? householdsData.map(household => ({
          ...household,
          createdAt: toISOStringSafe(household.createdAt),
          updatedAt: toISOStringSafe(household.updatedAt),
          head: household.head ? {
            ...household.head,
            birthdate: toISOStringSafe(household.head.birthdate),
            createdAt: toISOStringSafe(household.head.createdAt),
            updatedAt: toISOStringSafe(household.head.updatedAt),
          } : null,
          members: Array.isArray(household.members) ? household.members.map(member => ({
            ...member,
            birthdate: toISOStringSafe(member.birthdate),
            createdAt: toISOStringSafe(member.createdAt),
            updatedAt: toISOStringSafe(member.updatedAt),
          })) : []
        })) : [];

        setHouseholds(householdsData);
      } catch (err) {
        console.error('Error fetching households:', err);
        setError(err.message);
        setHouseholds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHouseholds();
  }, [page, pageSize]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Household Records</h1>
          <p className="text-gray-600">Manage and monitor all registered households in the barangay</p>
          <div className="h-1 bg-green-600 w-full mt-4 rounded"></div>
        </div>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Household Records</h1>
          <p className="text-gray-600">Manage and monitor all registered households in the barangay</p>
          <div className="h-1 bg-green-600 w-full mt-4 rounded"></div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">Error loading households: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Household Records</h1>
        <p className="text-gray-600">Manage and monitor all registered households in the barangay</p>
        <div className="h-1 bg-green-600 w-full mt-4 rounded"></div>
      </div>

      <HouseholdClientComponent initialHouseholds={households} />
    </div>
  );
} 