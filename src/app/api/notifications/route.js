import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin directly for this API
function getFirebaseAdminDirect() {
  if (getApps().length === 0) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        //console.error('Missing Firebase Admin configuration');
        return null;
      }

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } catch (error) {
      //console.error('Firebase Admin initialization error:', error);
      return null;
    }
  }
  
  const app = getApps()[0];
  return {
    adminDb: getFirestore(app)
  };
}

export async function GET(request) {
  try {
    //console.log('GET /api/notifications - Starting request');
    
    const { adminDb } = getFirebaseAdminDirect();
    if (!adminDb) {
      //console.error('Firebase Admin not available');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    //console.log('Firebase Admin initialized successfully');

    // Test if we can access the notifications collection
    try {
      const testQuery = adminDb.collection('notifications').limit(1);
      await testQuery.get();
      //console.log('Notifications collection is accessible');
    } catch (collectionError) {
      //console.error('Error accessing notifications collection:', collectionError);
      return NextResponse.json(
        { error: "Notifications collection not accessible", details: collectionError.message },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetRole = searchParams.get("targetRole");
    const residentId = searchParams.get("residentId");
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    //console.log('Query parameters:', { targetRole, residentId, type, unreadOnly, limit, offset });

    let query = adminDb.collection('notifications');
    let useFallbackQuery = false;

    //console.log('Base query created');

    // Handle new notification structure
    if (targetRole) {
      query = query.where('targetRole', '==', targetRole);
      //console.log('Added targetRole filter:', targetRole);
    }
    
    if (residentId) {
      // For resident notifications, filter by targetUserId (notifications sent TO the resident)
      // For admin notifications, filter by senderUserId (notifications sent FROM residents)
      if (targetRole === 'resident') {
        query = query.where('targetUserId', '==', residentId);
        //console.log('Added targetUserId filter for resident:', residentId);
      } else {
        query = query.where('senderUserId', '==', residentId);
        //console.log('Added senderUserId filter for admin:', residentId);
      }
    }
    
    if (type) {
      query = query.where('type', '==', type);
      //console.log('Added type filter:', type);
    }
    
    if (unreadOnly) {
      query = query.where('read', '==', false);
      //console.log('Added unreadOnly filter');
    }

    // Add ordering after all filters
    query = query.orderBy('createdAt', 'desc');
    //console.log('Added ordering by createdAt desc');

    // Apply pagination
    query = query.limit(limit).offset(offset);
    //console.log('Applied pagination:', { limit, offset });

    //console.log('Executing Firestore query...');
    let snapshot;
    try {
      snapshot = await query.get();
      //console.log('Query executed successfully, found', snapshot.docs.length, 'documents');
    } catch (indexError) {
      //console.log('Index error, trying fallback query:', indexError.message);
      useFallbackQuery = true;
      
      // Fallback: Get all notifications and filter in memory
      const fallbackQuery = adminDb.collection('notifications').limit(100); // Get more to account for filtering
      snapshot = await fallbackQuery.get();
      //console.log('Fallback query executed, found', snapshot.docs.length, 'documents');
    }

    let notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
    }));

    // Apply fallback filtering if index failed
    if (useFallbackQuery) {
      //console.log('Applying fallback filtering in memory');
      
      if (targetRole) {
        notifications = notifications.filter(n => n.targetRole === targetRole);
        //console.log('Filtered by targetRole:', targetRole, 'remaining:', notifications.length);
      }
      
      if (residentId) {
        // For resident notifications, filter by targetUserId (notifications sent TO the resident)
        // For admin notifications, filter by senderUserId (notifications sent FROM residents)
        if (targetRole === 'resident') {
          notifications = notifications.filter(n => n.targetUserId === residentId);
          //console.log('Filtered by targetUserId for resident:', residentId, 'remaining:', notifications.length);
        } else {
          notifications = notifications.filter(n => n.senderUserId === residentId);
          //console.log('Filtered by senderUserId for admin:', residentId, 'remaining:', notifications.length);
        }
      }
      
      if (type) {
        notifications = notifications.filter(n => n.type === type);
        //console.log('Filtered by type:', type, 'remaining:', notifications.length);
      }
      
      if (unreadOnly) {
        notifications = notifications.filter(n => !n.read);
        //console.log('Filtered by unreadOnly, remaining:', notifications.length);
      }
      
      // Sort by createdAt desc
      notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination manually
      notifications = notifications.slice(offset, offset + limit);
      //console.log('Applied manual pagination, final count:', notifications.length);
    }

    //console.log('Processed notifications:', notifications.length);

    // Add support for fetching a single notification by ID
    const notificationId = searchParams.get('id');
    if (notificationId) {
      const doc = await adminDb.collection('notifications').doc(notificationId).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      const data = doc.data();
      return NextResponse.json({
        notification: {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        }
      });
    }

    // Get total count for pagination
    //console.log('Getting total count...');
    let total;
    let unreadCount;
    
    if (useFallbackQuery) {
      // Use the fallback data for counts
      const allNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      let filteredForTotal = allNotifications;
      if (targetRole) filteredForTotal = filteredForTotal.filter(n => n.targetRole === targetRole);
      if (residentId) {
        if (targetRole === 'resident') {
          filteredForTotal = filteredForTotal.filter(n => n.targetUserId === residentId);
        } else {
          filteredForTotal = filteredForTotal.filter(n => n.senderUserId === residentId);
        }
      }
      if (type) filteredForTotal = filteredForTotal.filter(n => n.type === type);
      if (unreadOnly) filteredForTotal = filteredForTotal.filter(n => !n.read);
      
      total = filteredForTotal.length;
      
      // Calculate unread count
      let filteredForUnread = allNotifications;
      if (targetRole) filteredForUnread = filteredForUnread.filter(n => n.targetRole === targetRole);
      if (residentId) {
        if (targetRole === 'resident') {
          filteredForUnread = filteredForUnread.filter(n => n.targetUserId === residentId);
        } else {
          filteredForUnread = filteredForUnread.filter(n => n.senderUserId === residentId);
        }
      }
      if (type) filteredForUnread = filteredForUnread.filter(n => n.type === type);
      filteredForUnread = filteredForUnread.filter(n => !n.read);
      
      unreadCount = filteredForUnread.length;
    } else {
      // Use Firestore queries for counts
      let totalQuery = adminDb.collection('notifications');
      if (targetRole) totalQuery = totalQuery.where('targetRole', '==', targetRole);
      if (residentId) {
        if (targetRole === 'resident') {
          totalQuery = totalQuery.where('targetUserId', '==', residentId);
        } else {
          totalQuery = totalQuery.where('senderUserId', '==', residentId);
        }
      }
      if (type) totalQuery = totalQuery.where('type', '==', type);
      if (unreadOnly) totalQuery = totalQuery.where('read', '==', false);
      
      const totalSnapshot = await totalQuery.get();
      total = totalSnapshot.size;
      
      // Calculate unread count for the current filters
      let unreadQuery = adminDb.collection('notifications');
      if (targetRole) unreadQuery = unreadQuery.where('targetRole', '==', targetRole);
      if (residentId) {
        if (targetRole === 'resident') {
          unreadQuery = unreadQuery.where('targetUserId', '==', residentId);
        } else {
          unreadQuery = unreadQuery.where('senderUserId', '==', residentId);
        }
      }
      if (type) unreadQuery = unreadQuery.where('type', '==', type);
      unreadQuery = unreadQuery.where('read', '==', false);
      
      const unreadSnapshot = await unreadQuery.get();
      unreadCount = unreadSnapshot.size;
    }
    
    //console.log('Total count:', total);
    //console.log('Unread count:', unreadCount);

    const response = { 
      notifications,
      unreadCount,
      pagination: {
        total,
        hasMore: offset + limit < total
      }
    };

    //console.log('Returning response with', notifications.length, 'notifications and', unreadCount, 'unread');
    return NextResponse.json(response);
  } catch (error) {
    //console.error("Error fetching notifications:", error);
    //console.error("Error stack:", error.stack);
    //console.error("Error message:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { adminDb } = getFirebaseAdminDirect();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const data = await request.json();
    //console.log('Creating notification with data:', data);

    // Handle both old and new notification structures
    const notification = {
      // New structure fields
      type: data.type,
      title: data.title,
      message: data.message,
      targetRole: data.targetRole,
      senderUserId: data.senderUserId,
      targetUserId: data.targetUserId,
      requestId: data.requestId,
      relatedDocType: data.relatedDocType,
      actionRequired: data.actionRequired,
      priority: data.priority || 'medium',
      redirectTarget: data.redirectTarget || 'page',
      status: data.status || 'pending',
      data: data.data, // Embedded data for complex notifications
      
      // Legacy fields for backward compatibility
      recipientId: data.recipientId,
      documentId: data.documentId,
      documentType: data.documentType,
      
      // Common fields
      read: data.read || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Remove undefined fields
    Object.keys(notification).forEach(key => {
      if (notification[key] === undefined) {
        delete notification[key];
      }
    });

    //console.log('Final notification object:', notification);

    const docRef = await adminDb.collection('notifications').add(notification);

    return NextResponse.json({ 
      message: "Notification created successfully",
      notification: {
        id: docRef.id,
        ...notification
      }
    });
  } catch (error) {
    //console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PATCH(request) {
  try {
    const { adminDb } = getFirebaseAdminDirect();
    if (!adminDb) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const data = await request.json();
    const { notificationId, status } = data;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Missing notification ID" },
        { status: 400 }
      );
    }

    const updateData = {
      read: true,
      updatedAt: new Date()
    };

    // If status is provided, update it too
    if (status) {
      updateData.status = status;
    }

    await adminDb.collection('notifications').doc(notificationId).update(updateData);

    return NextResponse.json({ 
      message: "Notification updated successfully"
    });
  } catch (error) {
    //console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { adminDb } = getFirebaseAdminDirect();
    
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
    //console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 