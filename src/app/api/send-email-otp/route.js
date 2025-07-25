import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// 🚀 PERFORMANCE OPTIMIZATION: Singleton transporter with connection pooling
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    // If using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        pool: true, // 🚀 Enable connection pooling
        maxConnections: 5, // 🚀 Max concurrent connections
        maxMessages: 100, // 🚀 Max messages per connection
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      // Fallback to Outlook (if basic auth is enabled)
      transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        pool: true, // 🚀 Enable connection pooling
        maxConnections: 3,
        maxMessages: 50,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
  }
  return transporter;
};

// 🚀 PERFORMANCE OPTIMIZATION: Lightweight email template
const createEmailTemplate = (otp) => {
  return {
    html: `
<div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif">
  <div style="background:#667eea;padding:20px;border-radius:8px;text-align:center;margin-bottom:20px">
    <h1 style="color:white;margin:0;font-size:24px">Verification Code</h1>
  </div>
  <div style="text-align:center;margin:20px 0">
    <div style="background:#f8f9fa;padding:20px;border-radius:8px;display:inline-block">
      <div style="font-size:32px;font-weight:bold;color:#667eea;letter-spacing:4px">${otp}</div>
      <p style="color:#666;margin:10px 0 0;font-size:14px">Expires in 5 minutes</p>
    </div>
  </div>
  <p style="text-align:center;color:#666;font-size:14px">
    If you didn't request this code, ignore this email.<br>
    <strong>Barangay Information System</strong>
  </p>
</div>`,
    text: `Your verification code: ${otp}. Expires in 5 minutes.`
  };
};

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // 🚀 PERFORMANCE: Fast input validation
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }
    
    // 🚀 PERFORMANCE: Quick environment check
    if (!process.env.SENDGRID_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
    // 🚀 PERFORMANCE: Reuse singleton transporter
    const transporter = getTransporter();
    
    // 🚀 PERFORMANCE: Determine sender (cached)
    const senderEmail = process.env.SENDGRID_API_KEY 
      ? 'bsphere2025@outlook.com' 
      : process.env.EMAIL_USER;
    
    // 🚀 PERFORMANCE: Lightweight email template
    const emailTemplate = createEmailTemplate(otp);
    
    const mailOptions = {
      from: {
        name: 'Barangay System',
        address: senderEmail,
      },
      to: email,
      subject: 'Verification Code',
      ...emailTemplate
    };
    
    // 🚀 PERFORMANCE: Send email with connection pooling
    const sendStart = Date.now();
    await transporter.sendMail(mailOptions);
    const sendTime = Date.now() - sendStart;
    const totalTime = Date.now() - startTime;
    
    // 🚀 PERFORMANCE: Minimal logging (only in development)
    if (process.env.NODE_ENV === 'development') {
  
    }
    
    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        ...(process.env.NODE_ENV === 'development' && { 
          performance: { sendTime, totalTime } 
        })
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('📧 Email sending error:', error.message);
    
    // 🚀 PERFORMANCE: Fast error responses
    const errorMap = {
      'EAUTH': 'Email authentication failed. Please check credentials.',
      'ENOTFOUND': 'Email service connection failed.',
      'ETIMEDOUT': 'Email service timeout. Please try again.',
      'ECONNECTION': 'Connection to email service failed.'
    };
    
    const errorMessage = errorMap[error.code] || 'Failed to send email. Please try again.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 