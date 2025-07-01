import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Dynamic import to avoid circular dependency issues
    const { adminDb } = await import('@/lib/firebase-admin');
    
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const residentId = searchParams.get('residentId');
    const targetRole = searchParams.get('targetRole'); // 'admin' or 'resident'
    const typeFilter = searchParams.get('type');

    // Use simple query to avoid Firestore composite index requirements
    const query = adminDb.collection('notifications');

    // Get all documents and filter in memory to avoid Firestore index issues
    const snapshot = await query.get();
    
    let allNotifications = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      allNotifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      });
    });
    
    // Filter in memory to avoid Firestore index issues
    let filteredNotifications = allNotifications;
    
    // Apply role filtering
    if (targetRole === 'admin') {
      filteredNotifications = filteredNotifications.filter(n => n.targetRole === 'admin');
    } else if (targetRole === 'resident' && residentId) {
      filteredNotifications = filteredNotifications.filter(n => 
        n.targetRole === 'resident' && n.targetUserId === residentId
      );
    }
    
    // Apply unread filter
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.seen);
    }
    
    // Apply type filter
    if (typeFilter) {
      const types = typeFilter.split(',');
      filteredNotifications = filteredNotifications.filter(n => types.includes(n.type));
    }
    
    // Sort by createdAt desc (most recent first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const total = filteredNotifications.length;
    const notifications = filteredNotifications.slice(offset, offset + limit);

    // Calculate unread count from the same filtered data
    const unreadCount = filteredNotifications.filter(n => !n.seen).length;

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch notifications',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('=== NOTIFICATIONS API POST ===');
    
    // Dynamic import to avoid circular dependency issues
    const { adminDb } = await import('@/lib/firebase-admin');
    console.log('AdminDb available:', !!adminDb);
    
    if (!adminDb) {
      console.error('AdminDb is null in notifications API');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const body = await request.json();
    console.log('Request body received:', body);
    
    const { 
      type, 
      title, 
      message, 
      requestId,
      targetRole = 'admin', // 'admin' or 'resident'
      targetUserId, // for resident notifications
      senderUserId,
      relatedDocType,
      actionRequired = false,
      priority = 'medium',
      redirectTarget = 'page',
      status = 'pending',
      data // embedded data for the notification
    } = body;

    console.log('Extracted fields:', {
      type, title, message, requestId, targetRole, targetUserId, senderUserId, priority, status
    });

    if (!type || !title || !message || !targetRole) {
      console.error('Missing required fields:', { type: !!type, title: !!title, message: !!message, targetRole: !!targetRole });
      return NextResponse.json(
        { error: 'Type, title, message, and targetRole are required' },
        { status: 400 }
      );
    }

    // New notification structure
    const notificationData = {
      type,
      title,
      message,
      targetRole, // 'admin' or 'resident'
      priority,
      redirectTarget,
      status, // 'pending', 'approved', 'rejected', 'completed'
      actionRequired,
      seen: false, // changed from 'read' to 'seen'
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Only add optional fields if they are defined
    if (requestId !== undefined) notificationData.requestId = requestId;
    if (targetUserId !== undefined) notificationData.targetUserId = targetUserId;
    if (senderUserId !== undefined) notificationData.senderUserId = senderUserId;
    if (relatedDocType !== undefined) notificationData.relatedDocType = relatedDocType;
    if (data !== undefined) notificationData.data = data;

    console.log('Creating notification with data:', notificationData);

    const docRef = await adminDb.collection('notifications').add(notificationData);
    console.log('Notification created successfully with ID:', docRef.id);
    
    const response = {
      id: docRef.id,
      ...notificationData
    };
    
    console.log('Returning response:', response);
    
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const action = searchParams.get('action');
    const status = searchParams.get('status');

    if (action === 'markAllRead') {
      const batch = adminDb.batch();
      const unreadSnapshot = await adminDb.collection('notifications')
        .where('seen', '==', false)
        .get();
      
      unreadSnapshot.forEach((doc) => {
        batch.update(doc.ref, { seen: true, updatedAt: new Date() });
      });

      await batch.commit();
      
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notificationRef = adminDb.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const updateData = { updatedAt: new Date() };
    
    if (action === 'markRead') {
      updateData.seen = true;
    } else if (action === 'markUnread') {
      updateData.seen = false;
    } else if (action === 'updateStatus' && status) {
      updateData.status = status;
    }

    await notificationRef.update(updateData);

    return NextResponse.json({
      id: notificationId,
      ...notificationDoc.data(),
      ...updateData
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await adminDb.collection('notifications').doc(notificationId).delete();

    return NextResponse.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 