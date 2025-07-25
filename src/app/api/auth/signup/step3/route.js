import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

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
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      return null;
    }
  }
  
  const app = getApps()[0];
  return {
    db: getFirestore(app),
    storage: getStorage(app)
  };
}

// Upload file to Firebase Storage
async function uploadFile(storage, file, uniqueId) {
  const bucket = storage.bucket();
  const fileName = `residents/${uniqueId}/uploads/${Date.now()}_${file.name}`;
  const fileBuffer = Buffer.from(file.data, 'base64');
  
  const fileUpload = bucket.file(fileName);
  await fileUpload.save(fileBuffer, {
    metadata: {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    }
  });

  // Get download URL
  const [url] = await fileUpload.getSignedUrl({
    action: 'read',
    expires: '03-01-2500' // Far future expiration
  });

  return {
    fileName: fileName,
    originalName: file.name,
    downloadURL: url,
    uploadedAt: new Date().toISOString(),
    fileSize: fileBuffer.length
  };
}

// Create admin notification
async function createAdminNotification(db, residentData) {
  try {
    await db.collection('notifications').add({
      type: 'resident_registration',
      title: `New resident registration: ${residentData.firstName} ${residentData.lastName}`,
      message: `New resident registration for approval. Please review the submitted information and documents.`,
      targetRole: 'admin',
      residentId: residentData.uniqueId,
      dataId: residentData.uniqueId,
      priority: 'high',
      redirectTarget: 'page',
      status: 'unread',
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't fail the registration if notification fails
  }
}

export async function POST(request) {
  try {
    const { db, storage } = getFirebaseAdmin();
    if (!db || !storage) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { 
      uniqueId, 
      firebaseUid,
      // Personal information fields
      suffix, birthplace, address, citizenship, maritalStatus, gender, voterStatus,
      employmentStatus, educationalAttainment, occupation,
      // Files
      uploadedFiles = []
    } = body;

    if (!uniqueId || !firebaseUid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate required fields
    if (!address?.trim()) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    if (!gender?.trim()) {
      return NextResponse.json({ error: 'Gender is required' }, { status: 400 });
    }
    if (!citizenship?.trim()) {
      return NextResponse.json({ error: 'Citizenship is required' }, { status: 400 });
    }
    if (!voterStatus?.trim()) {
      return NextResponse.json({ error: 'Voter status is required' }, { status: 400 });
    }
    if (!maritalStatus?.trim()) {
      return NextResponse.json({ error: 'Marital status is required' }, { status: 400 });
    }

    // Get existing resident data
    const residentDoc = await db.collection('residents').doc(uniqueId).get();
    if (!residentDoc.exists) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
    }

    const existingData = residentDoc.data();

    // Upload files if any
    const processedFiles = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        // Validate file size (5MB limit)
        const fileSize = Buffer.from(file.data, 'base64').length;
        if (fileSize > 5 * 1024 * 1024) {
          return NextResponse.json({ 
            error: `File ${file.name} is too large. Maximum size is 5MB.` 
          }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json({ 
            error: `File type ${file.type} is not allowed.` 
          }, { status: 400 });
        }

        try {
          const uploadedFile = await uploadFile(storage, file, uniqueId);
          processedFiles.push(uploadedFile);
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return NextResponse.json({ 
            error: `Failed to upload file ${file.name}` 
          }, { status: 500 });
        }
      }
    }

    // Prepare updated resident data (UPPERCASE except email)
    const updatedData = {
      suffix: suffix ? suffix.trim().toUpperCase() : null,
      birthplace: birthplace ? birthplace.trim().toUpperCase() : null,
      address: address.trim().toUpperCase(),
      citizenship: citizenship.trim().toUpperCase(),
      maritalStatus: maritalStatus.trim(),
      gender: gender.trim(),
      voterStatus: voterStatus.trim(),
      employmentStatus: employmentStatus ? employmentStatus.trim() : null,
      educationalAttainment: educationalAttainment ? educationalAttainment.trim() : null,
      occupation: occupation ? occupation.trim().toUpperCase() : null,
      uploadedFiles: processedFiles,
      accountStatus: 'for_verification',
      isProfileComplete: true,
      step: 3,
      updatedAt: Timestamp.now()
    };

    // Update resident document
    await db.collection('residents').doc(uniqueId).update(updatedData);

    // Get complete resident data for notification
    const completeResidentData = {
      ...existingData,
      ...updatedData
    };

    // Create admin notification
    await createAdminNotification(db, completeResidentData);

    return NextResponse.json(
      { 
        message: 'Registration completed successfully! Your account is pending admin verification.',
        uniqueId: uniqueId,
        firebaseUid: firebaseUid,
        uploadedFilesCount: processedFiles.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Step 3 error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 