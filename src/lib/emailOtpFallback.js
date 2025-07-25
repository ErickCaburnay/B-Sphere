// src/lib/emailOtpFallback.js
// Fallback email OTP system for development when Cloud Functions are not available
import { db } from './firebase';
import { doc, setDoc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via client-side Firestore (Development fallback)
 * @param {string} email
 * @returns {Promise<{success: boolean, error?: string, otp?: string}>}
 */
export async function sendEmailOTPFallback(email) {
  try {
    const otpCode = generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in Firestore
    await setDoc(doc(db, 'otps_fallback', email), {
      code: otpCode,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt,
      attempts: 0
    });

    // For development: return OTP in response (remove in production)
    console.log(`\n=== EMAIL OTP FALLBACK ===`);
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`=========================\n`);

    return { 
      success: true, 
      otp: otpCode, // Only for development
      message: 'OTP generated successfully (Development Mode - check console)' 
    };
  } catch (error) {
    console.error('Error sending email OTP fallback:', error);
    return { success: false, error: 'Failed to generate OTP' };
  }
}

/**
 * Verify OTP via client-side Firestore (Development fallback)
 * @param {string} email
 * @param {string} code
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyEmailOTPFallback(email, code) {
  try {
    const otpRef = doc(db, 'otps_fallback', email);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      return { success: false, error: 'Invalid or expired OTP' };
    }

    const otpData = otpDoc.data();
    const now = new Date();

    // Check if expired
    if (now > otpData.expiresAt.toDate()) {
      await deleteDoc(otpRef);
      return { success: false, error: 'OTP expired' };
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      await deleteDoc(otpRef);
      return { success: false, error: 'Too many failed attempts' };
    }

    // Verify code
    if (otpData.code !== code) {
      await updateDoc(otpRef, {
        attempts: otpData.attempts + 1
      });
      
      if (otpData.attempts + 1 >= 3) {
        await deleteDoc(otpRef);
      }
      
      return { success: false, error: 'Invalid OTP code' };
    }

    // Success - cleanup
    await deleteDoc(otpRef);
    return { success: true };
  } catch (error) {
    console.error('Error verifying email OTP fallback:', error);
    return { success: false, error: 'Verification failed' };
  }
} 