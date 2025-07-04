import getFirebaseAdmin from '@/lib/firebase-admin-dynamic';
import { NextResponse } from 'next/server';

// Utility function to clean contact number for database storage
const cleanContactNumber = (contactNumber) => {
  if (!contactNumber) return null;
  return contactNumber.replace(/\s/g, ''); // Remove spaces for storage
};

// Utility function to check if a resident is already in a household
async function checkResidentHouseholdStatus(adminDb, uniqueId) {
  // Check if resident exists as head of household
  const headQuery = await adminDb.collection('households')
    .where('headOfHousehold', '==', uniqueId)
    .limit(1)
    .get();

  if (!headQuery.empty) {
    return {
      isInHousehold: true,
      role: 'head',
      householdId: headQuery.docs[0].data().householdId
    };
  }

  // Check if resident exists as member in any household
  const memberQuery = await adminDb.collection('households')
    .where('members', 'array-contains', uniqueId)
    .limit(1)
    .get();

  if (!memberQuery.empty) {
    return {
      isInHousehold: true,
      role: 'member',
      householdId: memberQuery.docs[0].data().householdId
    };
  }

  return {
    isInHousehold: false,
    role: null,
    householdId: null
  };
}

// GET /api/households - Fetch all households
export async function GET() {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const householdsSnapshot = await adminDb.collection('households')
      .orderBy('createdAt', 'desc')
      .get();

    const households = [];
    for (const doc of householdsSnapshot.docs) {
      const householdData = { id: doc.id, ...doc.data() };
      
      // Fetch head data using headOfHousehold (uniqueId) instead of headId
      if (householdData.headOfHousehold) {
        const headQuery = await adminDb.collection('residents')
          .where('uniqueId', '==', householdData.headOfHousehold)
          .limit(1)
          .get();
        
        if (!headQuery.empty) {
          const headDoc = headQuery.docs[0];
          householdData.head = { id: headDoc.id, ...headDoc.data() };
        } else {
          householdData.head = null;
        }
      } else {
        householdData.head = null;
      }
      
      // Fetch members data using uniqueIds from members array
      if (Array.isArray(householdData.members) && householdData.members.length > 0) {
        const memberQueries = await Promise.all(
          householdData.members.map(async memberId => {
            const memberQuery = await adminDb.collection('residents')
              .where('uniqueId', '==', memberId)
              .limit(1)
              .get();
            return !memberQuery.empty ? memberQuery.docs[0] : null;
          })
        );
        householdData.members = memberQueries
          .filter(doc => doc !== null)
          .map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        householdData.members = [];
      }
      
      households.push(householdData);
    }
    const response = NextResponse.json(households);
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=360');
    
    return response;
  } catch (error) {
    console.error('Error fetching households:', error);
    return NextResponse.json({ error: 'Failed to fetch households' }, { status: 500 });
  }
}

// POST /api/households - Create a new household
export async function POST(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const data = await request.json();

    // Check if head of household is already in another household
    const headStatus = await checkResidentHouseholdStatus(adminDb, data.headOfHousehold);
    if (headStatus.isInHousehold) {
      return NextResponse.json({
        error: `This resident is already a ${headStatus.role} in household ${headStatus.householdId} and cannot be added again.`
      }, { status: 400 });
    }

    // Check if any members are already in other households
    if (Array.isArray(data.members)) {
      for (const memberId of data.members) {
        const memberStatus = await checkResidentHouseholdStatus(adminDb, memberId);
        if (memberStatus.isInHousehold) {
          return NextResponse.json({
            error: `Resident ${memberId} is already a ${memberStatus.role} in household ${memberStatus.householdId} and cannot be added again.`
          }, { status: 400 });
        }
      }
    }

    // Generate next householdId in format HH-000001
    let nextHouseholdId = 'HH-000001';
    const householdsSnapshot = await adminDb.collection('households')
      .orderBy('householdId', 'desc')
      .limit(1)
      .get();
    if (!householdsSnapshot.empty) {
      const lastId = householdsSnapshot.docs[0].data().householdId;
      if (lastId && /^HH-\d{6}$/.test(lastId)) {
        const lastNum = parseInt(lastId.slice(3), 10);
        const newNum = lastNum + 1;
        nextHouseholdId = `HH-${newNum.toString().padStart(6, '0')}`;
      }
    }

    const householdData = {
      ...data,
      householdId: nextHouseholdId,
      contactNumber: cleanContactNumber(data.contactNumber),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let docRef;
    // Update resident roles in a transaction
    await adminDb.runTransaction(async (transaction) => {
      // Create the household
      docRef = adminDb.collection('households').doc();
      transaction.set(docRef, householdData);

      // Update head's role
      const headQuery = await adminDb.collection('residents')
        .where('uniqueId', '==', data.headOfHousehold)
        .limit(1)
        .get();
      if (!headQuery.empty) {
        const headDoc = headQuery.docs[0];
        transaction.update(headDoc.ref, { role: 'head' });
      }

      // Update members' roles
      if (Array.isArray(data.members)) {
        for (const memberId of data.members) {
          const memberQuery = await adminDb.collection('residents')
            .where('uniqueId', '==', memberId)
            .limit(1)
            .get();
          if (!memberQuery.empty) {
            const memberDoc = memberQuery.docs[0];
            transaction.update(memberDoc.ref, { role: 'member' });
          }
        }
      }
    });

    // Get head resident data using uniqueId
    let head = null;
    if (data.headOfHousehold) {
      const headQuery = await adminDb.collection('residents')
        .where('uniqueId', '==', data.headOfHousehold)
        .limit(1)
        .get();
      
      if (!headQuery.empty) {
        const headDoc = headQuery.docs[0];
        head = { id: headDoc.id, ...headDoc.data() };
      }
    }

    const household = {
      id: docRef.id,
      ...householdData,
      head
    };

    return NextResponse.json(household);
  } catch (error) {
    console.error('Error creating household:', error);
    return NextResponse.json({ error: 'Failed to create household' }, { status: 500 });
  }
}

// PUT /api/households - Update a household
export async function PUT(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const data = await request.json();

    // Get current household data
    const currentHousehold = await adminDb.collection('households').doc(data.id).get();
    if (!currentHousehold.exists) {
      return NextResponse.json({ error: 'Household not found' }, { status: 404 });
    }
    const currentData = currentHousehold.data();

    // Check if new head is already in another household (if head is being changed)
    if (data.headOfHousehold !== currentData.headOfHousehold) {
      const headStatus = await checkResidentHouseholdStatus(adminDb, data.headOfHousehold);
      if (headStatus.isInHousehold && headStatus.householdId !== currentData.householdId) {
        return NextResponse.json({
          error: `This resident is already a ${headStatus.role} in household ${headStatus.householdId} and cannot be added again.`
        }, { status: 400 });
      }
    }

    // Check new members against existing households
    const newMembers = Array.isArray(data.members) ? data.members : [];
    const currentMembers = Array.isArray(currentData.members) ? currentData.members : [];
    const addedMembers = newMembers.filter(m => !currentMembers.includes(m));

    for (const memberId of addedMembers) {
      const memberStatus = await checkResidentHouseholdStatus(adminDb, memberId);
      if (memberStatus.isInHousehold) {
        return NextResponse.json({
          error: `Resident ${memberId} is already a ${memberStatus.role} in household ${memberStatus.householdId} and cannot be added again.`
        }, { status: 400 });
      }
    }

    const updateData = {
      ...data,
      contactNumber: cleanContactNumber(data.contactNumber),
      updatedAt: new Date()
    };

    // Update household and resident roles in a transaction
    await adminDb.runTransaction(async (transaction) => {
      // Update the household
      transaction.update(adminDb.collection('households').doc(data.id), updateData);

      // Handle head role changes
      if (data.headOfHousehold !== currentData.headOfHousehold) {
        // Remove old head's role
        if (currentData.headOfHousehold) {
          const oldHeadQuery = await adminDb.collection('residents')
            .where('uniqueId', '==', currentData.headOfHousehold)
            .limit(1)
            .get();
          if (!oldHeadQuery.empty) {
            transaction.update(oldHeadQuery.docs[0].ref, { role: null });
          }
        }

        // Set new head's role
        const newHeadQuery = await adminDb.collection('residents')
          .where('uniqueId', '==', data.headOfHousehold)
          .limit(1)
          .get();
        if (!newHeadQuery.empty) {
          transaction.update(newHeadQuery.docs[0].ref, { role: 'head' });
        }
      }

      // Handle member role changes
      const removedMembers = currentMembers.filter(m => !newMembers.includes(m));
      const addedMembers = newMembers.filter(m => !currentMembers.includes(m));

      // Remove roles from removed members
      for (const memberId of removedMembers) {
        const memberQuery = await adminDb.collection('residents')
          .where('uniqueId', '==', memberId)
          .limit(1)
          .get();
        if (!memberQuery.empty) {
          transaction.update(memberQuery.docs[0].ref, { role: null });
        }
      }

      // Add roles to new members
      for (const memberId of addedMembers) {
        const memberQuery = await adminDb.collection('residents')
          .where('uniqueId', '==', memberId)
          .limit(1)
          .get();
        if (!memberQuery.empty) {
          transaction.update(memberQuery.docs[0].ref, { role: 'member' });
        }
      }
    });

    // Get head resident data using uniqueId
    let head = null;
    if (data.headOfHousehold) {
      const headQuery = await adminDb.collection('residents')
        .where('uniqueId', '==', data.headOfHousehold)
        .limit(1)
        .get();
      
      if (!headQuery.empty) {
        const headDoc = headQuery.docs[0];
        head = { id: headDoc.id, ...headDoc.data() };
      }
    }

    const household = {
      id: data.id,
      ...updateData,
      head
    };

    return NextResponse.json(household);
  } catch (error) {
    console.error('Error updating household:', error);
    return NextResponse.json({ error: 'Failed to update household' }, { status: 500 });
  }
}

// DELETE /api/households - Delete a household
export async function DELETE(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const data = await request.json();
    await adminDb.collection('households').doc(data.id).delete();
    return NextResponse.json({ message: 'Household deleted successfully' });
  } catch (error) {
    console.error('Error deleting household:', error);
    return NextResponse.json({ error: 'Failed to delete household' }, { status: 500 });
  }
} 