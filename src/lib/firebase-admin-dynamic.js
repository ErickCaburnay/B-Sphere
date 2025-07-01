// Dynamic Firebase Admin SDK configuration
import { adminDb, adminAuth } from './firebase-admin.js';

// Function to dynamically get Firebase Admin services
export async function getFirebaseAdmin() {
  try {
    // Return the Firebase Admin services
    return {
      adminDb,
      adminAuth
    };
  } catch (error) {
    console.error('Error getting Firebase Admin services:', error);
    return {
      adminDb: null,
      adminAuth: null
    };
  }
}

// Also export as default for backward compatibility
export default getFirebaseAdmin; 