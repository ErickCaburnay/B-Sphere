import { NextResponse } from 'next/server';
import { generateDocument } from '@/lib/document-generator';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/utils';

export async function POST(request, { params }) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const isValid = await verifyToken(token);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { requestId } = params;
    
    // Get the document request from Firestore
    const docRef = await adminDb.collection('document_requests').doc(requestId).get();
    
    if (!docRef.exists) {
      return NextResponse.json(
        { error: 'Document request not found' },
        { status: 404 }
      );
    }

    const requestData = docRef.data();

    // Generate the document using the document type from the request
    const documentBuffer = await generateDocument(requestData.documentType, {
      ...requestData,
      controlId: requestId, // Use the document ID as the control number
      requestedAt: requestData.requestedAt,
    });

    // Return the document as a downloadable file with the correct document type in the filename
    const filePrefix = requestData.documentType.toLowerCase().replace(/\s+/g, '_');
    return new NextResponse(documentBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=${filePrefix}_${requestId}.docx`,
      },
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate document' },
      { status: 500 }
    );
  }
} 