// Firebase Admin SDK configuration for server-side operations
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Helper function to safely get and format private key
function getPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    return null;
  }
  
  // Handle different private key formats
  try {
    // If it's a JSON string, parse it
    if (privateKey.startsWith('{')) {
      const parsed = JSON.parse(privateKey);
      return parsed.private_key || parsed.privateKey || privateKey;
    }
    
    // Handle escaped newlines
    return privateKey.replace(/\\n/g, '\n');
  } catch (error) {
    // If parsing fails, try to use as-is with newline replacement
    return privateKey.replace(/\\n/g, '\n');
  }
}

// Function to check if we're in a build environment
function isBuildTime() {
  return (
    process.env.NODE_ENV === 'production' &&
    !process.env.VERCEL &&
    !process.env.RAILWAY &&
    !process.env.NETLIFY &&
    !process.env.AWS_LAMBDA_FUNCTION_NAME &&
    !process.env.GOOGLE_CLOUD_PROJECT
  ) || process.env.NEXT_PHASE === 'phase-production-build';
}

// Function to initialize Firebase Admin
export function initAdmin() {
  // Completely skip initialization during build time
  if (isBuildTime()) {
    console.log('Skipping Firebase Admin initialization during build phase');
    return null;
  }

  // Validate environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin SDK environment variables are not properly configured');
    return null;
  }

  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    };

    // Initialize Firebase Admin (avoid multiple initialization)
    if (getApps().length === 0) {
      return initializeApp(firebaseAdminConfig);
    } else {
      return getApps()[0];
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}

// Lazy initialization - only initialize when first accessed
let app = null;
let adminDbInstance = null;
let adminAuthInstance = null;
let adminStorageInstance = null;

function getApp() {
  if (app === null) {
    app = initAdmin();
  }
  return app;
}

// Export services with lazy initialization
export const adminDb = new Proxy({}, {
  get(target, prop) {
    if (isBuildTime()) {
      return null;
    }
    
    if (adminDbInstance === null) {
      const appInstance = getApp();
      adminDbInstance = appInstance ? getFirestore(appInstance) : null;
    }
    
    if (adminDbInstance && prop in adminDbInstance) {
      const value = adminDbInstance[prop];
      return typeof value === 'function' ? value.bind(adminDbInstance) : value;
    }
    
    return undefined;
  }
});

export const adminAuth = new Proxy({}, {
  get(target, prop) {
    if (isBuildTime()) {
      return null;
    }
    
    if (adminAuthInstance === null) {
      const appInstance = getApp();
      adminAuthInstance = appInstance ? getAuth(appInstance) : null;
    }
    
    if (adminAuthInstance && prop in adminAuthInstance) {
      const value = adminAuthInstance[prop];
      return typeof value === 'function' ? value.bind(adminAuthInstance) : value;
    }
    
    return undefined;
  }
});

export const adminStorage = new Proxy({}, {
  get(target, prop) {
    if (isBuildTime()) {
      return null;
    }
    
    if (adminStorageInstance === null) {
      const appInstance = getApp();
      adminStorageInstance = appInstance ? getStorage(appInstance) : null;
    }
    
    if (adminStorageInstance && prop in adminStorageInstance) {
      const value = adminStorageInstance[prop];
      return typeof value === 'function' ? value.bind(adminStorageInstance) : value;
    }
    
    return undefined;
  }
});

export default getApp(); 