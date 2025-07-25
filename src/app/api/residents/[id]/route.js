import getFirebaseAdmin from '@/lib/firebase-admin-dynamic';
import { NextResponse } from 'next/server';

// GET /api/residents/[id]
export async function GET(request, { params }) {
  const { id } = params;
  
  console.log('GET /api/residents/[id] called with ID:', id);
  
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      console.error('Firebase admin not available');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    // First try to get the resident by document ID
    let residentDoc = await adminDb.collection('residents').doc(String(id)).get();
    
    if (residentDoc.exists) {
      const resident = { id: residentDoc.id, ...residentDoc.data() };
      console.log('Found resident by document ID:', resident);
      return NextResponse.json(resident, { status: 200 });
    }
    
    // If not found by document ID, try to find by uniqueId field
    console.log('Not found by document ID, searching by uniqueId field...');
    const querySnapshot = await adminDb.collection('residents')
      .where('uniqueId', '==', String(id))
      .limit(1)
      .get();
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const resident = { id: doc.id, ...doc.data() };
      console.log('Found resident by uniqueId field:', resident);
      return NextResponse.json(resident, { status: 200 });
    }
    
    console.log('Resident not found with ID:', id);
    return NextResponse.json({ message: 'Resident not found' }, { status: 404 });
  } catch (error) {
    console.error("Error fetching resident:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/residents/[id]
export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();
  
  console.log('PUT /api/residents/[id] called with:', { id, data });
  
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      console.error('Firebase admin not available');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    // First try to find the resident by document ID
    let residentDoc = await adminDb.collection('residents').doc(String(id)).get();
    let actualDocId = String(id);
    
    if (!residentDoc.exists) {
      console.log('Not found by document ID, searching by uniqueId field...');
      // Try to find by uniqueId field
      const querySnapshot = await adminDb.collection('residents')
        .where('uniqueId', '==', String(id))
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        residentDoc = querySnapshot.docs[0];
        actualDocId = residentDoc.id;
        console.log('Found resident by uniqueId, actual doc ID:', actualDocId);
      } else {
        console.error('Resident not found with ID:', id);
        return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
      }
    }

    const currentData = residentDoc.data();
    console.log('Current resident data:', currentData);
    console.log('Updating document with ID:', actualDocId);

    // Prepare update data, handling nested objects properly
    const updateData = { ...data };
    // Force uppercase for all relevant fields
    if (updateData.firstName) updateData.firstName = updateData.firstName.toUpperCase();
    if (updateData.middleName) updateData.middleName = updateData.middleName.toUpperCase();
    if (updateData.lastName) updateData.lastName = updateData.lastName.toUpperCase();
    if (updateData.suffix) updateData.suffix = updateData.suffix.toUpperCase();
    if (updateData.birthplace) updateData.birthplace = updateData.birthplace.toUpperCase();
    if (updateData.citizenship) updateData.citizenship = updateData.citizenship.toUpperCase();
    if (updateData.occupation) updateData.occupation = updateData.occupation.toUpperCase();
    if (updateData.address) {
      if (typeof updateData.address === 'object') {
        const addr = updateData.address;
        const addressParts = [
          addr.street,
          addr.barangay,
          addr.city,
          addr.province,
          addr.zipCode
        ].filter(part => part && part.trim());
        if (addressParts.length > 0) {
          updateData.address = addressParts.join(', ').toUpperCase();
        } else {
          delete updateData.address;
        }
      } else if (typeof updateData.address === 'string') {
        updateData.address = updateData.address.toUpperCase();
      }
    }
    // Do NOT uppercase email
    
    // Handle field name mapping for backwards compatibility
    if (updateData.phone && !updateData.contactNumber) {
      updateData.contactNumber = updateData.phone;
      delete updateData.phone;
      console.log('Mapped phone to contactNumber');
    }
    
    // Handle address field - if it's an object, convert to string for storage
    if (updateData.address && typeof updateData.address === 'object') {
      const addr = updateData.address;
      const addressParts = [
        addr.street,
        addr.barangay,
        addr.city,
        addr.province,
        addr.zipCode
      ].filter(part => part && part.trim()); // Only include non-empty parts
      
      if (addressParts.length > 0) {
        updateData.address = addressParts.join(', ');
        console.log('Converted address object to string:', updateData.address);
      } else {
        // Don't update address if all parts are empty
        delete updateData.address;
        console.log('Removed empty address from update data');
      }
    }
    
    // Keep birthdate as string for consistency with frontend
    if (updateData.birthdate && typeof updateData.birthdate === 'string') {
      // Ensure it's in YYYY-MM-DD format
      const date = new Date(updateData.birthdate);
      if (!isNaN(date.getTime())) {
        updateData.birthdate = date.toISOString().split('T')[0];
      }
    }
    
    // Remove any undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    // Set updatedAt timestamp
    updateData.updatedAt = new Date();

    console.log('Final update data to be saved:', updateData);

    await adminDb.collection('residents').doc(actualDocId).update(updateData);
    
    console.log('Resident updated successfully in Firestore');
    
    const updatedResident = { id: actualDocId, ...currentData, ...updateData };
    return NextResponse.json(updatedResident, { status: 200 });
  } catch (error) {
    console.error("Error updating resident:", error);
    return NextResponse.json({ error: 'Failed to update resident', details: error.message }, { status: 500 });
  }
}

// DELETE /api/residents/[id]
export async function DELETE(request, { params }) {
  const { id } = params;
  
  console.log('DELETE /api/residents/[id] called with ID:', id);
  
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }
    
    // First try to find the resident by document ID
    let residentDoc = await adminDb.collection('residents').doc(String(id)).get();
    let actualDocId = String(id);
    
    if (!residentDoc.exists) {
      console.log('Not found by document ID, searching by uniqueId field...');
      // Try to find by uniqueId field
      const querySnapshot = await adminDb.collection('residents')
        .where('uniqueId', '==', String(id))
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        residentDoc = querySnapshot.docs[0];
        actualDocId = residentDoc.id;
        console.log('Found resident by uniqueId, actual doc ID:', actualDocId);
      } else {
        console.error('Resident not found with ID:', id);
        return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
      }
    }

    await adminDb.collection('residents').doc(actualDocId).delete();
    console.log('Resident deleted successfully with doc ID:', actualDocId);
    return NextResponse.json({ message: 'Resident deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting resident:", error);
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
  }
}
