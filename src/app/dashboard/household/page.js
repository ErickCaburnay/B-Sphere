// household/page.js - this is a Server Component

import { HouseholdClientComponent } from "./household-client-component"; 
import DashboardPageContainer from '@/components/DashboardPageContainer';


export default async function HouseholdPage() {
  
  const households = []; 

  const serializableHouseholds = households.map(household => ({
    ...household,
    createdAt: household.createdAt.toISOString(),
    head: {
      ...household.head,
      birthdate: household.head.birthdate.toISOString(),
    }
  }));

  return (
    <DashboardPageContainer heading="Households">
      <HouseholdClientComponent initialHouseholds={serializableHouseholds} />
    </DashboardPageContainer>
  );
} 