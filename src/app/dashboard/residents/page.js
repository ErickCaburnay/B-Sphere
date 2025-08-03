"use client";

import { useState, useEffect } from 'react';
import { EnhancedResidentsView } from '@/components/residents/EnhancedResidentsView';
import DashboardPageContainer from '@/components/DashboardPageContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ResidentsPage({ searchParams }) {
  const [residents, setResidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get page and pageSize from searchParams
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSize = parseInt(searchParams?.pageSize || '10', 10);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/residents?page=${page}&pageSize=${pageSize}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch residents: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle different response formats
        const residentsData = data.data || data.residents || data;
        const totalCount = data.total || data.count || residentsData.length;

        // Serialize dates for client-side use
        const serializedResidents = Array.isArray(residentsData) ? residentsData.map(resident => ({
          ...resident,
          birthdate: resident.birthdate ? new Date(resident.birthdate).toISOString() : null,
          createdAt: resident.createdAt ? new Date(resident.createdAt).toISOString() : null,
          updatedAt: resident.updatedAt ? new Date(resident.updatedAt).toISOString() : null,
        })) : [];

        setResidents(serializedResidents);
        setTotal(totalCount);
      } catch (error) {
        console.error('Error fetching residents:', error);
        setError(error.message);
        setResidents([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, [page, pageSize]);

  if (loading) {
    return (
      <DashboardPageContainer 
        heading="Resident Records"
        subtitle="Manage and monitor all registered residents in the barangay"
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardPageContainer>
    );
  }

  if (error) {
    return (
      <DashboardPageContainer 
        heading="Resident Records"
        subtitle="Manage and monitor all registered residents in the barangay"
      >
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Residents</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </DashboardPageContainer>
    );
  }

  return (
    <DashboardPageContainer 
      heading="Resident Records"
      subtitle="Manage and monitor all registered residents in the barangay"
    >
      <EnhancedResidentsView 
        initialResidents={residents}
        total={total}
        initialPage={page}
        initialPageSize={pageSize}
      />
    </DashboardPageContainer>
  );
}
