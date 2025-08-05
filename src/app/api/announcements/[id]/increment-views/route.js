import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminDb;
try {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };
    const app = initializeApp({ credential: cert(serviceAccount) });
    adminDb = getFirestore(app);
  } else {
    adminDb = getFirestore(getApps()[0]);
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  adminDb = null;
}

export async function POST(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('announcements').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Increment the views count
    await docRef.update({
      views: (docSnap.data().views || 0) + 1,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Views incremented successfully'
    });

  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to increment views' },
      { status: 500 }
    );
  }
} 