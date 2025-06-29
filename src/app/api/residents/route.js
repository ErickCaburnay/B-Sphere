import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

// Utility function to clean contact number for database storage
const cleanContactNumber = (contactNumber) => {
  if (!contactNumber) return null;
  return contactNumber.replace(/\s/g, ''); // Remove spaces for storage
};

// GET /api/residents - Fetch paginated residents
export async function GET(request) {
  try {
    // Parse query params for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // Get all residents (we'll implement pagination later)
    const querySnapshot = await adminDb.collection('residents')
      .orderBy('createdAt', 'desc')
      .limit(pageSize)
      .get();
    
    const total = querySnapshot.size;
    const residents = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Convert Firestore timestamps to JavaScript dates (but keep birthdate as string)
      residents.push({
        ...data,
        id: doc.id,
        birthdate: data.birthdate, // Keep birthdate as string
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      });
    });

    const response = NextResponse.json({ data: residents, total });
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
  }
}

// POST /api/residents - Create a new resident
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Batch insert support
    if (Array.isArray(body.batch)) {
      const batch = body.batch;
      
      // Get the latest resident to determine the next ID
      const latestSnapshot = await adminDb.collection('residents')
        .orderBy('id', 'desc')
        .limit(1)
        .get();
      
      let lastNumber = 0;
      if (!latestSnapshot.empty) {
        const latestResident = latestSnapshot.docs[0].data();
        lastNumber = parseInt(latestResident.id.split('-')[1]);
      }
      
      const firestoreBatch = adminDb.batch();
      const createdResidents = [];
      
      for (const r of batch) {
        // Generate new ID
        lastNumber++;
        const newId = `SF-${String(lastNumber).padStart(5, '0')}`;
        const docRef = adminDb.collection('residents').doc(newId);
        
        const residentData = {
          id: newId,
          firstName: r.firstName || '',
          middleName: r.middleName || null,
          lastName: r.lastName || '',
          suffix: r.suffix || null,
          address: r.address || '',
          birthdate: r.birthdate || '',
          birthplace: r.birthplace || '',
          citizenship: r.citizenship || '',
          maritalStatus: r.maritalStatus || '',
          gender: r.gender || '',
          voterStatus: r.voterStatus || '',
          employmentStatus: r.employmentStatus || null,
          educationalAttainment: r.educationalAttainment || null,
          occupation: r.occupation || null,
          contactNumber: cleanContactNumber(r.contactNumber),
          email: r.email || null,
          isTUPAD: r.isTUPAD || false,
          isPWD: r.isPWD || false,
          is4Ps: r.is4Ps || false,
          isSoloParent: r.isSoloParent || false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        firestoreBatch.set(docRef, residentData);
        createdResidents.push({ ...residentData, id: newId });
      }
      
      await firestoreBatch.commit();
      return NextResponse.json(createdResidents, { status: 201 });
    }

    // Single resident creation
    const { 
      firstName, 
      middleName, 
      lastName, 
      suffix,
      address,
      birthdate, 
      birthplace,
      citizenship,
      maritalStatus, 
      gender, 
      voterStatus,
      employmentStatus,
      educationalAttainment,
      occupation,
      contactNumber,
      email,
      isTUPAD,
      isPWD,
      is4Ps,
      isSoloParent
    } = body;

    // Basic validation
    if (!firstName || !lastName || !birthdate || !maritalStatus || !gender || !voterStatus || !address || !birthplace || !citizenship) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the latest resident to determine the next ID
    const latestSnapshot = await adminDb.collection('residents')
      .orderBy('id', 'desc')
      .limit(1)
      .get();
    
    let newId;
    if (latestSnapshot.empty) {
      newId = 'SF-00001';
    } else {
      const latestResident = latestSnapshot.docs[0].data();
      const lastNumber = parseInt(latestResident.id.split('-')[1]);
      newId = `SF-${String(lastNumber + 1).padStart(5, '0')}`;
    }

    const residentData = {
      id: newId,
      firstName,
      middleName: middleName || null,
      lastName,
      suffix: suffix || null,
      address,
      birthdate: birthdate,
      birthplace,
      citizenship,
      maritalStatus,
      gender,
      voterStatus,
      employmentStatus: employmentStatus || null,
      educationalAttainment: educationalAttainment || null,
      occupation: occupation || null,
      contactNumber: cleanContactNumber(contactNumber),
      email: email || null,
      isTUPAD: isTUPAD || false,
      isPWD: isPWD || false,
      is4Ps: is4Ps || false,
      isSoloParent: isSoloParent || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = adminDb.collection('residents').doc(newId);
    await docRef.set(residentData);
    
    return NextResponse.json({ ...residentData, id: newId }, { status: 201 });
  } catch (error) {
    console.error('Error adding resident:', error);
    return NextResponse.json({ error: 'Failed to add resident' }, { status: 500 });
  }
}

// PUT /api/residents - Update a resident
export async function PUT(request) {
  try {
    const { 
      id, 
      firstName, 
      middleName, 
      lastName, 
      suffix,
      address,
      birthdate, 
      birthplace,
      citizenship,
      maritalStatus, 
      gender, 
      voterStatus,
      employmentStatus,
      educationalAttainment,
      occupation,
      contactNumber,
      email,
      isTUPAD,
      isPWD,
      is4Ps,
      isSoloParent
    } = await request.json();

    // Basic validation
    if (!id || !firstName || !lastName || !birthdate || !maritalStatus || !gender || !voterStatus || !address || !birthplace || !citizenship) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = adminDb.collection('residents').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    const updateData = {
      firstName,
      middleName: middleName || null,
      lastName,
      suffix: suffix || null,
      address,
      birthdate: birthdate,
      birthplace,
      citizenship,
      maritalStatus,
      gender,
      voterStatus,
      employmentStatus: employmentStatus || null,
      educationalAttainment: educationalAttainment || null,
      occupation: occupation || null,
      contactNumber: cleanContactNumber(contactNumber),
      email: email || null,
      isTUPAD: isTUPAD || false,
      isPWD: isPWD || false,
      is4Ps: is4Ps || false,
      isSoloParent: isSoloParent || false,
      updatedAt: Timestamp.now()
    };

    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    const updatedResident = {
      ...updatedDoc.data(),
      id: updatedDoc.id,
      birthdate: updatedDoc.data().birthdate, // Keep birthdate as string
      createdAt: updatedDoc.data().createdAt?.toDate?.() || updatedDoc.data().createdAt,
      updatedAt: updatedDoc.data().updatedAt?.toDate?.() || updatedDoc.data().updatedAt,
    };
    
    return NextResponse.json(updatedResident);
  } catch (error) {
    console.error('Error updating resident:', error);
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
  }
}

// DELETE /api/residents - Delete a resident
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resident ID is required' }, { status: 400 });
    }

    const docRef = adminDb.collection('residents').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    await docRef.delete();
    
    return NextResponse.json({ message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Error deleting resident:', error);
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
  }
} 