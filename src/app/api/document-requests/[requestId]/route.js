import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/server-utils';

export async function GET(request, { params }) {
  try {
    const { requestId } = params;
    console.log('Document requests API - GET request for ID:', requestId);
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Document requests API - No valid auth header, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const isValid = await verifyToken(token);
    console.log('Document requests API - Token validation result:', isValid);
    
    if (!isValid) {
      console.log('Document requests API - Invalid token, returning 401');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const docRef = adminDb.collection('document_requests').doc(requestId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: doc.id, ...doc.data() } 
    });

  } catch (error) {
    console.error('Document requests API - GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { requestId } = params;
    console.log('Document requests API - PUT request for ID:', requestId);
    console.log('Document requests API - Request URL:', request.url);
    console.log('Document requests API - Request method:', request.method);
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Document requests API - No valid auth header, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const isValid = await verifyToken(token);
    console.log('Document requests API - Token validation result:', isValid);
    
    if (!isValid) {
      console.log('Document requests API - Invalid token, returning 401');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Document requests API - Update data:', body);

    // Validate required fields
    if (!body.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Allowed status values
    const allowedStatuses = ['PENDING', 'APPROVED', 'REJECT'];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const docRef = adminDb.collection('document_requests').doc(requestId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      status: body.status,
      updatedAt: new Date()
    };

    // Add purpose if provided
    if (body.purpose) {
      updateData.purpose = body.purpose;
    }

    // Add issued date if status is APPROVED
    if (body.status === 'APPROVED') {
      updateData.issuedAt = new Date();
    }

    console.log('Document requests API - Updating document with:', updateData);

    // Update the document
    await docRef.update(updateData);

    // Get the updated document
    const updatedDoc = await docRef.get();

    return NextResponse.json({ 
      success: true, 
      data: { id: updatedDoc.id, ...updatedDoc.data() },
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Document requests API - PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { requestId } = params;
    console.log('Document requests API - DELETE request for ID:', requestId);
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Document requests API - No valid auth header, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const isValid = await verifyToken(token);
    console.log('Document requests API - Token validation result:', isValid);
    
    if (!isValid) {
      console.log('Document requests API - Invalid token, returning 401');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const docRef = adminDb.collection('document_requests').doc(requestId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ 
      success: true, 
      message: 'Document deleted successfully' 
    });

  } catch (error) {
    console.error('Document requests API - DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 