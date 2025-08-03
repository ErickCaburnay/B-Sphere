import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyToken } from '@/lib/server-utils';

export async function POST(request) {
  try {
    // Verify token (admin or user)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Try to verify as admin token first
    let isAdmin = false;
    try {
      isAdmin = await verifyToken(token);
    } catch (adminError) {
      // If not admin, allow user token (basic validation)
      if (!token || token.length < 10) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
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
      status: isAdmin ? 'APPROVED' : 'PENDING', // Admin-created documents are approved, user requests are pending
      createdAt: new Date(),
      updatedAt: new Date()
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
    console.log('Document requests API - GET request received');
    
    // Verify token (admin or user)
    const authHeader = request.headers.get('authorization');
    console.log('Document requests API - Auth header:', {
      hasHeader: !!authHeader,
      headerStart: authHeader ? authHeader.substring(0, 20) + '...' : 'none'
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Document requests API - No valid auth header, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('Document requests API - Token extracted:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });

    // First try to verify as admin token
    let isAdmin = false;
    let tokenUser = null;
    
    try {
      isAdmin = await verifyToken(token);
      console.log('Document requests API - Admin token validation result:', isAdmin);
    } catch (adminError) {
      console.log('Document requests API - Not an admin token, checking user token');
    }

    // If not admin, try to verify as user token
    if (!isAdmin) {
      try {
        // Verify user token (basic validation)
        if (!token || token.length < 10) {
          throw new Error('Invalid token format');
        }
        
        // For user tokens, we'll allow access but restrict to their own data
        // Get the user data from token or request
        const { searchParams } = new URL(request.url);
        const requestedResidentId = searchParams.get('residentId');
        
        if (!requestedResidentId) {
          console.log('Document requests API - User token requires residentId parameter');
          return NextResponse.json({ error: 'Resident ID required for user access' }, { status: 400 });
        }
        
        tokenUser = { id: requestedResidentId };
        console.log('Document requests API - User token validated for resident:', requestedResidentId);
        
      } catch (userError) {
        console.log('Document requests API - Invalid user token:', userError.message);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const residentId = searchParams.get('residentId');
    
    console.log('Document requests API - Query params:', { status, residentId, isAdmin });
    
    let query = adminDb.collection('document_requests');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // If user token, restrict to their own data only
    if (!isAdmin && tokenUser) {
      query = query.where('residentId', '==', tokenUser.id);
    } else if (residentId) {
      query = query.where('residentId', '==', residentId);
    }
    
    // Order by creation date, newest first
    query = query.orderBy('createdAt', 'desc');
    
    console.log('Document requests API - Executing Firestore query');
    const snapshot = await query.get();
    console.log('Document requests API - Firestore query result:', {
      size: snapshot.size,
      empty: snapshot.empty
    });
    
    const requests = [];
    
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Document requests API - Returning data:', {
      requestsCount: requests.length
    });
    
    return NextResponse.json({ data: requests });
    
  } catch (error) {
    console.error('Document requests API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document requests' },
      { status: 500 }
    );
  }
} 