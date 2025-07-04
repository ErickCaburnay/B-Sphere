import getFirebaseAdmin from '@/lib/firebase-admin-dynamic';
import { NextResponse } from 'next/server';

// GET /api/residents/household-status?uniqueId=SF-000001
export async function GET(request) {
  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueId');

    if (!uniqueId) {
      return NextResponse.json({ error: 'Resident ID is required' }, { status: 400 });
    }

    // Check if resident exists as head of household
    const headQuery = await adminDb.collection('households')
      .where('headOfHousehold', '==', uniqueId)
      .limit(1)
      .get();

    if (!headQuery.empty) {
      const household = headQuery.docs[0].data();
      return NextResponse.json({
        isInHousehold: true,
        role: 'head',
        householdId: household.householdId,
        householdData: household
      });
    }

    // Check if resident exists as member in any household
    const memberQuery = await adminDb.collection('households')
      .where('members', 'array-contains', uniqueId)
      .limit(1)
      .get();

    if (!memberQuery.empty) {
      const household = memberQuery.docs[0].data();
      return NextResponse.json({
        isInHousehold: true,
        role: 'member',
        householdId: household.householdId,
        householdData: household
      });
    }

    // Resident is not in any household
    return NextResponse.json({
      isInHousehold: false,
      role: null,
      householdId: null,
      householdData: null
    });
  } catch (error) {
    console.error('Error checking resident household status:', error);
    return NextResponse.json({ error: 'Failed to check resident household status' }, { status: 500 });
  }
} 