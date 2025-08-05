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

// GET - Fetch all announcements
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 10;

    let q = adminDb.collection('announcements');
    
    if (status) {
      q = q.where('status', '==', status);
    }
    
    const querySnapshot = await q.get();
    const announcements = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      announcements.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });

    return NextResponse.json({ 
      success: true, 
      data: announcements.slice(0, limit),
      total: announcements.length 
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST - Create new announcement
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { title, description, category, status = 'draft', color = 'blue', imageUrl, autoPublishDate, autoArchiveDate } = body;

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    const announcementData = {
      title,
      description,
      category,
      status,
      color,
      imageUrl,
      autoPublishDate: autoPublishDate ? new Date(autoPublishDate) : null,
      autoArchiveDate: autoArchiveDate ? new Date(autoArchiveDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin', // TODO: Get from auth context
      views: 0,
      isActive: true
    };

    const docRef = await adminDb.collection('announcements').add(announcementData);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...announcementData },
      message: 'Announcement created successfully' 
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
} 