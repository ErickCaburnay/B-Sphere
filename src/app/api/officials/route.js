import { NextResponse } from "next/server";
import getFirebaseAdmin from '@/lib/firebase-admin-dynamic';

// GET all officials
export async function GET() {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const officialsSnapshot = await adminDb.collection('officials')
      .orderBy('position', 'asc')
      .get();

    const officials = [];
    for (const doc of officialsSnapshot.docs) {
      const officialData = { id: doc.id, ...doc.data() };
      
      // Get resident data
      if (officialData.residentId) {
        const residentDoc = await adminDb.collection('residents').doc(officialData.residentId).get();
        if (residentDoc.exists) {
          officialData.resident = { id: residentDoc.id, ...residentDoc.data() };
        }
      }
      
      officials.push(officialData);
    }

    // Format dates in the response
    const formattedOfficials = officials.map(official => ({
      ...official,
      termStart: official.termStart?.toDate?.()?.toISOString() || official.termStart,
      termEnd: official.termEnd?.toDate?.()?.toISOString() || official.termEnd
    }));

    const response = NextResponse.json(formattedOfficials);
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error("Error fetching officials:", error);
    return NextResponse.json(
      { error: "Failed to fetch officials" },
      { status: 500 }
    );
  }
}

// POST new official
export async function POST(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const body = await request.json();
    const { residentId, position, termStart, termEnd, chairmanship, status } = body;

    if (!residentId) {
      return NextResponse.json(
        { error: "Resident ID is required" },
        { status: 400 }
      );
    }

    // Check if resident is already an official
    const existingOfficialSnapshot = await adminDb.collection('officials')
      .where('residentId', '==', residentId)
      .limit(1)
      .get();

    if (!existingOfficialSnapshot.empty) {
      return NextResponse.json(
        { error: "This resident is already an official" },
        { status: 400 }
      );
    }

    // Check for unique positions - these positions can only have one active official
    const uniquePositions = [
      "Barangay Captain",
      "Barangay Secretary", 
      "Barangay Treasurer",
      "SK Chairman"
    ];

    if (uniquePositions.includes(position)) {
      const existingPositionSnapshot = await adminDb.collection('officials')
        .where('position', '==', position)
        .where('status', '==', 'Active')
        .limit(1)
        .get();

      if (!existingPositionSnapshot.empty) {
        const existingPositionHolder = { id: existingPositionSnapshot.docs[0].id, ...existingPositionSnapshot.docs[0].data() };
        
        // Get resident data
        const residentDoc = await adminDb.collection('residents').doc(existingPositionHolder.residentId).get();
        const resident = residentDoc.exists ? { id: residentDoc.id, ...residentDoc.data() } : null;
        
        return NextResponse.json(
          { 
            error: "Position already taken",
            message: `The position of ${position} is currently occupied by ${resident?.firstName || 'Unknown'} ${resident?.lastName || 'Resident'}. Only one person can hold this position at a time. Please set the current official to inactive or remove them before assigning this position to another resident.`
          },
          { status: 400 }
        );
      }
    }

    // Create the official
    const officialData = {
      residentId: residentId,
      position,
      termStart: new Date(termStart),
      termEnd: new Date(termEnd),
      chairmanship,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await adminDb.collection('officials').add(officialData);
    
    // Get resident data
    const residentDoc = await adminDb.collection('residents').doc(residentId).get();
    const resident = residentDoc.exists ? { id: residentDoc.id, ...residentDoc.data() } : null;
    
    const official = { 
      id: docRef.id, 
      ...officialData,
      resident 
    };

    return NextResponse.json(official);
  } catch (error) {
    console.error("Error creating official:", error);
    return NextResponse.json(
      { error: "Failed to create official" },
      { status: 500 }
    );
  }
}

// DELETE official
export async function DELETE(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const { searchParams } = new URL(request.url);
    const residentId = searchParams.get("residentId");

    if (!residentId) {
      return NextResponse.json(
        { error: "Official Resident ID is required" },
        { status: 400 }
      );
    }

    // Find the official by residentId
    const officialSnapshot = await adminDb.collection('officials')
      .where('residentId', '==', residentId)
      .limit(1)
      .get();

    if (officialSnapshot.empty) {
      return NextResponse.json(
        { error: "Official not found" },
        { status: 404 }
      );
    }

    await adminDb.collection('officials').doc(officialSnapshot.docs[0].id).delete();

    return NextResponse.json({ message: "Official deleted successfully" });
  } catch (error) {
    console.error("Error deleting official:", error);
    return NextResponse.json(
      { error: "Failed to delete official" },
      { status: 500 }
    );
  }
}

// PUT update official
export async function PUT(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const body = await request.json();
    const { residentId, position, termStart, termEnd, chairmanship, status } = body;

    if (!residentId) {
      return NextResponse.json(
        { error: "Resident ID is required for update" },
        { status: 400 }
      );
    }

    // Check for unique positions - these positions can only have one active official
    const uniquePositions = [
      "Barangay Captain",
      "Barangay Secretary", 
      "Barangay Treasurer",
      "SK Chairman"
    ];

    if (uniquePositions.includes(position)) {
      const existingPositionSnapshot = await adminDb.collection('officials')
        .where('position', '==', position)
        .where('status', '==', 'Active')
        .get();

      // Filter out the current official being updated
      const existingPositionHolder = existingPositionSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.residentId !== residentId;
      });

      if (existingPositionHolder) {
        const holderData = existingPositionHolder.data();
        
        // Get resident data
        const residentDoc = await adminDb.collection('residents').doc(holderData.residentId).get();
        const resident = residentDoc.exists ? { id: residentDoc.id, ...residentDoc.data() } : null;
        
        return NextResponse.json(
          { 
            error: "Position already taken",
            message: `The position of ${position} is currently occupied by ${resident?.firstName || 'Unknown'} ${resident?.lastName || 'Resident'}. Only one person can hold this position at a time. Please set the current official to inactive or remove them before assigning this position to another resident.`
          },
          { status: 400 }
        );
      }
    }

    // Find the official by residentId
    const officialSnapshot = await adminDb.collection('officials')
      .where('residentId', '==', residentId)
      .limit(1)
      .get();

    if (officialSnapshot.empty) {
      return NextResponse.json(
        { error: "Official not found" },
        { status: 404 }
      );
    }

    const officialDoc = officialSnapshot.docs[0];
    const updateData = {
      position,
      termStart: new Date(termStart),
      termEnd: new Date(termEnd),
      chairmanship,
      status,
      updatedAt: new Date()
    };

    await adminDb.collection('officials').doc(officialDoc.id).update(updateData);

    // Get resident data
    const residentDoc = await adminDb.collection('residents').doc(residentId).get();
    const resident = residentDoc.exists ? { id: residentDoc.id, ...residentDoc.data() } : null;

    const updatedOfficial = {
      id: officialDoc.id,
      ...officialDoc.data(),
      ...updateData,
      resident
    };

    return NextResponse.json(updatedOfficial);
  } catch (error) {
    console.error("Error updating official:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Official not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update official" },
      { status: 500 }
    );
  }
} 