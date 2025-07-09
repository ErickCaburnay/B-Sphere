import { NextResponse } from 'next/server';
import { generateDocument } from '@/lib/document-generator';

export async function POST(request, { params }) {
  try {
    const { requestId } = params;
    const data = await request.json();

    // Generate the document with preview watermark
    const documentBuffer = await generateDocument('barangay_certificate.docx', {
      ...data,
      isPreview: true, // Add preview flag
      requestId,
      requestedAt: new Date().toLocaleDateString(),
    });

    // Return the document as a downloadable file
    return new NextResponse(documentBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `inline; filename=preview_barangay_certificate_${requestId}.docx`,
      },
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
} 