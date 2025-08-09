import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

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
  return { db: getFirestore(app) };
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let transporter = null;
function getTransporter() {
  if (!transporter) {
    if (process.env.SENDGRID_API_KEY) {
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false }
      });
    }
  }
  return transporter;
}

function createEmailTemplate(otp) {
  return {
    html: `
      <div style="max-width:600px;margin:0 auto;padding:16px;font-family:Arial,sans-serif">
        <h2 style="color:#16a34a">Your Admin Verification Code</h2>
        <p>Use the code below to verify your admin registration (expires in 5 minutes):</p>
        <div style="font-size:28px;font-weight:bold;letter-spacing:4px;margin:16px 0;color:#111">${otp}</div>
        <p style="font-size:12px;color:#666">If you didn't request this, you can ignore this email.</p>
      </div>`,
    text: `Your admin verification code: ${otp}. Expires in 5 minutes.`
  };
}

export async function POST(request) {
  try {
    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { action } = body || {};

    if (action === 'send_email_otp') {
      const { tempId, email } = body;
      if (!tempId || !email) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      if (!process.env.SENDGRID_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
        return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
      }

      const otpCode = generateOTP();
      await db.collection('email_otps').doc(tempId).set({
        email,
        otp: otpCode,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
        used: false,
        attempts: 0,
        scope: 'admin_signup'
      });

      const t = getTransporter();
      const senderEmail = process.env.SENDGRID_API_KEY ? 'bsphere2025@outlook.com' : process.env.EMAIL_USER;
      const { html, text } = createEmailTemplate(otpCode);
      await t.sendMail({
        from: { name: 'B-Sphere', address: senderEmail },
        to: email,
        subject: 'Admin Verification Code',
        html,
        text,
      });

      return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    }

    if (action === 'verify_email_otp') {
      const { tempId, otp } = body;
      if (!tempId || !otp) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const doc = await db.collection('email_otps').doc(tempId).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
      }

      const data = doc.data();
      if (Timestamp.now().seconds > data.expiresAt.seconds) {
        await db.collection('email_otps').doc(tempId).delete();
        return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
      }

      if (data.used) {
        return NextResponse.json({ error: 'OTP already used' }, { status: 400 });
      }

      if (data.attempts >= 5) {
        await db.collection('email_otps').doc(tempId).delete();
        return NextResponse.json({ error: 'Too many failed attempts' }, { status: 400 });
      }

      if (String(data.otp) !== String(otp)) {
        await db.collection('email_otps').doc(tempId).update({ attempts: (data.attempts || 0) + 1 });
        return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
      }

      await db.collection('email_otps').doc(tempId).update({ used: true, verifiedAt: Timestamp.now() });
      return NextResponse.json({ success: true, message: 'OTP verified' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 