import { NextResponse } from 'next/server';
import { generateDocument } from '@/lib/document-generator';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received preview request with data:', data); // Debug log

    // Use the actual control ID from the saved document
    if (!data.controlId) {
      throw new Error('Control ID is required for preview');
    }

    // Generate the document with preview watermark
    const documentBuffer = await generateDocument('barangay_certificate_template.docx', {
      ...data,
      isPreview: true,
      requestedAt: new Date().toISOString(),
    });

    console.log('Generated preview document buffer size:', documentBuffer.length); // Debug log

    // Return the document as a downloadable file
    return new NextResponse(documentBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `inline; filename=preview_barangay_certificate.docx`,
      },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview' },
      { status: 500 }
    );
  }
} 