import { adminDb } from './firebase-admin';

export async function checkFirebaseAdminSetup() {
  try {
    // Try to write to a test collection
    const testRef = adminDb.collection('_test_connection').doc('test');
    await testRef.set({
      timestamp: new Date(),
      message: 'Testing Firebase Admin connection'
    });

    // Try to read it back
    const doc = await testRef.get();
    if (!doc.exists) {
      throw new Error('Test document not found after writing');
    }

    // Clean up
    await testRef.delete();

    return {
      success: true,
      message: 'Firebase Admin is properly configured and working'
    };
  } catch (error) {
    console.error('Firebase Admin check failed:', error);
    return {
      success: false,
      message: `Firebase Admin configuration error: ${error.message}`,
      error: error
    };
  }
} 