import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { validateResidentDuplicates } from '@/lib/duplicateValidation';

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

export async function POST(request) {
  try {
    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { firstName, lastName, middleName, email, contactNumber, birthdate, password } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !contactNumber || !birthdate || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate phone format (Philippine mobile number)
    const phoneRegex = /^09\d{9}$/;
    const cleanPhone = contactNumber.trim().replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json({ error: 'Phone number must be 11 digits starting with 09' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Validate age (must be at least 13 years old)
    const birthDate = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return NextResponse.json({ error: 'You must be at least 13 years old to register' }, { status: 400 });
    }

    // Check if email already exists
    const emailSnapshot = await db.collection('residents')
      .where('email', '==', email.toLowerCase().trim())
      .get();

    if (!emailSnapshot.empty) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Check if phone already exists
    const phoneSnapshot = await db.collection('residents')
      .where('contactNumber', '==', cleanPhone)
      .get();

    if (!phoneSnapshot.empty) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate residents using utility function
    const duplicateValidation = await validateResidentDuplicates(
      db, 
      firstName, 
      lastName, 
      middleName, 
      birthdate
    );

    if (!duplicateValidation.isValid) {
      return NextResponse.json(
        { error: duplicateValidation.error },
        { status: 409 }
      );
    }

    // Generate temporary ID for step 1 data
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare initial resident data (UPPERCASE except email)
    const initialData = {
      tempId: tempId,
      firstName: firstName.trim().toUpperCase(),
      lastName: lastName.trim().toUpperCase(),
      middleName: middleName ? middleName.trim().toUpperCase() : null,
      email: email.toLowerCase().trim(),
      contactNumber: cleanPhone,
      birthdate: birthdate,
      password: password, // Will be used later for Auth creation
      identityKey: duplicateValidation.identityKey,
      fullNameKey: duplicateValidation.fullNameKey,
      step: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Store in temporary collection
    await db.collection('temp_residents').doc(tempId).set(initialData);

    return NextResponse.json(
      { 
        message: 'Step 1 completed successfully',
        tempId: tempId,
        nextStep: 2
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Step 1 error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 