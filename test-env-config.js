require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(60));
console.log('ENVIRONMENT CONFIGURATION TEST');
console.log('='.repeat(60));

// Test Client-side Firebase Config
console.log('\n📱 CLIENT-SIDE FIREBASE CONFIG:');
console.log('✓ API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : '❌ MISSING');
console.log('✓ Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : '❌ MISSING');
console.log('✓ Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : '❌ MISSING');
console.log('✓ Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET' : '❌ MISSING');
console.log('✓ Messaging Sender ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET' : '❌ MISSING');
console.log('✓ App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET' : '❌ MISSING');
console.log('✓ Measurement ID:', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? 'SET' : '❌ MISSING');

// Test Server-side Firebase Admin Config
console.log('\n🔧 SERVER-SIDE FIREBASE ADMIN CONFIG:');
console.log('✓ Project ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : '❌ MISSING');
console.log('✓ Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : '❌ MISSING');
console.log('✓ Private Key:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : '❌ MISSING');

// Test JWT Secret
console.log('\n🔐 JWT CONFIGURATION:');
console.log('✓ JWT Secret:', process.env.JWT_SECRET ? 'SET' : '❌ MISSING');

// Validation checks
console.log('\n🔍 VALIDATION CHECKS:');

// Check if API key looks valid
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  const apiKeyValid = process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith('AIza');
  console.log('✓ API Key format:', apiKeyValid ? 'VALID' : '❌ INVALID (should start with "AIza")');
}

// Check if project IDs match
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID) {
  const projectIdsMatch = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === process.env.FIREBASE_PROJECT_ID;
  console.log('✓ Project IDs match:', projectIdsMatch ? 'YES' : '❌ NO (they should be the same)');
}

// Check if private key looks valid
if (process.env.FIREBASE_PRIVATE_KEY) {
  const privateKeyValid = process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY');
  console.log('✓ Private Key format:', privateKeyValid ? 'VALID' : '❌ INVALID (should contain "BEGIN PRIVATE KEY")');
}

// Check JWT secret length
if (process.env.JWT_SECRET) {
  const jwtSecretLength = process.env.JWT_SECRET.length;
  console.log('✓ JWT Secret length:', jwtSecretLength >= 32 ? `GOOD (${jwtSecretLength} chars)` : `❌ TOO SHORT (${jwtSecretLength} chars, should be 32+)`);
}

console.log('\n='.repeat(60));
console.log('If you see any ❌ above, fix those in your .env.local file');
console.log('='.repeat(60)); 