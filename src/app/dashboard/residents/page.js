// residents/page.js - this is a Server Component

import prisma from "@/lib/prisma"; 
import { ResidentsClientComponent } from "./residents-client-component"; 

// This is the Server Component that fetches data
export default async function ResidentRecordsPage() {
  const residents = await prisma.resident.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const serializableResidents = residents.map(resident => ({
    ...resident,
    birthdate: resident.birthdate.toISOString(),
  }));

  return <ResidentsClientComponent initialResidents={serializableResidents} />;
}
