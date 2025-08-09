import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error('Missing Firebase Admin configuration');
      }
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      return null;
    }
  }
  const app = getApps()[0];
  return { db: getFirestore(app) };
}

export async function GET() {
  try {
    const { db } = getFirebaseAdmin() || {};
    if (!db) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const snapshot = await db
      .collection('admin_accounts')
      .orderBy('createdAt', 'desc')
      .get();

    const admins = snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        firstName: data.firstName || '',
        middleName: data.middleName || null,
        lastName: data.lastName || '',
        email: data.email || '',
        contactNumber: data.contactNumber || '',
        role: data.role || 'admin',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
      };
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('List admins error:', error);
    return NextResponse.json({ error: 'Failed to load admins' }, { status: 500 });
  }
} 