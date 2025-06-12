import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/residents - Fetch all residents
export async function GET() {
  try {
    const residents = await prisma.resident.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(residents);
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
  }
}

// POST /api/residents - Create a new resident
export async function POST(request) {
  try {
    const { firstName, middleName, lastName, birthdate, civilStatus, gender, voterStatus } = await request.json();

    // Basic validation
    if (!firstName || !lastName || !birthdate || !civilStatus || !gender || !voterStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the latest resident to determine the next ID
    const latestResident = await prisma.resident.findFirst({
      orderBy: { id: 'desc' },
    });

    // Generate new ID
    let newId;
    if (!latestResident) {
      newId = 'SF-00001';
    } else {
      const lastNumber = parseInt(latestResident.id.split('-')[1]);
      newId = `SF-${String(lastNumber + 1).padStart(5, '0')}`;
    }

    const newResident = await prisma.resident.create({
      data: {
        id: newId,
        firstName,
        middleName: middleName || null, // Allow null for optional middleName
        lastName,
        birthdate: new Date(birthdate), // Convert string to Date object
        civilStatus,
        gender,
        voterStatus,
      },
    });
    return NextResponse.json(newResident, { status: 201 });
  } catch (error) {
    console.error('Error adding resident:', error);
    // Check for unique constraint violation (e.g., duplicate ID)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Resident with this ID already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add resident' }, { status: 500 });
  }
}

// PUT /api/residents - Update a resident
export async function PUT(request) {
  try {
    const { id, firstName, middleName, lastName, birthdate, civilStatus, gender, voterStatus } = await request.json();

    // Basic validation
    if (!id || !firstName || !lastName || !birthdate || !civilStatus || !gender || !voterStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedResident = await prisma.resident.update({
      where: { id },
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        birthdate: new Date(birthdate),
        civilStatus,
        gender,
        voterStatus,
      },
    });
    return NextResponse.json(updatedResident);
  } catch (error) {
    console.error('Error updating resident:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
  }
}

// DELETE /api/residents - Delete a resident
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Resident ID is required' }, { status: 400 });
    }

    await prisma.resident.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Error deleting resident:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
  }
} 