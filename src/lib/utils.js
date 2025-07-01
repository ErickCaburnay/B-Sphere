import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generates the next sequential resident ID in the format SF-000000
 * This function checks only the 'residents' collection as it's the single source of truth
 */
export async function generateNextResidentId(adminDb) {
  try {
    // Get the latest ID from residents collection only
    const residentsSnapshot = await adminDb.collection('residents')
      .orderBy('uniqueId', 'desc')
      .limit(1)
      .get();

    let maxNumber = 0;

    // Check residents collection
    if (!residentsSnapshot.empty) {
      const latestResident = residentsSnapshot.docs[0].data();
      if (latestResident.uniqueId && latestResident.uniqueId.startsWith('SF-')) {
        const residentNumber = parseInt(latestResident.uniqueId.split('-')[1]);
        maxNumber = Math.max(maxNumber, residentNumber);
      }
    }

    // Generate next ID with 6 digits
    const nextNumber = maxNumber + 1;
    return `SF-${String(nextNumber).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating next resident ID:', error);
    throw error;
  }
} 