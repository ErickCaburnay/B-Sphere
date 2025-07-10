import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
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
  return {
    db: getFirestore(app)
  };
}

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get Firebase Admin instance
    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    // Check if user exists and is an admin
    let adminDoc;
    
    // First check legacy admin_accounts
    const legacyAdminSnapshot = await db.collection('admin_accounts')
      .where('email', '==', decoded.email)
      .limit(1)
      .get();

    if (!legacyAdminSnapshot.empty) {
      adminDoc = legacyAdminSnapshot.docs[0];
    } else {
      // If not found in legacy collection, check residents collection
      const adminSnapshot = await db.collection('residents')
        .where('email', '==', decoded.email)
        .where('role', 'in', ['admin', 'sub-admin'])
        .limit(1)
        .get();

      if (!adminSnapshot.empty) {
        adminDoc = adminSnapshot.docs[0];
      }
    }

    if (!adminDoc) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Token is valid and user is an admin
    return NextResponse.json({ 
      success: true,
      user: {
        email: decoded.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 