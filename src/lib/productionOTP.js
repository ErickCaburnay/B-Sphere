// src/lib/productionOTP.js
// Production-ready OTP system with real email and SMS sending

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via email using Nodemailer
 * @param {string} email 
 * @param {string} otp 
 * @returns {Promise<boolean>}
 */
async function sendEmailOTP(email, otp) {
  try {
    const response = await fetch('/api/send-email-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return false;
  }
}

/**
 * Send OTP via Firebase Auth SMS
 * @param {string} phoneNumber 
 * @returns {Promise<{success: boolean, confirmationResult?: any, error?: string}>}
 */
async function sendFirebasePhoneOTP(phoneNumber) {
  try {
    const response = await fetch('/api/send-firebase-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending Firebase SMS OTP:', error);
    return { success: false, error: 'Failed to send SMS' };
  }
}

/**
 * Send OTP to email or phone
 * @param {string} contact - email or phone number
 * @param {string} method - 'email' or 'phone'
 * @returns {Promise<{success: boolean, error?: string, confirmationResult?: any}>}
 */
export async function sendProductionOTP(contact, method) {
  try {
    if (method === 'email') {
      const otpCode = generateOTP();
      const now = Date.now();
      const expiresAt = now + (5 * 60 * 1000); // 5 minutes

      // Store OTP in localStorage temporarily
      const otpData = {
        contact,
        method,
        code: otpCode,
        createdAt: now,
        expiresAt,
        attempts: 0
      };

      localStorage.setItem(`otp_${contact}`, JSON.stringify(otpData));

      // Send email OTP
      const sent = await sendEmailOTP(contact, otpCode);
      
      if (!sent) {
        localStorage.removeItem(`otp_${contact}`);
        return { 
          success: false, 
          error: 'Failed to send email. Please try again.' 
        };
      }

      return { 
        success: true, 
        message: 'OTP sent to your email successfully.' 
      };

    } else if (method === 'phone') {
      // Use Firebase Auth for phone verification (no OTP storage needed)
      const result = await sendFirebasePhoneOTP(contact);
      
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to send SMS. Please try again.' 
        };
      }

      return { 
        success: true, 
        message: 'SMS sent to your phone successfully.',
        confirmationResult: result.confirmationResult
      };
    }

    return { success: false, error: 'Invalid verification method.' };
  } catch (error) {
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
}

/**
 * Verify OTP (for email) or Firebase confirmation (for phone)
 * @param {string} contact - email or phone number
 * @param {string} code - OTP code to verify
 * @param {string} method - 'email' or 'phone'
 * @param {any} confirmationResult - Firebase confirmation result for phone
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyProductionOTP(contact, code, method = 'email', confirmationResult = null) {
  try {
    if (method === 'email') {
      // Email OTP verification
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
      
      return { success: true, message: 'Email OTP verified successfully!' };

    } else if (method === 'phone') {
      // Firebase phone verification
      if (!confirmationResult) {
        return { success: false, error: 'Phone verification not initialized. Please try again.' };
      }

      try {
        const result = await confirmationResult.confirm(code.trim());
        
        if (result.user) {
          return { success: true, message: 'Phone number verified successfully!', firebaseUser: result.user };
        } else {
          return { success: false, error: 'Phone verification failed.' };
        }
      } catch (error) {
        if (error.code === 'auth/invalid-verification-code') {
          return { success: false, error: 'Invalid SMS code. Please check and try again.' };
        } else if (error.code === 'auth/code-expired') {
          return { success: false, error: 'SMS code has expired. Please request a new one.' };
        } else {
          return { success: false, error: 'Invalid SMS code. Please try again.' };
        }
      }
    }

    return { success: false, error: 'Invalid verification method.' };
  } catch (error) {
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
        localStorage.removeItem(key);
      }
    }
  });
} 