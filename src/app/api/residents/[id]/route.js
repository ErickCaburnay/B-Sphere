import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/residents/[id]
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const resident = await prisma.resident.findUnique({
      where: { id: String(id) },
    });
    if (resident) {
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
    const updatedResident = await prisma.resident.update({
      where: { id: String(id) },
      data: {
        ...data,
        birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
      },
    });
    return NextResponse.json(updatedResident, { status: 200 });
  } catch (error) {
    console.error("Error updating resident:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
  }
}

// DELETE /api/residents/[id]
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await prisma.resident.delete({
      where: { id: String(id) },
    });
    return NextResponse.json({ message: 'Resident deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting resident:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 });
  }
}
