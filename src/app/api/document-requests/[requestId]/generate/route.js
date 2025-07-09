import { NextResponse } from 'next/server';
import { generateDocument } from '@/lib/document-generator';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request, { params }) {
  try {
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

    // Generate the document
    const documentBuffer = await generateDocument('barangay_certificate_template.docx', {
      ...requestData,
      controlId: requestId, // Use the document ID as the control number
      requestedAt: requestData.requestedAt,
    });

    // Return the document as a downloadable file
    return new NextResponse(documentBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=barangay_certificate_${requestId}.docx`,
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