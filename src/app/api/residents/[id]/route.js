import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

// GET /api/residents/[id]
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const residentDoc = await adminDb.collection('residents').doc(String(id)).get();
    
    if (residentDoc.exists) {
      const resident = { id: residentDoc.id, ...residentDoc.data() };
      return NextResponse.json(resident, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Resident not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching resident:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/residents/[id]
export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();
  try {
    // Check if resident exists
    const residentDoc = await adminDb.collection('residents').doc(String(id)).get();
    
    if (!residentDoc.exists) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    const updateData = {
      ...data,
      birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
      updatedAt: new Date(),
    };

    await adminDb.collection('residents').doc(String(id)).update(updateData);
    
    const updatedResident = { id: String(id), ...residentDoc.data(), ...updateData };
    return NextResponse.json(updatedResident, { status: 200 });
  } catch (error) {
    console.error("Error updating resident:", error);
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
  }
}

// DELETE /api/residents/[id]
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    // Check if resident exists
    const residentDoc = await adminDb.collection('residents').doc(String(id)).get();
    
    if (!residentDoc.exists) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    await adminDb.collection('residents').doc(String(id)).delete();
    return NextResponse.json({ message: 'Resident deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting resident:", error);
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
  }
}
