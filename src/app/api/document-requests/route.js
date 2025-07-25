import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
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

    const data = await request.json();
    
    // Generate document ID based on type
    let documentId;
    try {
      const result = await adminDb.runTransaction(async (transaction) => {
        const counterRef = adminDb.collection('counters').doc(data.documentType);
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists ? counterDoc.data().count : 0;
        const newCount = currentCount + 1;
        
        // Update counter
        transaction.set(counterRef, { 
          count: newCount,
          lastUpdated: new Date(),
          documentType: data.documentType
        });

        // Format document ID based on type
        if (data.documentType === 'Business Permit') {
          const year = new Date().getFullYear();
          documentId = `BBP-${year}-${newCount.toString().padStart(4, '0')}`;
        } else {
          const prefix = data.documentType === 'Barangay Certificate' ? 'CRT' :
                        data.documentType === 'Barangay Clearance' ? 'CLR' :
                        data.documentType === 'Barangay Indigency' ? 'IND' : 'DOC';
          documentId = `${prefix}-${newCount.toString().padStart(6, '0')}`;
        }

        return { documentId, count: newCount };
      });

      documentId = result.documentId;
      
      // For business permits, also generate permit number
      if (data.documentType === 'Business Permit') {
        data.permitNo = `${Math.floor(result.count/1000).toString().padStart(4, '0')}-${(result.count % 1000).toString().padStart(3, '0')}`;
      }
    } catch (error) {
      console.error('Error generating document ID:', error);
      throw new Error('Failed to generate document ID');
    }

    // Save document request
    await adminDb.collection('document_requests').doc(documentId).set({
      ...data,
      status: 'APPROVED', // Admin-created documents are automatically approved
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Document request created successfully',
      requestId: documentId
    });
  } catch (error) {
    console.error('Error creating document request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create document request' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const residentId = searchParams.get('residentId');
    
    let query = adminDb.collection('document_requests');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (residentId) {
      query = query.where('residentId', '==', residentId);
    }
    
    // Order by creation date, newest first
    query = query.orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    const requests = [];
    
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return NextResponse.json({ data: requests });
    
  } catch (error) {
    console.error('Error fetching document requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document requests' },
      { status: 500 }
    );
  }
} 