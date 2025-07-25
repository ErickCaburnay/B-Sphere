// src/lib/otp.js
// Utility for calling sendOTP and verifyOTP Firebase Functions
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

// Initialize functions with the correct region
const functions = getFunctions(app, 'us-central1');

/**
 * Send OTP to email via Firebase Function
 * @param {string} email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendEmailOTP(email) {
  const sendOTP = httpsCallable(functions, 'sendOTP');
  try {
    const result = await sendOTP({ email });
    return result.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Verify OTP for email via Firebase Function
 * @param {string} email
 * @param {string} code
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyEmailOTP(email, code) {
  const verifyOTP = httpsCallable(functions, 'verifyOTP');
  try {
    const result = await verifyOTP({ email, code });
    return result.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
} 