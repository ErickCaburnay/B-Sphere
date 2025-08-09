// Simple test to verify email sending
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');

const transporter = nodemailer.createTransport({
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

async function testEmail() {
  try {
    const testOTP = '123456';
    const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Test OTP - B-Sphere',
      text: `Test OTP: ${testOTP}`,
      html: `<h2>Test OTP: <b>${testOTP}</b></h2>`
    };

    console.log('Sending test email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!', result.messageId);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
}

testEmail(); 