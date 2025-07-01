const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
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

async function debugResidentAuth() {
  try {
    const { db, auth } = getFirebaseAdmin();
    if (!db || !auth) {
      console.error('Failed to initialize Firebase Admin');
      return;
    }

    const residentEmail = 'azen@gmail.com'; // Change this to the resident's email

    console.log('🔍 Debugging resident authentication for:', residentEmail);
    console.log('=' .repeat(50));

    // Check Firestore resident record
    const residentSnapshot = await db.collection('residents')
      .where('email', '==', residentEmail.toLowerCase())
      .where('role', '==', 'resident')
      .limit(1)
      .get();

    if (residentSnapshot.empty) {
      console.log('❌ Resident not found in Firestore');
      return;
    }

    const resident = residentSnapshot.docs[0].data();
    const residentId = residentSnapshot.docs[0].id;

    console.log('✅ Resident found in Firestore:');
    console.log('   ID:', residentId);
    console.log('   Email:', resident.email);
    console.log('   Account Status:', resident.accountStatus);
    console.log('   Firebase UID:', resident.firebaseUid);
    console.log('   Created At:', resident.createdAt?.toDate?.() || resident.createdAt);
    console.log('');

    // Check Firebase Auth record
    if (resident.firebaseUid) {
      try {
        const userRecord = await auth.getUser(resident.firebaseUid);
        console.log('✅ Firebase Auth record found:');
        console.log('   UID:', userRecord.uid);
        console.log('   Email:', userRecord.email);
        console.log('   Email Verified:', userRecord.emailVerified);
        console.log('   Disabled:', userRecord.disabled);
        console.log('   Created:', new Date(userRecord.metadata.creationTime));
        console.log('   Last Sign In:', userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : 'Never');
        console.log('');

        // Test password with common passwords
        const testPasswords = ['123456', 'password', 'admin123', 'resident123', 'test123'];
        
        console.log('🔐 Testing common passwords...');
        for (const testPassword of testPasswords) {
          try {
            const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;
            
            const authResponse = await fetch(firebaseAuthUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: residentEmail.toLowerCase(),
                password: testPassword,
                returnSecureToken: true,
              }),
            });
            
            if (authResponse.ok) {
              console.log('✅ FOUND WORKING PASSWORD:', testPassword);
              break;
            }
          } catch (error) {
            // Continue testing
          }
        }

      } catch (error) {
        console.log('❌ Firebase Auth record not found or error:', error.message);
      }
    } else {
      console.log('❌ No Firebase UID found for resident');
    }

    console.log('');
    console.log('🚀 Recommendations:');
    console.log('1. If password is forgotten, use password reset functionality');
    console.log('2. Check if the resident remembers their original signup password');
    console.log('3. Consider implementing a "forgot password" feature');

  } catch (error) {
    console.error('Error debugging resident auth:', error);
  }
}

// Run the script
debugResidentAuth().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 