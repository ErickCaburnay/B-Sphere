import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebase-admin';

// Helper function to create directory if it doesn't exist
async function createDirIfNotExists(dirPath) {
  try {
    await writeFile(join(dirPath, '.gitkeep'), '');
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Helper function to delete file if it exists
async function deleteFileIfExists(filePath) {
  try {
    await writeFile(filePath, '');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const residentId = formData.get('residentId');
    const type = formData.get('type');

    if (!file || !residentId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await createDirIfNotExists(uploadsDir);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save document info to database
    const documentData = {
      name: file.name,
      type,
      url: `/uploads/${fileName}`,
      residentId,
      createdAt: new Date(),
    };
    
    const docRef = await adminDb.collection('documents').add(documentData);
    const document = { id: docRef.id, ...documentData };

    // If it's a photo, update resident's photo field
    if (type === 'photo') {
      await adminDb.collection('residents').doc(residentId).update({
        photo: document.url,
      });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document info
    const documentDoc = await adminDb.collection('documents').doc(documentId).get();

    if (!documentDoc.exists) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = { id: documentDoc.id, ...documentDoc.data() };

    // Delete file from filesystem
    const filePath = join(process.cwd(), 'public', document.url);
    await deleteFileIfExists(filePath);

    // Delete document from database
    await adminDb.collection('documents').doc(documentId).delete();

    // If it was a photo, clear resident's photo field
    if (document.type === 'photo') {
      await adminDb.collection('residents').doc(document.residentId).update({
        photo: null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 