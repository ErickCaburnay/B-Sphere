import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const resident = await prisma.resident.findUnique({
      where: {
        id: String(id),
      },
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