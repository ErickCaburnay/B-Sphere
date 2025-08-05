import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
let adminDb;
try {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };
    
    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    adminDb = getFirestore(app);
  } else {
    adminDb = getFirestore(getApps()[0]);
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  adminDb = null;
}

// GET - Fetch single announcement
export async function GET(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { id } = params;
    const docRef = adminDb.collection('announcements').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const announcement = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
      updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt
    };

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcement' },
      { status: 500 }
    );
  }
}

// PUT - Update announcement
export async function PUT(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { title, description, category, status, color, imageUrl, autoPublishDate, autoArchiveDate } = body;

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('announcements').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const updateData = {
      title,
      description,
      category,
      status,
      color,
      imageUrl,
      autoPublishDate: autoPublishDate ? new Date(autoPublishDate) : null,
      autoArchiveDate: autoArchiveDate ? new Date(autoArchiveDate) : null,
      updatedAt: new Date()
    };

    await docRef.update(updateData);

    return NextResponse.json({ 
      success: true, 
      message: 'Announcement updated successfully' 
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete announcement
export async function DELETE(request, { params }) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { id } = params;
    const docRef = adminDb.collection('announcements').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({ 
      success: true, 
      message: 'Announcement deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
} 