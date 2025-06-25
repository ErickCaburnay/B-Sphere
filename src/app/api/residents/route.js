import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/residents - Fetch paginated residents
export async function GET(request) {
  try {
    // Parse query params for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Fetch paginated residents
    const [residents, total] = await Promise.all([
      prisma.resident.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.resident.count(),
    ]);

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
      let latestResident = await prisma.resident.findFirst({ orderBy: { id: 'desc' } });
      let lastNumber = latestResident ? parseInt(latestResident.id.split('-')[1]) : 0;
      const createdResidents = [];
      for (const r of batch) {
        // Generate new ID
        lastNumber++;
        const newId = `SF-${String(lastNumber).padStart(5, '0')}`;
        // Required fields fallback
        const newResident = await prisma.resident.create({
          data: {
            id: newId,
            firstName: r.firstName || '',
            middleName: r.middleName || null,
            lastName: r.lastName || '',
            suffix: r.suffix || null,
            address: r.address || '',
            birthdate: r.birthdate ? new Date(r.birthdate) : new Date(),
            birthplace: r.birthplace || '',
            citizenship: r.citizenship || '',
            maritalStatus: r.maritalStatus || '',
            gender: r.gender || '',
            voterStatus: r.voterStatus || '',
            employmentStatus: r.employmentStatus || null,
            educationalAttainment: r.educationalAttainment || null,
            occupation: r.occupation || null,
            contactNumber: r.contactNumber || null,
            email: r.email || null,
            isTUPAD: r.isTUPAD || false,
            isPWD: r.isPWD || false,
            is4Ps: r.is4Ps || false,
            isSoloParent: r.isSoloParent || false
          }
        });
        createdResidents.push(newResident);
      }
      return NextResponse.json(createdResidents, { status: 201 });
    }
    // ... existing single create logic ...
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
        middleName: middleName || null,
        lastName,
        suffix: suffix || null,
        address,
        birthdate: new Date(birthdate),
        birthplace,
        citizenship,
        maritalStatus,
        gender,
        voterStatus,
        employmentStatus: employmentStatus || null,
        educationalAttainment: educationalAttainment || null,
        occupation: occupation || null,
        contactNumber: contactNumber || null,
        email: email || null,
        isTUPAD: isTUPAD || false,
        isPWD: isPWD || false,
        is4Ps: is4Ps || false,
        isSoloParent: isSoloParent || false
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

    const updatedResident = await prisma.resident.update({
      where: { id },
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        suffix: suffix || null,
        address,
        birthdate: new Date(birthdate),
        birthplace,
        citizenship,
        maritalStatus,
        gender,
        voterStatus,
        employmentStatus: employmentStatus || null,
        educationalAttainment: educationalAttainment || null,
        occupation: occupation || null,
        contactNumber: contactNumber || null,
        email: email || null,
        isTUPAD: isTUPAD || false,
        isPWD: isPWD || false,
        is4Ps: is4Ps || false,
        isSoloParent: isSoloParent || false
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