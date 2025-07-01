const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');
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
    db: getFirestore(app)
  };
}

async function fixAdminPassword() {
  try {
    const { db } = getFirebaseAdmin();
    if (!db) {
      console.error('Failed to initialize Firebase Admin');
      return;
    }

    const adminEmail = 'ayesxazeida06@gmail.com';
    const newPassword = 'admin123'; // You can change this

    console.log('Fixing admin password for:', adminEmail);

    // Find the admin account
    const adminSnapshot = await db.collection('admin_accounts')
      .where('email', '==', adminEmail)
      .limit(1)
      .get();

    if (adminSnapshot.empty) {
      console.log('Admin account not found');
      return;
    }

    const adminDoc = adminSnapshot.docs[0];
    const adminData = adminDoc.data();

    console.log('Found admin account:', {
      id: adminDoc.id,
      email: adminData.email,
      hasPassword: !!adminData.password
    });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin account with the new password
    await adminDoc.ref.update({
      password: hashedPassword,
      updatedAt: new Date()
    });

    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', newPassword);
    console.log('🔒 Password Hash:', hashedPassword);
    console.log('');
    console.log('You can now login with these credentials.');

  } catch (error) {
    console.error('Error fixing admin password:', error);
  }
}

// Run the script
fixAdminPassword().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 