import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

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

export async function POST(request) {
  try {
    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const {
      firstName,
      middleName,
      lastName,
      birthdate,
      email,
      contactNumber,
      password,
      role,
    } = body;

    // Basic validations
    if (!firstName || !lastName || !birthdate || !email || !contactNumber || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const phoneRegex = /^09\d{9}$/;
    const cleanPhone = contactNumber.trim().replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json({ error: 'Phone number must be 11 digits starting with 09' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Age check (at least 18 suggested for admin)
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) {
      return NextResponse.json({ error: 'Admin must be at least 18 years old' }, { status: 400 });
    }

    // Duplicate checks in admin_accounts
    const existingAdminSnapshot = await db.collection('admin_accounts')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!existingAdminSnapshot.empty) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Normalize role values
    const normalizedRole = String(role).toLowerCase().replace(/\s+/g, '-'); // admin, sub-admin1, sub-admin2, sub-admin3

    const adminDoc = {
      firstName: firstName.trim().toUpperCase(),
      middleName: middleName ? middleName.trim().toUpperCase() : null,
      lastName: lastName.trim().toUpperCase(),
      birthdate: birthdate,
      email: email.toLowerCase().trim(),
      contactNumber: cleanPhone,
      password: hashedPassword,
      role: normalizedRole,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const ref = await db.collection('admin_accounts').add(adminDoc);

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully',
        id: ref.id,
        user: {
          id: ref.id,
          firstName: adminDoc.firstName,
          lastName: adminDoc.lastName,
          email: adminDoc.email,
          role: adminDoc.role
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 