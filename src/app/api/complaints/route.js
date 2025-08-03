import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET - Fetch all complaints
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const complaintsCollection = adminDb.collection('complaints');
    const snapshot = await complaintsCollection.orderBy('dateFiled', 'desc').get();
    
    const complaints = [];
    snapshot.forEach((doc) => {
      complaints.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

// POST - Create a new complaint
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.respondent || !body.complainant || !body.dateFiled || !body.officer || !body.status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate complaint ID
    const complaintsCollection = adminDb.collection('complaints');
    const countSnapshot = await complaintsCollection.count().get();
    const complaintCount = countSnapshot.data().count;
    const complaintId = `CMP-${String(complaintCount + 1).padStart(3, '0')}`;

    const complaintData = {
      complaintId,
      type: body.type,
      respondent: body.respondent,
      respondentAddress: body.respondentAddress || '',
      complainant: body.complainant,
      complainantAddress: body.complainantAddress || '',
      dateFiled: body.dateFiled,
      officer: body.officer,
      status: body.status,
      resolutionDate: body.resolutionDate || '',
      nature: body.nature || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await complaintsCollection.add(complaintData);
    
    return NextResponse.json({ 
      id: docRef.id, 
      complaintId,
      ...complaintData 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}

// PUT - Update an existing complaint
export async function PUT(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const complaintRef = adminDb.collection('complaints').doc(body.id);
    const complaintDoc = await complaintRef.get();

    if (!complaintDoc.exists) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const updateData = {
      type: body.type,
      respondent: body.respondent,
      respondentAddress: body.respondentAddress || '',
      complainant: body.complainant,
      complainantAddress: body.complainantAddress || '',
      dateFiled: body.dateFiled,
      officer: body.officer,
      status: body.status,
      resolutionDate: body.resolutionDate || '',
      nature: body.nature || '',
      updatedAt: new Date().toISOString()
    };

    await complaintRef.update(updateData);
    
    return NextResponse.json({ 
      id: body.id,
      ...updateData 
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}

// DELETE - Delete a complaint
// export async function DELETE(request) {
//   try {
//     if (!adminDb) {
//       return NextResponse.json({ error: 'Database not available' }, { status: 503 });
//     }

//     const { searchParams } = new URL(request.url);
//     const complaintId = searchParams.get('id');

//     if (!complaintId) {
//       return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
//     }

//     const complaintRef = adminDb.collection('complaints').doc(complaintId);
//     const complaintDoc = await complaintRef.get();

//     if (!complaintDoc.exists) {
//       return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
//     }

//     await complaintRef.delete();
    
//     return NextResponse.json({ message: 'Complaint deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting complaint:', error);
//     return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 });
//   }
// } 