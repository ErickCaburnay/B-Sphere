import jwt from 'jsonwebtoken';
import { adminDb } from './firebase-admin';

/**
 * Verifies an admin token and checks if the user has admin privileges
 * @param {string} token - The JWT token to verify
 * @returns {Promise<boolean>} - Returns true if token is valid and user has admin privileges
 */
export async function verifyToken(token) {
  try {
    console.log('verifyToken - Starting verification:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      hasJWTSecret: !!process.env.JWT_SECRET
    });
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('verifyToken - JWT decoded:', {
      hasDecoded: !!decoded,
      email: decoded?.email,
      role: decoded?.role,
      userType: decoded?.userType
    });
    
    if (!decoded || !decoded.email) {
      console.log('verifyToken - No decoded token or email');
      return false;
    }

    // Check if user exists and has admin privileges
    const legacyAdminSnapshot = await adminDb.collection('admin_accounts')
      .where('email', '==', decoded.email)
      .limit(1)
      .get();

    console.log('verifyToken - Legacy admin check:', {
      empty: legacyAdminSnapshot.empty,
      size: legacyAdminSnapshot.size
    });

    if (!legacyAdminSnapshot.empty) {
      console.log('verifyToken - Found in admin_accounts, returning true');
      return true;
    }

    // Check residents collection for admin role as fallback
    const residentSnapshot = await adminDb.collection('residents')
      .where('email', '==', decoded.email)
      .where('role', 'in', ['admin', 'sub-admin'])
      .limit(1)
      .get();

    console.log('verifyToken - Resident admin check:', {
      empty: residentSnapshot.empty,
      size: residentSnapshot.size
    });

    const result = !residentSnapshot.empty;
    console.log('verifyToken - Final result:', result);
    return result;
  } catch (error) {
    console.error('verifyToken - Error:', error);
    return false;
  }
}

/**
 * Generates the next sequential resident ID in the format SF-000000
 * This function checks only the 'residents' collection as it's the single source of truth
 */
export async function generateNextResidentId(adminDb) {
  try {
    // Get the latest ID from residents collection only
    const residentsSnapshot = await adminDb.collection('residents')
      .orderBy('uniqueId', 'desc')
      .limit(1)
      .get();

    let maxNumber = 0;

    // Check residents collection
    if (!residentsSnapshot.empty) {
      const latestResident = residentsSnapshot.docs[0].data();
      if (latestResident.uniqueId && latestResident.uniqueId.startsWith('SF-')) {
        const residentNumber = parseInt(latestResident.uniqueId.split('-')[1]);
        maxNumber = Math.max(maxNumber, residentNumber);
      }
    }

    // Generate next ID with 6 digits
    const nextNumber = maxNumber + 1;
    return `SF-${String(nextNumber).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating next resident ID:', error);
    throw error;
  }
} 