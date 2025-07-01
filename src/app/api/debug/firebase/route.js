import { NextResponse } from 'next/server';
import getFirebaseAdmin from '@/lib/firebase-admin-dynamic';

export async function GET() {
  try {
    const { adminDb } = await getFirebaseAdmin();

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });
    }

    // List all collections
    const collections = await adminDb.listCollections();
    const collectionNames = collections.map(col => col.id);

    console.log('Available collections:', collectionNames);

    // Check admin_accounts collection specifically
    let adminAccounts = [];
    try {
      const adminAccountsSnapshot = await adminDb.collection('admin_accounts').get();
      adminAccounts = adminAccountsSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
      console.log('Admin accounts found:', adminAccounts);
    } catch (error) {
      console.log('Error fetching admin_accounts:', error.message);
    }

    return NextResponse.json({
      success: true,
      collections: collectionNames,
      adminAccounts: adminAccounts
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 