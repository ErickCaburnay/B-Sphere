// src/lib/simpleOTP.js
// Simple localStorage-based OTP system for development/testing
// This bypasses all Firebase configuration issues

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP (stores in localStorage for development)
 * @param {string} contact - email or phone number
 * @param {string} method - 'email' or 'phone'
 * @returns {Promise<{success: boolean, error?: string, otp?: string}>}
 */
export async function sendSimpleOTP(contact, method) {
  try {
    const otpCode = generateOTP();
    const now = Date.now();
    const expiresAt = now + (5 * 60 * 1000); // 5 minutes

    // Store OTP in localStorage
    const otpData = {
      contact,
      method,
      code: otpCode,
      createdAt: now,
      expiresAt,
      attempts: 0
    };

    localStorage.setItem(`otp_${contact}`, JSON.stringify(otpData));

    // Log OTP for development
    console.log(`\n=== ${method.toUpperCase()} OTP (DEVELOPMENT) ===`);
    console.log(`${method === 'email' ? 'Email' : 'Phone'}: ${contact}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`Expires in 5 minutes`);
    console.log(`=====================================\n`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { 
      success: true, 
      otp: otpCode, // Only for development
      message: `OTP sent successfully (Development Mode - check console)` 
    };
  } catch (error) {
    console.error('Error sending simple OTP:', error);
    return { success: false, error: 'Failed to send OTP' };
  }
}

/**
 * Verify OTP (checks localStorage)
 * @param {string} contact - email or phone number
 * @param {string} code - OTP code to verify
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifySimpleOTP(contact, code) {
  try {
    const otpDataStr = localStorage.getItem(`otp_${contact}`);
    
    if (!otpDataStr) {
      return { success: false, error: 'No OTP found. Please request a new one.' };
    }

    const otpData = JSON.parse(otpDataStr);
    const now = Date.now();

    // Check if expired
    if (now > otpData.expiresAt) {
      localStorage.removeItem(`otp_${contact}`);
      return { success: false, error: 'OTP has expired. Please request a new one.' };
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      localStorage.removeItem(`otp_${contact}`);
      return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Verify code
    if (otpData.code !== code.trim()) {
      otpData.attempts += 1;
      
      if (otpData.attempts >= 3) {
        localStorage.removeItem(`otp_${contact}`);
        return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
      } else {
        localStorage.setItem(`otp_${contact}`, JSON.stringify(otpData));
        return { success: false, error: `Invalid OTP code. ${3 - otpData.attempts} attempts remaining.` };
      }
    }

    // Success - cleanup
    localStorage.removeItem(`otp_${contact}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'OTP verified successfully!' };
  } catch (error) {
    console.error('Error verifying simple OTP:', error);
    return { success: false, error: 'Verification failed. Please try again.' };
  }
}

/**
 * Clean up expired OTPs from localStorage
 */
export function cleanupExpiredOTPs() {
  const now = Date.now();
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('otp_')) {
      try {
        const otpData = JSON.parse(localStorage.getItem(key));
        if (now > otpData.expiresAt) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Remove corrupted OTP data
        localStorage.removeItem(key);
      }
    }
  });
} 