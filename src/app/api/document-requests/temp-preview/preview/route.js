import { NextResponse } from 'next/server';
import { generateDocument } from '@/lib/document-generator';
import { verifyToken } from '@/lib/server-utils';

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

    const { documentType, data } = await request.json();
    console.log('Received preview request:', { documentType, data }); // Debug log

    if (!documentType) {
      throw new Error('Document type is required');
    }

    // Generate the document
    const documentBuffer = await generateDocument(documentType, {
      ...data,
      isPreview: true,
      requestedAt: new Date().toISOString(),
    });

    if (!documentBuffer || !(documentBuffer instanceof Buffer)) {
      throw new Error('Invalid document buffer generated');
    }

    console.log('Generated preview document buffer size:', documentBuffer.length); // Debug log

    // Return the document as a downloadable file with proper content type
    return new NextResponse(documentBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=preview_${documentType.toLowerCase().replace(/\s+/g, '_')}.docx`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
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