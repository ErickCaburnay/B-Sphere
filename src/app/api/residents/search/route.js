// /app/api/residents/search/route.js
import { NextResponse } from "next/server";
import getFirebaseAdmin from '@/lib/firebase-admin-dynamic';

export async function GET(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const { searchParams } = new URL(request.url);
    
    // Get search parameters
    const keyword = searchParams.get("q")?.trim();
    const uniqueId = searchParams.get("uniqueId")?.trim();
    const firebaseUid = searchParams.get("firebaseUid")?.trim();
    const firstName = searchParams.get("firstName")?.trim();
    const middleName = searchParams.get("middleName")?.trim();
    const lastName = searchParams.get("lastName")?.trim();
    const birthdate = searchParams.get("birthdate")?.trim();

    // Get all residents
    const allResidentsSnapshot = await adminDb.collection('residents')
      .orderBy('lastName', 'asc')
      .get();
    
    const allResidents = allResidentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    let residents = allResidents;

    // If specific field search parameters are provided
    if (uniqueId || firebaseUid || firstName || middleName || lastName || birthdate) {
      residents = allResidents.filter(resident => {
        let matches = true;

        // Check uniqueId
        if (uniqueId) {
          const residentUniqueId = resident.uniqueId || resident.id;
          matches = matches && residentUniqueId.toLowerCase().includes(uniqueId.toLowerCase());
        }

        // Check firebaseUid
        if (firebaseUid) {
          matches = matches && resident.firebaseUid === firebaseUid;
        }

        // Check firstName
        if (firstName) {
          matches = matches && resident.firstName && 
            resident.firstName.toLowerCase().includes(firstName.toLowerCase());
        }

        // Check middleName
        if (middleName) {
          matches = matches && resident.middleName && 
            resident.middleName.toLowerCase().includes(middleName.toLowerCase());
        }

        // Check lastName
        if (lastName) {
          matches = matches && resident.lastName && 
            resident.lastName.toLowerCase().includes(lastName.toLowerCase());
        }

        // Check birthdate/birthDate
        if (birthdate) {
          const residentBirthDate = resident.birthDate?.toDate?.()?.toISOString()?.split('T')[0] || 
                                   resident.birthdate?.toDate?.()?.toISOString()?.split('T')[0] || 
                                   resident.birthDate?.split('T')[0] || 
                                   resident.birthdate?.split('T')[0] || 
                                   resident.birthDate || 
                                   resident.birthdate;
          matches = matches && residentBirthDate === birthdate;
        }

        return matches;
      });
    }
    // If general keyword search is provided
    else if (keyword) {
      residents = allResidents.filter(resident => {
        const searchFields = [
          resident.firstName,
          resident.middleName,
          resident.lastName,
          resident.suffix,
          resident.uniqueId || resident.id,
          resident.address
        ].filter(Boolean);
        
        return searchFields.some(field => 
          field.toLowerCase().includes(keyword.toLowerCase())
        );
      });
    }
    // If no search parameters, return all residents (limited for performance)
    else {
      residents = allResidents.slice(0, 50); // Limit to first 50 for performance
    }

    const formattedResidents = residents.map(resident => {
      // Handle both birthdate and birthDate fields
      const birthDate = resident.birthDate?.toDate?.()?.toISOString() || 
                       resident.birthdate?.toDate?.()?.toISOString() || 
                       resident.birthDate || 
                       resident.birthdate;

      return {
        ...resident,
        birthDate: birthDate, // Always return as birthDate
        birthdate: undefined // Remove old birthdate field
      };
    });

    return NextResponse.json({ 
      residents: formattedResidents,
      total: formattedResidents.length 
    });
  } catch (error) {
    console.error("Error searching residents:", error);
    return NextResponse.json(
      { error: "Failed to search residents" },
      { status: 500 }
    );
  }
}
