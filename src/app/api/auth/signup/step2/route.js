import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { generateNextResidentId } from '@/lib/server-utils';

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

// Generate a simple 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email (simulation for now - replace with actual email service)
async function sendEmailOTP(email, otp) {
  // For development, we'll just log the OTP
  // In production, integrate with SendGrid, Nodemailer, or other email service
  console.log(`\n=== EMAIL OTP FOR DEVELOPMENT ===`);
  console.log(`Email: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`=================================\n`);

  // TODO: Replace with actual email sending service
  // Example with Nodemailer:
  /*
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${otp}`
  });
  */
  
  return true;
}

export async function POST(request) {
  try {
    const { db, auth } = getFirebaseAdmin();
    if (!db || !auth) {
      console.error('Firebase Admin initialization failed');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { action, tempId, otp, email, phoneFirebaseUid } = body;

    if (action === 'send_email_otp') {
      // Send OTP via email
      if (!tempId || !email) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      try {
        // Generate OTP
        const otpCode = generateOTP();
        
        // Store OTP in Firestore
        await db.collection('email_otps').doc(tempId).set({
          email: email,
          otp: otpCode,
          createdAt: Timestamp.now(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)), // 10 minutes
          used: false,
          attempts: 0
        });

        // Send email (currently just logs for development)
        await sendEmailOTP(email, otpCode);

          return NextResponse.json({ 
          message: 'OTP sent to your email successfully',
          success: true
        }, { status: 200 });

      } catch (error) {
        console.error('Error sending email OTP:', error);
        return NextResponse.json({ error: 'Failed to send email OTP' }, { status: 500 });
      }
    }

    else if (action === 'verify_email_otp') {
      // Verify email OTP
      if (!tempId || !otp) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      try {
        const otpDoc = await db.collection('email_otps').doc(tempId).get();
        
        if (!otpDoc.exists) {
          return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        const otpData = otpDoc.data();
        
        // Check if expired
        if (Timestamp.now().seconds > otpData.expiresAt.seconds) {
          await db.collection('email_otps').doc(tempId).delete();
          return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // Check if already used
        if (otpData.used) {
          return NextResponse.json({ error: 'OTP already used' }, { status: 400 });
        }

        // Check attempts
        if (otpData.attempts >= 3) {
          await db.collection('email_otps').doc(tempId).delete();
          return NextResponse.json({ error: 'Too many failed attempts' }, { status: 400 });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
          await db.collection('email_otps').doc(tempId).update({
            attempts: otpData.attempts + 1
          });
          return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
        }

        // Mark as used
        await db.collection('email_otps').doc(tempId).update({ used: true });

        // Get temp resident data and create final resident record
        const tempDoc = await db.collection('temp_residents').doc(tempId).get();
        if (!tempDoc.exists) {
          return NextResponse.json({ error: 'Registration data not found' }, { status: 404 });
        }

        const tempData = tempDoc.data();
        const uniqueId = await generateNextResidentId(db);
        
        // Create Firebase Auth user
          const userRecord = await auth.createUser({
            email: tempData.email,
            password: tempData.password,
            displayName: `${tempData.firstName} ${tempData.lastName}`,
          emailVerified: true,
          disabled: false
        });

        // Create resident record
        const residentData = {
          uniqueId: uniqueId,
          firebaseUid: userRecord.uid,
          firstName: tempData.firstName,
          lastName: tempData.lastName,
          middleName: tempData.middleName,
          email: tempData.email,
          contactNumber: tempData.contactNumber,
          birthdate: tempData.birthdate,
          identityKey: tempData.identityKey,
          fullNameKey: tempData.fullNameKey,
          suffix: null,
          birthplace: null,
          address: null,
          citizenship: null,
          maritalStatus: null,
          gender: null,
          voterStatus: null,
          employmentStatus: null,
          educationalAttainment: null,
          occupation: null,
          isTUPAD: false,
          isPWD: false,
          is4Ps: false,
          isSoloParent: false,
          role: 'resident',
          accountStatus: 'pending_verification',
          step: 2,
          uploadedFiles: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await db.collection('residents').doc(uniqueId).set(residentData);

        // Clean up
        await db.collection('temp_residents').doc(tempId).delete();
        await db.collection('email_otps').doc(tempId).delete();

        return NextResponse.json({
          message: 'Email verification completed successfully',
            uniqueId: uniqueId,
            firebaseUid: userRecord.uid,
            nextStep: 3
        }, { status: 200 });

      } catch (error) {
        console.error('Email OTP verification error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
      }
    }

    else if (action === 'verify_phone') {
      // Verify phone using Firebase Auth UID
      if (!tempId || !phoneFirebaseUid) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      try {
        // Verify Firebase user exists
        const userRecord = await auth.getUser(phoneFirebaseUid);
        
        // Get temp resident data
        const tempDoc = await db.collection('temp_residents').doc(tempId).get();
        if (!tempDoc.exists) {
          return NextResponse.json({ error: 'Registration data not found' }, { status: 404 });
        }

        const tempData = tempDoc.data();
        const uniqueId = await generateNextResidentId(db);

        // Update Firebase user with email and password
        await auth.updateUser(phoneFirebaseUid, {
          email: tempData.email,
          password: tempData.password,
          displayName: `${tempData.firstName} ${tempData.lastName}`,
          disabled: false
        });

        // Create resident record
        const residentData = {
          uniqueId: uniqueId,
          firebaseUid: phoneFirebaseUid,
          firstName: tempData.firstName,
          lastName: tempData.lastName,
          middleName: tempData.middleName,
          email: tempData.email,
          contactNumber: tempData.contactNumber,
          birthdate: tempData.birthdate,
          identityKey: tempData.identityKey,
          fullNameKey: tempData.fullNameKey,
          suffix: null,
          birthplace: null,
          address: null,
          citizenship: null,
          maritalStatus: null,
          gender: null,
          voterStatus: null,
          employmentStatus: null,
          educationalAttainment: null,
          occupation: null,
          isTUPAD: false,
          isPWD: false,
          is4Ps: false,
          isSoloParent: false,
          role: 'resident',
          accountStatus: 'pending_verification',
          step: 2,
          uploadedFiles: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await db.collection('residents').doc(uniqueId).set(residentData);

        // Clean up
        await db.collection('temp_residents').doc(tempId).delete();

        return NextResponse.json({ 
          message: 'Phone verification completed successfully',
          uniqueId: uniqueId,
          firebaseUid: phoneFirebaseUid,
          nextStep: 3
        }, { status: 200 });

      } catch (error) {
        console.error('Phone verification error:', error);
        return NextResponse.json({ error: 'Phone verification failed' }, { status: 500 });
      }
    }

    else if (action === 'create_account_direct') {
      // Create account directly after client-side OTP verification
      const { email, contactNumber, firstName, lastName, middleName, birthdate, password } = body;
      
      if (!email || !contactNumber || !firstName || !lastName || !password) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      try {
        const uniqueId = await generateNextResidentId(db);
        
        // Create Firebase Auth user
        const userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: true, // Since we verified OTP
          disabled: false
        });

        // Create resident record
        const residentData = {
          uniqueId: uniqueId,
          firebaseUid: userRecord.uid,
          firstName: firstName,
          lastName: lastName,
          middleName: middleName || null,
          email: email,
          contactNumber: contactNumber,
          birthdate: birthdate,
          identityKey: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${birthdate}`,
          fullNameKey: `${firstName.toLowerCase()} ${middleName ? middleName.toLowerCase() + ' ' : ''}${lastName.toLowerCase()}`,
          suffix: null,
          birthplace: null,
          address: null,
          citizenship: null,
          maritalStatus: null,
          gender: null,
          voterStatus: null,
          employmentStatus: null,
          educationalAttainment: null,
          occupation: null,
          isTUPAD: false,
          isPWD: false,
          is4Ps: false,
          isSoloParent: false,
          role: 'resident',
          accountStatus: 'pending_verification',
          step: 2,
          uploadedFiles: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await db.collection('residents').doc(uniqueId).set(residentData);

        console.log('✅ Resident account created directly:', uniqueId);

        return NextResponse.json({
          message: 'Account created successfully',
          uniqueId: uniqueId,
          firebaseUid: userRecord.uid,
          nextStep: 3
        }, { status: 200 });

      } catch (error) {
        console.error('Direct account creation error:', error);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }
    }

    else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Step 2 error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 