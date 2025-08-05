import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// This endpoint should be called by a cron job or scheduled task
export async function POST(request) {
  try {
    const now = new Date();
    
    // Auto-publish announcements
    const publishQuery = adminDb.collection('announcements')
      .where('status', '==', 'draft')
      .where('autoPublishDate', '<=', now)
      .where('autoPublishDate', '!=', null);
    
    const publishSnapshot = await publishQuery.get();
    const publishPromises = publishSnapshot.docs.map(docRef => 
      docRef.ref.update({ 
        status: 'published',
        updatedAt: now
      })
    );
    
    // Auto-archive announcements
    const archiveQuery = adminDb.collection('announcements')
      .where('status', '==', 'published')
      .where('autoArchiveDate', '<=', now)
      .where('autoArchiveDate', '!=', null);
    
    const archiveSnapshot = await archiveQuery.get();
    const archivePromises = archiveSnapshot.docs.map(docRef => 
      docRef.ref.update({ 
        status: 'archived',
        updatedAt: now
      })
    );
    
    // Execute all updates
    await Promise.all([...publishPromises, ...archivePromises]);
    
    return NextResponse.json({ 
      success: true, 
      published: publishSnapshot.size,
      archived: archiveSnapshot.size,
      message: `Auto-managed ${publishSnapshot.size} published and ${archiveSnapshot.size} archived announcements`
    });
    
  } catch (error) {
    console.error('Error in auto-managing announcements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-manage announcements' },
      { status: 500 }
    );
  }
}

// GET endpoint to check for announcements that need auto-management
export async function GET() {
  try {
    const now = new Date();
    
    // Check for announcements to publish
    const publishQuery = adminDb.collection('announcements')
      .where('status', '==', 'draft')
      .where('autoPublishDate', '<=', now)
      .where('autoPublishDate', '!=', null);
    
    const publishSnapshot = await publishQuery.get();
    
    // Check for announcements to archive
    const archiveQuery = adminDb.collection('announcements')
      .where('status', '==', 'published')
      .where('autoArchiveDate', '<=', now)
      .where('autoArchiveDate', '!=', null);
    
    const archiveSnapshot = await archiveQuery.get();
    
    return NextResponse.json({
      success: true,
      toPublish: publishSnapshot.size,
      toArchive: archiveSnapshot.size,
      publishList: publishSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        autoPublishDate: doc.data().autoPublishDate
      })),
      archiveList: archiveSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        autoArchiveDate: doc.data().autoArchiveDate
      }))
    });
    
  } catch (error) {
    console.error('Error checking auto-management status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check auto-management status' },
      { status: 500 }
    );
  }
} 