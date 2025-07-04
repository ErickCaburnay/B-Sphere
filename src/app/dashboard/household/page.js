// household/page.js - this is a Server Component

import { HouseholdClientComponent } from "./household-client-component";

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

export default async function HouseholdPage({ searchParams }) {
  // Get page and pageSize from searchParams (Next.js 13+)
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSize = parseInt(searchParams?.pageSize || '10', 10);

  // Build absolute URL for server-side fetch
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  let households = [];
  let error = null;

  try {
    const res = await fetch(`${baseUrl}/api/households?page=${page}&pageSize=${pageSize}`, { 
      cache: 'no-store' // Temporarily disable caching
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    households = data.data || data;

    // Ensure dates are serializable
    households = households.map(household => ({
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
    }));

  } catch (err) {
    console.error('Error fetching households:', err);
    error = err.message;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Household Records</h1>
        <p className="text-gray-600">Manage and monitor all registered households in the barangay</p>
        <div className="h-1 bg-green-600 w-full mt-4 rounded"></div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">Error loading households: {error}</p>
        </div>
      ) : (
        <HouseholdClientComponent initialHouseholds={households} />
      )}
    </div>
  );
} 