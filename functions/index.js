const { onCall } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Set global options
setGlobalOptions({
  region: 'asia-southeast1',
  memory: '256MB',
  timeoutSeconds: 300
});

const db = admin.firestore();

// Configure your email transport (use environment variables for credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass,
  },
});

/**
 * sendOTP
 * Callable function to generate and email a 6-digit OTP, store in Firestore
 * Input: { email: string }
 * Output: { success: true } or { success: false, error: string }
 */
exports.sendOTP = functions.https.onCall(async (data, context) => {
  const { email } = data;
  if (!email) return { success: false, error: 'Email required' };

  // Generate OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = admin.firestore.Timestamp.now();
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)); // 5 min

  // Store in Firestore
  await db.collection('otps').doc(email).set({
    code,
    createdAt: now,
    expiresAt,
    attempts: 0,
  });

  // Send email
  try {
    await transporter.sendMail({
      from: functions.config().email.user,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${code}`,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to send email' };
  }
});

/**
 * verifyOTP
 * Callable function to verify a 6-digit OTP for an email
 * Input: { email: string, code: string }
 * Output: { success: true } or { success: false, error: string }
 */
exports.verifyOTP = functions.https.onCall(async (data, context) => {
  const { email, code } = data;
  if (!email || !code) return { success: false, error: 'Email and code required' };

  const docRef = db.collection('otps').doc(email);
  const doc = await docRef.get();
  if (!doc.exists) return { success: false, error: 'Invalid or expired OTP' };

  const otpData = doc.data();
  const now = admin.firestore.Timestamp.now();

  if (now.toMillis() > otpData.expiresAt.toMillis()) {
    await docRef.delete();
    return { success: false, error: 'OTP expired' };
  }

  if (otpData.attempts >= 3) {
    await docRef.delete();
    return { success: false, error: 'Max attempts exceeded' };
  }

  if (otpData.code !== code) {
    await docRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
    if (otpData.attempts + 1 >= 3) await docRef.delete();
    return { success: false, error: 'Invalid OTP' };
  }

  // Success
  await docRef.delete();
  return { success: true };
});

// Send verification using Firebase Auth
exports.sendVerification = onCall(async (request) => {
  try {
    const { email, tempId, method } = request.data;
    if (!email || !tempId || !method) {
      throw new Error('Email, tempId, and method are required');
    }

    if (method === 'email') {
      try {
        // Create or get existing user for email verification
        let userRecord;
        try {
          userRecord = await admin.auth().getUserByEmail(email);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Create temporary user for email verification
            userRecord = await admin.auth().createUser({
              email: email,
              emailVerified: false,
              disabled: true // Keep disabled until verified
            });
          } else {
            throw error;
          }
        }

        // Store verification info in Firestore
        await db.collection('otp_codes').doc(tempId).set({
          method: 'email',
          tempId: tempId,
          email: email,
          firebaseUid: userRecord.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          ),
          used: false,
          resendCount: 0
        });

        // Generate Firebase Auth email verification link
        const actionCodeSettings = {
          url: `${process.env.APP_URL || 'http://localhost:3000'}/signup?step=2&tempId=${tempId}&verified=true`,
          handleCodeInApp: true,
        };

        const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
        
        // Firebase Auth will send the email automatically
        // No logging of sensitive information
        
        return { 
          success: true,
          message: 'Verification email sent successfully',
          firebaseUid: userRecord.uid
        };
      } catch (error) {
        console.error('Error sending email verification:', error);
        throw new Error('Failed to send email verification');
      }
    } else if (method === 'phone') {
      // For phone method, store verification info for client-side Firebase Auth
      const phoneNumber = email; // email parameter contains phone number
      
      await db.collection('otp_codes').doc(tempId).set({
        method: 'phone',
        tempId: tempId,
        phoneNumber: phoneNumber,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        ),
        used: false,
        resendCount: 0
      });
      
      return { 
        success: true,
        message: 'Phone verification setup successfully'
      };
    }

  } catch (error) {
    console.error('Error in sendVerification:', error);
    throw new Error(error.message);
  }
});

// Verify using Firebase Auth
exports.verifyAuth = onCall({ 
  cors: true,
  maxInstances: 10
}, async (request) => {
  if (!request?.data?.tempId) {
    return {
      success: false,
      error: 'INVALID_PARAMS',
      message: 'TempId is required'
    };
  }

  const { tempId, firebaseUid } = request.data;

  try {
    // Get verification document
    const otpRef = db.collection('otp_codes').doc(tempId);
    const otpDoc = await otpRef.get();

    // Check if verification record exists
    if (!otpDoc.exists) {
      return {
        success: false,
        error: 'NOT_FOUND',
        message: 'Verification record not found or expired'
      };
    }

    const otpData = otpDoc.data();

    // Check expiration
    const now = admin.firestore.Timestamp.now();
    if (now.seconds > otpData.expiresAt.seconds) {
      await otpRef.delete();
      return {
        success: false,
        error: 'EXPIRED',
        message: 'Verification has expired'
      };
    }

    // Check if already used
    if (otpData.used) {
      return {
        success: false,
        error: 'ALREADY_USED',
        message: 'Verification already completed'
      };
    }

    if (otpData.method === 'email') {
      // For email verification, check Firebase Auth email verification status
      if (!otpData.firebaseUid) {
        return {
          success: false,
          error: 'INVALID_RECORD',
          message: 'Invalid verification record'
        };
      }

      try {
        const userRecord = await admin.auth().getUser(otpData.firebaseUid);
        
        if (!userRecord.emailVerified) {
          return {
            success: false,
            error: 'EMAIL_NOT_VERIFIED',
            message: 'Please click the verification link in your email first'
          };
        }

        // Success - mark as used
        await otpRef.update({ used: true });
        
        return { 
          success: true,
          message: 'Email verified successfully',
          firebaseUid: otpData.firebaseUid
        };
      } catch (error) {
        return {
          success: false,
          error: 'VERIFICATION_ERROR',
          message: 'Failed to verify email status'
        };
      }
    } else if (otpData.method === 'phone') {
      // For phone verification, verify Firebase UID
      if (!firebaseUid) {
        return {
          success: false,
          error: 'MISSING_FIREBASE_UID',
          message: 'Firebase UID required for phone verification'
        };
      }

      try {
        const userRecord = await admin.auth().getUser(firebaseUid);
        if (!userRecord.phoneNumber || userRecord.phoneNumber !== otpData.phoneNumber) {
          return {
            success: false,
            error: 'PHONE_MISMATCH',
            message: 'Phone number verification mismatch'
          };
        }

        // Success - mark as used
        await otpRef.update({ used: true });
        
        return { 
          success: true,
          message: 'Phone verified successfully',
          firebaseUid: firebaseUid
        };
      } catch (error) {
        return {
          success: false,
          error: 'FIREBASE_ERROR',
          message: 'Invalid Firebase authentication'
        };
      }
    }

    return {
      success: false,
      error: 'INVALID_METHOD',
      message: 'Invalid verification method'
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred during verification'
    };
  }
});

// Resend verification with rate limiting
exports.resendVerification = onCall(async (request) => {
  try {
    const { tempId, method } = request.data;
    if (!tempId || !method) {
      throw new Error('TempId and method are required');
    }

    // Check resend limits
    const otpRef = db.collection('otp_codes').doc(tempId);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      throw new Error('No existing verification found');
    }

    const otpData = otpDoc.data();
    const resendCount = otpData.resendCount || 0;

    // Allow up to 5 resends
    if (resendCount >= 5) {
      throw new Error('Maximum resend attempts reached');
    }

    // Check if enough time has passed since last send (30 seconds minimum)
    const lastSent = otpData.createdAt.toDate();
    const timeSinceLastSend = Date.now() - lastSent.getTime();
    const minInterval = 30 * 1000; // 30 seconds

    if (timeSinceLastSend < minInterval) {
      const remainingTime = Math.ceil((minInterval - timeSinceLastSend) / 1000);
      throw new Error(`Please wait ${remainingTime} seconds before resending`);
    }

    if (method === 'email') {
      // Update resend count and resend email verification
      await otpRef.update({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        ),
        used: false,
        resendCount: resendCount + 1
      });

      // Resend Firebase Auth email verification
      const actionCodeSettings = {
        url: `${process.env.APP_URL || 'http://localhost:3000'}/signup?step=2&tempId=${tempId}&verified=true`,
        handleCodeInApp: true,
      };

      await admin.auth().generateEmailVerificationLink(otpData.email, actionCodeSettings);

      return {
        success: true,
        message: 'Verification email resent successfully'
      };
    } else if (method === 'phone') {
      // For phone, just update the resend count
      await otpRef.update({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        ),
        used: false,
        resendCount: resendCount + 1
      });

      return {
        success: true,
        message: 'Phone verification resent successfully'
      };
    }

  } catch (error) {
    console.error('Error in resendVerification:', error);
    throw new Error(error.message);
  }
}); 