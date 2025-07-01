import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { generateNextResidentId } from '@/lib/utils';

// Initialize Firebase Admin directly in this route
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
    db: getFirestore(app),
    auth: getAuth(app)
  };
}

export async function POST(request) {
  try {
    const { db, auth } = getFirebaseAdmin();
    if (!db || !auth) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { firstName, lastName, middleName, email, phone, birthdate, password } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !birthdate || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate phone format (Philippine mobile number)
    const phoneRegex = /^09\d{9}$/;
    const cleanPhone = phone.trim().replace(/\s+/g, ''); // Remove any whitespace
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

    // Check if email already exists in residents collection
    const emailSnapshot = await db.collection('residents')
      .where('email', '==', email.toLowerCase().trim())
      .get();

    if (!emailSnapshot.empty) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Check if phone already exists in residents collection
    const phoneSnapshot = await db.collection('residents')
      .where('contactNumber', '==', cleanPhone)
      .get();

    if (!phoneSnapshot.empty) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists' },
        { status: 409 }
      );
    }

    // Create Firebase Auth user first
    const userRecord = await auth.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      displayName: `${firstName.trim()} ${lastName.trim()}`,
      emailVerified: false,
    });

    // Generate the next resident ID
    const uniqueId = await generateNextResidentId(db);

    // Prepare resident data for Firestore
    const residentData = {
      uniqueId: uniqueId,
      firebaseUid: userRecord.uid,
      firstName: firstName.trim().toUpperCase(),
      lastName: lastName.trim().toUpperCase(),
      middleName: middleName ? middleName.trim().toUpperCase() : null,
      suffix: null,
      email: email.toLowerCase().trim(),
      contactNumber: cleanPhone,
      birthdate: birthdate,
      birthplace: null,
      address: null,
      citizenship: null,
      maritalStatus: null,
      gender: null,
      voterStatus: null,
      employmentStatus: null,
      educationalAttainment: null,
      occupation: null,
      isTUPAD: false,
      isPWD: false,
      is4Ps: false,
      isSoloParent: false,
      role: 'resident',
      accountStatus: 'pending', // Resident signups need admin approval
      updateRequest: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Save to Firestore residents collection using uniqueId as document ID
    await db.collection('residents').doc(uniqueId).set(residentData);

    // Create notification for admin about new registration using new structure
    try {
      await db.collection('notifications').add({
        type: 'new_registration',
        title: `${residentData.firstName} ${residentData.lastName} has registered`,
        message: `New resident registration from ${residentData.firstName} ${residentData.lastName}. Please review and verify the information.`,
        residentId: uniqueId,
        dataId: uniqueId, // For new registrations, dataId is the same as residentId
        priority: 'high',
        redirectTarget: 'page',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the signup process if notification fails
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Account created successfully. Your profile is pending admin approval.',
        user: {
          uniqueId: uniqueId,
          firebaseUid: userRecord.uid,
          firstName: residentData.firstName,
          lastName: residentData.lastName,
          email: residentData.email,
          accountStatus: residentData.accountStatus
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 