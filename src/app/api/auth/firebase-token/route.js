import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';

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
    auth: getAuth(app)
  };
}

export async function POST(request) {
  try {
    const { auth } = getFirebaseAdmin();
    if (!auth) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const jwtToken = authHeader.replace('Bearer ', '');
    
    let decoded;
    try {
      decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { uid, claims } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    // Create custom claims for Firestore rules
    const customClaims = {
      role: claims.role || 'resident',
      userType: claims.userType || 'resident',
      uniqueId: claims.uniqueId,
      residentId: claims.residentId,
      email: claims.email,
      // Add timestamp for token refresh
      iat: Math.floor(Date.now() / 1000)
    };

    // Generate custom token
    const customToken = await auth.createCustomToken(uid, customClaims);

    return NextResponse.json({ 
      customToken,
      uid,
      claims: customClaims
    }, { status: 200 });

  } catch (error) {
    console.error('Firebase custom token error:', error);
    return NextResponse.json(
      { error: 'Failed to generate custom token' },
      { status: 500 }
    );
  }
} 