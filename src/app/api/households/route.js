import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// Utility function to clean contact number for database storage
const cleanContactNumber = (contactNumber) => {
  if (!contactNumber) return null;
  return contactNumber.replace(/\s/g, ''); // Remove spaces for storage
};

// GET /api/households - Fetch all households
export async function GET() {
  try {
    const householdsSnapshot = await adminDb.collection('households')
      .orderBy('createdAt', 'desc')
      .get();

    const households = [];
    for (const doc of householdsSnapshot.docs) {
      const householdData = { id: doc.id, ...doc.data() };
      
      // Get head resident data
      if (householdData.headId) {
        const headDoc = await adminDb.collection('residents').doc(householdData.headId).get();
        if (headDoc.exists) {
          householdData.head = { id: headDoc.id, ...headDoc.data() };
        }
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
    const data = await request.json();
    const householdData = {
      ...data,
      contactNumber: cleanContactNumber(data.contactNumber),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await adminDb.collection('households').add(householdData);
    
    // Get head resident data
    let head = null;
    if (data.headId) {
      const headDoc = await adminDb.collection('residents').doc(data.headId).get();
      if (headDoc.exists) {
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
    const data = await request.json();
    const updateData = {
      ...data,
      contactNumber: cleanContactNumber(data.contactNumber),
      updatedAt: new Date()
    };
    
    await adminDb.collection('households').doc(data.id).update(updateData);
    
    // Get head resident data
    let head = null;
    if (data.headId) {
      const headDoc = await adminDb.collection('residents').doc(data.headId).get();
      if (headDoc.exists) {
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
    const data = await request.json();
    await adminDb.collection('households').doc(data.id).delete();
    return NextResponse.json({ message: 'Household deleted successfully' });
  } catch (error) {
    console.error('Error deleting household:', error);
    return NextResponse.json({ error: 'Failed to delete household' }, { status: 500 });
  }
} 