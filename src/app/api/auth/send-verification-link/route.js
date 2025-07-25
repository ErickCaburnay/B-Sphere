import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

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
    auth: getAuth(app),
    db: getFirestore(app)
  };
}

// Email sending function
async function sendVerificationEmail(email, verificationLink) {
  // Reuse the transporter logic from send-email-otp
  let transporter;
  
  if (process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  const senderEmail = process.env.SENDGRID_API_KEY
    ? 'bsphere2025@outlook.com'
    : process.env.EMAIL_USER;

  const mailOptions = {
    from: {
      name: 'Barangay System',
      address: senderEmail,
    },
    to: email,
    subject: 'Complete Your Registration - Verify Your Account',
    html: `
      <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif">
        <div style="background:#667eea;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px">
          <h1 style="color:white;margin:0;font-size:24px">Complete Your Registration</h1>
        </div>
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0">
          <h2 style="color:#333;margin:0 0 15px">Welcome to Barangay Information System!</h2>
          <p style="color:#666;margin:0 0 20px">
            Thank you for registering! To complete your account setup and start using our services, 
            please click the button below to verify your email address.
          </p>
          <div style="text-align:center;margin:20px 0">
            <a href="${verificationLink}" 
               style="background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">
              Verify My Account
            </a>
          </div>
          <p style="color:#666;font-size:14px;margin:20px 0 0">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationLink}" style="color:#667eea;word-break:break-all">${verificationLink}</a>
          </p>
        </div>
        <p style="text-align:center;color:#666;font-size:14px">
          If you didn't create this account, you can safely ignore this email.<br>
          <strong>Barangay Information System</strong>
        </p>
      </div>`,
    text: `Complete Your Registration

Thank you for registering with Barangay Information System!

To complete your account setup, please click the following link to verify your email address:

${verificationLink}

If you didn't create this account, you can safely ignore this email.

Barangay Information System`
  };

  await transporter.sendMail(mailOptions);
  console.log('📧 Verification email sent to:', email);
}

export async function POST(request) {
  try {
    const { auth, db } = getFirebaseAdmin();
    if (!auth || !db) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { uniqueId, firebaseUid, method, email, phoneNumber } = body;

    if (!uniqueId || !firebaseUid || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the user from Firebase Auth
    const userRecord = await auth.getUser(firebaseUid);
    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let verificationLink;

    if (method === 'email') {
      // Generate email verification link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const continueUrl = `${baseUrl}/login?verified=true`;
      
      console.log('🔍 Debug URL:', { baseUrl, continueUrl, env: process.env.NEXT_PUBLIC_APP_URL });
      
      // Validate URL
      try {
        new URL(continueUrl);
      } catch (urlError) {
        console.error('❌ Invalid continue URL:', continueUrl);
        return NextResponse.json({ 
          error: 'Invalid app URL configuration. Please check NEXT_PUBLIC_APP_URL environment variable.' 
        }, { status: 500 });
      }
      
      const actionCodeSettings = {
        url: continueUrl,
        handleCodeInApp: false,
      };

      try {
        verificationLink = await auth.generateEmailVerificationLink(
          email, 
          actionCodeSettings
        );
      } catch (linkError) {
        console.error('❌ Firebase verification link error:', linkError);
        return NextResponse.json({ 
          error: 'Failed to generate verification link. Please check Firebase configuration.' 
        }, { status: 500 });
      }

      // Update resident status to indicate verification link sent
      await db.collection('residents').doc(uniqueId).update({
        accountStatus: 'verification_link_sent',
        verificationMethod: 'email',
        verificationLinkSentAt: new Date(),
        updatedAt: new Date()
      });

      console.log('📧 Email verification link generated for:', email);

    } else if (method === 'phone') {
      // For phone verification, we'll use Firebase's phone auth
      // Generate a custom verification link that includes phone verification
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-phone?uid=${firebaseUid}&phone=${encodeURIComponent(phoneNumber)}`,
        handleCodeInApp: false,
      };

      // For SMS, we can use a custom link or Firebase's built-in phone verification
      // Since Firebase doesn't have a direct "SMS verification link" like email,
      // we'll create a custom verification process
      verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-phone?uid=${firebaseUid}&phone=${encodeURIComponent(phoneNumber)}&token=${Buffer.from(`${firebaseUid}:${Date.now()}`).toString('base64')}`;

      // Update resident status
      await db.collection('residents').doc(uniqueId).update({
        accountStatus: 'verification_link_sent',
        verificationMethod: 'phone',
        verificationLinkSentAt: new Date(),
        updatedAt: new Date()
      });

      console.log('📱 Phone verification link generated for:', phoneNumber);
    }

    // Send verification link via email or SMS
    if (method === 'email') {
      await sendVerificationEmail(email, verificationLink);
    } else if (method === 'phone') {
      // For phone, we'll show the link in development
      // In production, you'd send via SMS service
      console.log('📱 Phone verification link:', verificationLink);
    }
    
    return NextResponse.json({
      message: `Verification link sent via ${method}`,
      ...(process.env.NODE_ENV === 'development' && { verificationLink })
    }, { status: 200 });

  } catch (error) {
    console.error('Send verification link error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification link. Please try again.' },
      { status: 500 }
    );
  }
} 