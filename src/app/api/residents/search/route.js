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
    const keyword = searchParams.get("q")?.trim();

    if (!keyword) {
      // If no keyword, return all residents (or empty array if you prefer)
      const allResidentsSnapshot = await adminDb.collection('residents')
        .orderBy('lastName', 'asc')
        .get();
      
      const allResidents = allResidentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const formatted = allResidents.map(r => ({
        ...r,
        birthdate: r.birthdate?.toDate?.()?.toISOString() || r.birthdate,
      }));
      return NextResponse.json(formatted);
    }

    // Flexible search: get all residents and filter in memory (Firestore doesn't support OR queries with multiple fields)
    const allResidentsSnapshot = await adminDb.collection('residents')
      .orderBy('lastName', 'asc')
      .get();
    
    const allResidents = allResidentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter residents based on keyword
    const residents = allResidents.filter(resident => {
      const searchFields = [
        resident.firstName,
        resident.middleName,
        resident.lastName,
        resident.suffix,
        resident.id
      ].filter(Boolean);
      
      return searchFields.some(field => 
        field.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    const formattedResidents = residents.map(resident => ({
      ...resident,
      birthdate: resident.birthdate?.toDate?.()?.toISOString() || resident.birthdate,
    }));

    return NextResponse.json(formattedResidents);
  } catch (error) {
    console.error("Error searching residents:", error);
    return NextResponse.json(
      { error: "Failed to search residents" },
      { status: 500 }
    );
  }
}
