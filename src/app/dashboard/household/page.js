// household/page.js - this is a Server Component

// import prisma from "@/lib/prisma"; // Temporarily omit prisma import
import { HouseholdClientComponent } from "./household-client-component"; 

// This is the Server Component that fetches data
export default async function HouseholdPage() {
  // Temporarily omit prisma data fetching
  const households = []; // Provide an empty array or dummy data for UI testing

  const serializableHouseholds = households.map(household => ({
    ...household,
    createdAt: household.createdAt.toISOString(),
    head: {
      ...household.head,
      birthdate: household.head.birthdate.toISOString(),
    }
  }));

  return <HouseholdClientComponent initialHouseholds={serializableHouseholds} />;
} 