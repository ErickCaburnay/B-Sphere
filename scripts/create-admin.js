const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config({ path: '.env.local' });

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

async function createAdmin() {
  try {
    const { db, auth } = getFirebaseAdmin();
    if (!db || !auth) {
      console.error('Failed to initialize Firebase Admin');
      return;
    }

    // Admin details - you can modify these
    const adminData = {
      email: 'admin@bsphere.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator'
    };

    console.log('Creating admin account...');

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: adminData.email,
      password: adminData.password,
      displayName: `${adminData.firstName} ${adminData.lastName}`,
      emailVerified: true,
    });

    console.log('Firebase Auth user created:', userRecord.uid);

    // Create admin document in residents collection
    const adminDoc = {
      uniqueId: 'ADMIN-001',
      firebaseUid: userRecord.uid,
      firstName: adminData.firstName.toUpperCase(),
      lastName: adminData.lastName.toUpperCase(),
      middleName: null,
      suffix: null,
      email: adminData.email.toLowerCase(),
      contactNumber: '09123456789',
      birthdate: '1990-01-01',
      birthplace: null,
      address: null,
      citizenship: 'Filipino',
      maritalStatus: null,
      gender: null,
      voterStatus: null,
      employmentStatus: null,
      educationalAttainment: null,
      occupation: 'System Administrator',
      isTUPAD: false,
      isPWD: false,
      is4Ps: false,
      isSoloParent: false,
      role: 'admin',
      accountStatus: 'approved',
      updateRequest: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Save to Firestore
    await db.collection('residents').doc('ADMIN-001').set(adminDoc);

    console.log('Admin account created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Unique ID:', 'ADMIN-001');

  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

// Run the script
createAdmin().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 