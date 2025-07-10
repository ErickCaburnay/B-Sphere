require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.error('Missing Firebase Admin configuration');
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser(email, password) {
  try {
    console.log('Creating admin user for:', email);

    // Check if user already exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('User already exists in Firebase Auth');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user in Firebase Auth
        userRecord = await auth.createUser({
          email: email,
          password: password,
          emailVerified: true
        });
        console.log('Created new user in Firebase Auth');
      } else {
        throw error;
      }
    }

    // Set custom claims for admin
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('Set admin custom claims');

    // Update or create admin document in Firestore
    const adminRef = db.collection('admin_accounts').doc(userRecord.uid);
    await adminRef.set({
      email: email,
      role: 'admin',
      firebaseUid: userRecord.uid,
      createdAt: new Date(),
      status: 'active'
    }, { merge: true });

    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email:', email);
    console.log('🆔 Firebase UID:', userRecord.uid);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Please provide email and password as arguments:');
  console.error('node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

createAdminUser(email, password); 