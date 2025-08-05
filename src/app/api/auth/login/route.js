import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

    const { email, password, userType } = await request.json();

    // Validate required fields
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, password, and user type are required' },
        { status: 400 }
      );
    }

    // Handle admin login
    if (userType === 'admin') {
      //console.log('Attempting admin login with email:', email.toLowerCase());

      let admin = null;
      let adminId = null;

      // First, try to find admin in the legacy admin_accounts collection
      const legacyAdminSnapshot = await db.collection('admin_accounts')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (!legacyAdminSnapshot.empty) {
        admin = legacyAdminSnapshot.docs[0].data();
        adminId = legacyAdminSnapshot.docs[0].id;
      //   console.log('Found admin in legacy admin_accounts collection:', {
      //   id: adminId,
      //     email: admin.email,
      //       hasPassword: !!admin.password,
      //         hasFirebaseUid: !!admin.firebaseUid
      // });
    } else {
      // If not found in legacy collection, try residents collection
      const adminSnapshot = await db.collection('residents')
        .where('email', '==', email.toLowerCase())
        .where('role', 'in', ['admin', 'sub-admin'])
        .limit(1)
        .get();

      if (!adminSnapshot.empty) {
        admin = adminSnapshot.docs[0].data();
        adminId = adminSnapshot.docs[0].id;
      //   console.log('Found admin in residents collection:', {
      //   id: adminId,
      //     email: admin.email,
      //       hasPassword: !!admin.password,
      //         hasFirebaseUid: !!admin.firebaseUid
      // });
    }
  }

      if (!admin) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // Add the document ID to the admin object
  admin.id = adminId;

  // Handle password verification based on admin type
  //console.log('Admin password verification - firebaseUid:', admin.firebaseUid ? 'exists' : 'missing');

  if (admin.firebaseUid) {
    // For admins with Firebase Auth, verify using Firebase Auth REST API
    try {
      // Verify user exists in Firebase Auth and get user record
      const userRecord = await auth.getUser(admin.firebaseUid);

      // Check if user is disabled
      if (userRecord.disabled) {
        return NextResponse.json(
          { error: 'Account is disabled' },
          { status: 401 }
        );
      }

      // Use Firebase Auth REST API to verify password
      const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

      const authResponse = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password: password,
          returnSecureToken: true,
        }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        //console.error('Firebase Auth error:', authData);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify that the Firebase UID matches
      if (authData.localId !== admin.firebaseUid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

    } catch (error) {
      //console.error('Firebase Auth verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } else {
    // Legacy admin without Firebase Auth - use bcrypt/plain text comparison
    const storedPassword = admin.password;

    // console.log('Legacy admin password check:', {
    //   hasStoredPassword: !!storedPassword,
    //   storedPasswordType: storedPassword ? (storedPassword.startsWith('$2') ? 'bcrypt' : 'plaintext') : 'none',
    //   inputPasswordLength: password ? password.length : 0
    // });

    if (!storedPassword) {
      //console.log('No password found for admin account. Admin may need to set up password.');
      return NextResponse.json(
        { error: 'Account setup incomplete. Please contact system administrator to set up your password.' },
        { status: 401 }
      );
    }

    let isValidPassword = false;

    // First try bcrypt comparison (for hashed passwords)
    try {
      if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
        // This looks like a bcrypt hash
        //console.log('Attempting bcrypt password comparison');
        isValidPassword = await bcrypt.compare(password, storedPassword);
      } else {
        // Plain text password comparison
        //console.log('Attempting plain text password comparison');
        isValidPassword = password === storedPassword;
      }
    } catch (error) {
      //console.error('Password comparison error:', error);
      // Fallback to plain text comparison
      isValidPassword = password === storedPassword;
    }

    //console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  }

  // Generate JWT token
  if (!process.env.JWT_SECRET) {
    //console.error('JWT_SECRET environment variable is not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role || 'admin', // Default to 'admin' if role is not set
      userType: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Return success response with token and user info (excluding password)
  const { password: _, ...adminData } = admin;

  // Create response with cookie
  const response = NextResponse.json({
    success: true,
    message: 'Login successful',
    token,
    user: adminData,
    userType: 'admin'
  });

  // Set the token as an HTTP-only cookie
  response.cookies.set('token', token, {
    httpOnly: false, // Allow JavaScript access for now
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/'
  });

  return response;
}

// Handle resident login
if (userType === 'resident') {
  //console.log('Attempting resident login with email:', email.toLowerCase());

  // Find resident by email in residents collection
  const residentSnapshot = await db.collection('residents')
    .where('email', '==', email.toLowerCase())
    .where('role', '==', 'resident')
    .limit(1)
    .get();

  if (residentSnapshot.empty) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const resident = { id: residentSnapshot.docs[0].id, ...residentSnapshot.docs[0].data() };

  // console.log('Resident login check:', {
  //   id: resident.id,
  //   email: resident.email,
  //   accountStatus: resident.accountStatus,
  //   hasFirebaseUid: !!resident.firebaseUid,
  //   firebaseUid: resident.firebaseUid
  // });

  // Allow residents to login regardless of account status
  // Only show a warning if account is pending, but still allow login
  if (resident.accountStatus === 'pending') {
    //console.log('Resident account is pending approval, but allowing login');
    // Continue with login but the resident will see a warning in their dashboard
  }

  // Handle authentication based on whether resident has Firebase Auth or not
  if (resident.firebaseUid) {
    // Resident has Firebase Auth - verify using Firebase Auth
    try {
      // Verify user exists in Firebase Auth and get user record
      const userRecord = await auth.getUser(resident.firebaseUid);

      if (userRecord.disabled) {
        return NextResponse.json(
          { error: 'Account is disabled' },
          { status: 401 }
        );
      }

      // Use Firebase Auth REST API to verify password
      const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

      const authResponse = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password: password,
          returnSecureToken: true,
        }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        //console.error('Firebase Auth error:', authData);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify that the Firebase UID matches
      if (authData.localId !== resident.firebaseUid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

    } catch (error) {
      //console.error('Firebase Auth verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } else {
    // Legacy resident without Firebase Auth - allow login without password verification
    // This is for accounts created before Firebase Auth integration
    //console.log('Legacy resident account detected - allowing login without Firebase Auth verification');

    // For legacy accounts, we'll allow login without password verification
    // In a production system, you might want to implement a different authentication method
    // or require these users to set up Firebase Auth
  }

  // Generate JWT token for resident
  if (!process.env.JWT_SECRET) {
    //console.error('JWT_SECRET environment variable is not set');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const token = jwt.sign(
    {
      id: resident.id,
      uniqueId: resident.uniqueId,
      firebaseUid: resident.firebaseUid || null,
      email: resident.email,
      role: resident.role,
      userType: 'resident'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Return success response with token and user info
  const { password: _, ...residentData } = resident;

  // Add residentId field for compatibility with frontend components
  const userDataWithResidentId = {
    ...residentData,
    residentId: residentData.uniqueId, // Map uniqueId to residentId for display
    uid: residentData.firebaseUid || residentData.uniqueId // Ensure uid is set for compatibility
  };

  // Create response with cookie
  const response = NextResponse.json({
    success: true,
    message: 'Login successful',
    token,
    user: userDataWithResidentId,
    userType: 'resident'
  });

  // Set the token as an HTTP-only cookie
  response.cookies.set('token', token, {
    httpOnly: false, // Allow JavaScript access for now
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/'
  });

  return response;
}

return NextResponse.json(
  { error: 'Invalid user type' },
  { status: 400 }
);

  } catch (error) {
  //console.error('Login error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
} 