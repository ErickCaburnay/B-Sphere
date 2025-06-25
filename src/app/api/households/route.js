import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/households - Fetch all households
export async function GET() {
  try {
    const households = await prisma.household.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        head: true,
      }
    });
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
    const household = await prisma.household.create({
      data: {
        ...data,
        head: {
          connect: { id: data.headId }
        }
      },
      include: {
        head: true
      }
    });
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
    const household = await prisma.household.update({
      where: { id: data.id },
      data: {
        ...data,
        head: {
          connect: { id: data.headId }
        }
      },
      include: {
        head: true
      }
    });
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
    await prisma.household.delete({
      where: { id: data.id }
    });
    return NextResponse.json({ message: 'Household deleted successfully' });
  } catch (error) {
    console.error('Error deleting household:', error);
    return NextResponse.json({ error: 'Failed to delete household' }, { status: 500 });
  }
} 