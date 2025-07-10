import { NextResponse } from 'next/server';
import { initAdmin, adminStorage } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/utils';

// Initialize Firebase Admin if not already initialized
try {
  initAdmin();
} catch (e) {
  console.error('Failed to initialize Firebase Admin:', e);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folderPath = formData.get('folderPath');
    const uniqueId = formData.get('uniqueId');

    if (!file || !folderPath || !uniqueId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' },
        { status: 400 }
      );
    }

    // Get bucket name from environment variable
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return NextResponse.json(
        { error: 'Storage bucket not configured' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name}`;
    const storagePath = `${folderPath}/${uniqueId}/${fileName}`;

    // Upload file using admin SDK with explicit bucket name
    const bucket = adminStorage.bucket(bucketName);
    const fileRef = bucket.file(storagePath);

    // Create write stream
    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: file.type,
      },
      resumable: false, // For small files, non-resumable upload is faster
    });

    // Handle upload completion
    await new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });

      stream.on('finish', () => {
        resolve();
      });

      // Write the buffer to the stream
      stream.end(buffer);
    });

    // Get download URL with a far future expiration
    const [downloadURL] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: file.name,
      storagePath,
      downloadURL,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { storagePath } = body;

    if (!storagePath) {
      return NextResponse.json(
        { error: 'Storage path is required' },
        { status: 400 }
      );
    }

    // Get bucket name from environment variable
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return NextResponse.json(
        { error: 'Storage bucket not configured' },
        { status: 500 }
      );
    }

    // Delete file using admin SDK with explicit bucket name
    const bucket = adminStorage.bucket(bucketName);
    await bucket.file(storagePath).delete();

    return NextResponse.json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file: ' + error.message },
      { status: 500 }
    );
  }
} 