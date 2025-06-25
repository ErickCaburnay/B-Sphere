// residents/page.js - this is a Server Component

import { EnhancedResidentsView } from '@/components/residents/EnhancedResidentsView';
import DashboardPageContainer from '@/components/DashboardPageContainer';

export default async function ResidentsPage({ searchParams }) {
  // Get page and pageSize from searchParams (Next.js 13+)
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSize = parseInt(searchParams?.pageSize || '10', 10);

  // Build absolute URL for server-side fetch
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/residents?page=${page}&pageSize=${pageSize}`, { cache: 'no-store' });
  const { data: residents, total } = await res.json();

  // Serialize dates
  const serializedResidents = residents.map(resident => ({
    ...resident,
    birthdate: resident.birthdate ? new Date(resident.birthdate).toISOString() : null,
    createdAt: resident.createdAt ? new Date(resident.createdAt).toISOString() : null,
    updatedAt: resident.updatedAt ? new Date(resident.updatedAt).toISOString() : null,
  }));

  return (
    <DashboardPageContainer heading="Resident Records">
      <EnhancedResidentsView
        initialResidents={serializedResidents}
        total={total}
        initialPage={page}
        initialPageSize={pageSize}
      />
    </DashboardPageContainer>
  );
}
