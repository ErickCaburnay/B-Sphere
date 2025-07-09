import { NextResponse } from "next/server";
import { adminDb } from '@/lib/firebase-admin';

// Document type prefix mapping
const DOCUMENT_PREFIXES = {
  'Barangay Certificate': 'CRT',
  'Barangay Clearance': 'CLR',
  'Barangay Indigency': 'IND',
  'Barangay ID': 'BID',
  'Business Permit': 'BBP'
};

// Function to verify Firebase connection
async function verifyFirebaseConnection() {
  try {
    const testRef = adminDb.collection('_test_connection').doc('test');
    await testRef.set({ timestamp: new Date() });
    await testRef.delete();
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
}

// Function to generate unique document ID
async function generateControlId(documentType) {
  const prefix = DOCUMENT_PREFIXES[documentType];
  if (!prefix) {
    throw new Error(`Invalid document type: ${documentType}`);
  }

  const counterRef = adminDb.collection('counters').doc(documentType);
  
  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let currentCount = 0;

      if (counterDoc.exists) {
        currentCount = counterDoc.data().count || 0;
      }
      
      const newCount = currentCount + 1;
      
      // Format: PREFIX-0000-0000
      const formattedId = `${prefix}-${String(Math.floor((newCount - 1) / 10000)).padStart(4, '0')}-${String((newCount - 1) % 10000 + 1).padStart(4, '0')}`;
      
      // Update the counter
      transaction.set(counterRef, { 
        count: newCount,
        lastUpdated: new Date(),
        documentType: documentType,
        lastGeneratedId: formattedId
      });
      
      return formattedId;
    });

    return result;
  } catch (error) {
    console.error('Error generating control ID:', error);
    throw new Error(`Failed to generate control ID: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin is not initialized');
    }

    const data = await request.json();
    const { documentType, residentId, fullName, purpose } = data;

    if (!documentType || !residentId || !fullName || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate control ID
    const controlId = await generateControlId(documentType);

    // Create the document request
    const requestData = {
      controlId,
      documentType,
      residentId,
      fullName: fullName.toUpperCase(),
      purpose: purpose.toUpperCase(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
      notificationSent: false,
      attachmentUrl: null,
      remarks: '',
      ...data // Include any additional fields from the request
    };

    // Save to Firestore using the control ID as the document ID
    await adminDb.collection('document_requests').doc(controlId).set(requestData);
    
    // Verify the document was saved
    const savedDoc = await adminDb.collection('document_requests').doc(controlId).get();
    if (!savedDoc.exists) {
      throw new Error('Document failed to save');
    }

    return NextResponse.json({ 
      success: true, 
      requestId: controlId,
      data: requestData,
      message: 'Document request created successfully' 
    });

  } catch (error) {
    console.error('Error creating document request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create document request' },
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