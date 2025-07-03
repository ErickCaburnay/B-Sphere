import getFirebaseAdmin from '@/lib/firebase-admin-dynamic';
import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { generateNextResidentId } from '@/lib/utils';

// Utility function to clean contact number for database storage
const cleanContactNumber = (contactNumber) => {
  if (!contactNumber) return null;
  return contactNumber.replace(/\s/g, ''); // Remove spaces for storage
};

// GET /api/residents - Fetch paginated and filtered residents
export async function GET(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';
    const ageRange = searchParams.get('ageRange') || '';
    const gender = searchParams.get('gender') || '';
    const voterStatus = searchParams.get('voterStatus') || '';
    const maritalStatus = searchParams.get('maritalStatus') || '';
    const programs = searchParams.get('programs') || '';

    console.log('API: Filtering residents with params:', {
      page, pageSize, search, ageRange, gender, voterStatus, maritalStatus, programs
    });

    // Helper function to calculate age from birthdate
    const calculateAge = (birthdate) => {
      if (!birthdate) return 0;
      const today = new Date();
      const birth = new Date(birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    // Get all residents first (we'll filter in memory since Firestore has limited query capabilities)
    const allResidentsSnapshot = await adminDb.collection('residents')
      .orderBy('createdAt', 'desc')
      .get();
    
    let allResidents = [];
    allResidentsSnapshot.forEach((doc) => {
      const data = doc.data();
      allResidents.push({
        ...data,
        id: doc.id,
        uniqueId: data.uniqueId,
        birthdate: data.birthdate,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      });
    });

    // Apply filters
    let filteredResidents = allResidents;

    // Search filter (name, address, uniqueId) - Case insensitive
    if (search) {
      const searchLower = search.toLowerCase();
      filteredResidents = filteredResidents.filter(resident => {
        const fullName = `${resident.firstName || ''} ${resident.middleName || ''} ${resident.lastName || ''}`.toLowerCase();
        const address = (resident.address || '').toLowerCase();
        const uniqueId = (resident.uniqueId || '').toLowerCase();
        const email = (resident.email || '').toLowerCase();
        const occupation = (resident.occupation || '').toLowerCase();
        const birthplace = (resident.birthplace || '').toLowerCase();
        const citizenship = (resident.citizenship || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               address.includes(searchLower) || 
               uniqueId.includes(searchLower) ||
               email.includes(searchLower) ||
               occupation.includes(searchLower) ||
               birthplace.includes(searchLower) ||
               citizenship.includes(searchLower);
      });
    }

    // Age range filter
    if (ageRange) {
      filteredResidents = filteredResidents.filter(resident => {
        const age = calculateAge(resident.birthdate);
        switch (ageRange) {
          case '0-17':
            return age >= 0 && age <= 17;
          case '18-59':
            return age >= 18 && age <= 59;
          case '60+':
            return age >= 60;
          default:
            return true;
        }
      });
    }

    // Gender filter
    if (gender) {
      filteredResidents = filteredResidents.filter(resident => 
        resident.gender === gender
      );
    }

    // Voter status filter
    if (voterStatus) {
      filteredResidents = filteredResidents.filter(resident => 
        resident.voterStatus === voterStatus
      );
    }

    // Marital status filter
    if (maritalStatus) {
      filteredResidents = filteredResidents.filter(resident => 
        resident.maritalStatus === maritalStatus
      );
    }

    // Programs filter
    if (programs) {
      const programList = programs.split(',');
      filteredResidents = filteredResidents.filter(resident => {
        return programList.some(program => {
          switch (program) {
            case 'PWD':
              return resident.isPWD === true;
            case '4Ps':
              return resident.is4Ps === true;
            case 'TUPAD':
              return resident.isTUPAD === true;
            case 'Solo Parent':
              return resident.isSoloParent === true;
            default:
              return false;
          }
        });
      });
    }

    // Get total count after filtering
    const total = filteredResidents.length;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const paginatedResidents = filteredResidents.slice(offset, offset + pageSize);

    console.log('API: Filtered results:', {
      totalResidents: allResidents.length,
      filteredCount: total,
      returnedCount: paginatedResidents.length,
      page,
      pageSize
    });

    const response = NextResponse.json({ 
      data: paginatedResidents, 
      total,
      page,
      pageSize,
      hasFilters: !!(search || ageRange || gender || voterStatus || maritalStatus || programs)
    });
    
    // Add caching headers (shorter cache for filtered results)
    const cacheTime = (search || ageRange || gender || voterStatus || maritalStatus || programs) ? 30 : 60;
    response.headers.set('Cache-Control', `public, s-maxage=${cacheTime}, stale-while-revalidate=300`);
    
    return response;
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
  }
}

// POST /api/residents - Create a new resident
export async function POST(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const body = await request.json();
    
    // Batch insert support
    if (Array.isArray(body.batch)) {
      const batch = body.batch;
      
      // Get the next starting ID using the utility function
      let currentId = await generateNextResidentId(adminDb);
      let currentNumber = parseInt(currentId.split('-')[1]);
      
      const firestoreBatch = adminDb.batch();
      const createdResidents = [];
      
      for (const r of batch) {
        // Use current ID and increment for next iteration
        const newId = `SF-${String(currentNumber).padStart(6, '0')}`;
        currentNumber++;
        const docRef = adminDb.collection('residents').doc(newId);
        
        const residentData = {
          uniqueId: newId,
          firebaseUid: null, // Will be set when resident creates Firebase Auth account
          firstName: (r.firstName || '').toUpperCase(),
          middleName: r.middleName ? r.middleName.toUpperCase() : null,
          lastName: (r.lastName || '').toUpperCase(),
          suffix: r.suffix ? r.suffix.toUpperCase() : null,
          address: (r.address || '').toUpperCase(),
          birthdate: r.birthdate || '',
          birthplace: (r.birthplace || '').toUpperCase(),
          citizenship: (r.citizenship || '').toUpperCase(),
          maritalStatus: r.maritalStatus || '',
          gender: r.gender || '',
          voterStatus: r.voterStatus || '',
          employmentStatus: r.employmentStatus || null,
          educationalAttainment: r.educationalAttainment || null,
          occupation: r.occupation ? r.occupation.toUpperCase() : null,
          contactNumber: cleanContactNumber(r.contactNumber),
          email: r.email || null, // Keep email case-sensitive
          isTUPAD: r.isTUPAD || false,
          isPWD: r.isPWD || false,
          is4Ps: r.is4Ps || false,
          isSoloParent: r.isSoloParent || false,
          role: 'resident',
          accountStatus: 'approved', // Admin-added residents are automatically approved
          updateRequest: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        firestoreBatch.set(docRef, residentData);
        createdResidents.push({ ...residentData, uniqueId: newId });
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

    // Check for duplicate resident (same first name, last name, and birthdate)
    const duplicateQuery = await adminDb.collection('residents')
      .where('firstName', '==', firstName.toUpperCase())
      .where('lastName', '==', lastName.toUpperCase())
      .where('birthdate', '==', birthdate)
      .get();

    if (!duplicateQuery.empty) {
      const existingResident = duplicateQuery.docs[0].data();
      return NextResponse.json({ 
        error: 'Duplicate resident found',
        details: {
          firstName: existingResident.firstName,
          middleName: existingResident.middleName,
          lastName: existingResident.lastName,
          birthdate: existingResident.birthdate
        }
      }, { status: 409 });
    }

    // Generate the next resident ID using the utility function
    const newId = await generateNextResidentId(adminDb);

    const residentData = {
      uniqueId: newId,
      firebaseUid: null, // Will be set when resident creates Firebase Auth account
      firstName: firstName.toUpperCase(),
      middleName: middleName ? middleName.toUpperCase() : null,
      lastName: lastName.toUpperCase(),
      suffix: suffix ? suffix.toUpperCase() : null,
      address: address.toUpperCase(),
      birthdate: birthdate,
      birthplace: birthplace.toUpperCase(),
      citizenship: citizenship.toUpperCase(),
      maritalStatus,
      gender,
      voterStatus,
      employmentStatus: employmentStatus || null,
      educationalAttainment: educationalAttainment || null,
      occupation: occupation ? occupation.toUpperCase() : null,
      contactNumber: cleanContactNumber(contactNumber),
      email: email || null,
      isTUPAD: isTUPAD || false,
      isPWD: isPWD || false,
      is4Ps: is4Ps || false,
      isSoloParent: isSoloParent || false,
      role: 'resident',
      accountStatus: 'approved', // Admin-added residents are automatically approved
      updateRequest: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = adminDb.collection('residents').doc(newId);
    await docRef.set(residentData);
    
    return NextResponse.json({ ...residentData, uniqueId: newId }, { status: 201 });
  } catch (error) {
    console.error('Error adding resident:', error);
    return NextResponse.json({ error: 'Failed to add resident' }, { status: 500 });
  }
}

// PUT /api/residents - Update a resident
export async function PUT(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
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
      firstName: firstName.toUpperCase(),
      middleName: middleName ? middleName.toUpperCase() : null,
      lastName: lastName.toUpperCase(),
      suffix: suffix ? suffix.toUpperCase() : null,
      address: address.toUpperCase(),
      birthdate: birthdate,
      birthplace: birthplace.toUpperCase(),
      citizenship: citizenship.toUpperCase(),
      maritalStatus,
      gender,
      voterStatus,
      employmentStatus: employmentStatus || null,
      educationalAttainment: educationalAttainment || null,
      occupation: occupation ? occupation.toUpperCase() : null,
      contactNumber: cleanContactNumber(contactNumber),
      email: email || null, // Keep email case-sensitive
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
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
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