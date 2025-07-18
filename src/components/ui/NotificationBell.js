"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Eye, Trash2, Clock, FileText, User, UserPlus, MessageSquare, CreditCard, FileCheck, Award } from 'lucide-react';
import { useNotifications } from './NotificationContext';
import { useRouter } from 'next/navigation';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showInfoUpdateModal, setShowInfoUpdateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const panelRef = useRef(null);
  const bellRef = useRef(null);
  const router = useRouter();
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications,
    refreshNotifications
  } = useNotifications();

  // Refresh notifications when component mounts and when panel opens
  useEffect(() => {
    if (isOpen) {
      refreshNotifications().catch(error => {
        console.error('Failed to refresh notifications on panel open:', error);
      });
      
      // Set up more frequent polling when panel is open
      const interval = setInterval(() => {
        refreshNotifications().catch(error => {
          console.error('Failed to refresh notifications during polling:', error);
        });
      }, 30000); // Refresh every 30 seconds when panel is open (reduced from 10s)
      
      return () => clearInterval(interval);
    }
  }, [isOpen, refreshNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info_update_request':
        return <User className="w-4 h-4" />;
      case 'info_update_approved':
        return <CheckCheck className="w-4 h-4" />;
      case 'info_update_rejected':
        return <X className="w-4 h-4" />;
      case 'brgy_id_request':
        return <CreditCard className="w-4 h-4" />;
      case 'document_clearance':
        return <FileCheck className="w-4 h-4" />;
      case 'document_certificate':
        return <Award className="w-4 h-4" />;
      case 'document_permit':
        return <FileText className="w-4 h-4" />;
      case 'document_request':
        return <FileText className="w-4 h-4" />;
      case 'personal_info_update':
        return <User className="w-4 h-4" />;
      case 'new_registration':
        return <UserPlus className="w-4 h-4" />;
      case 'complaint':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-50';
    if (priority === 'high') return 'text-orange-600 bg-orange-50';
    
    switch (type) {
      case 'info_update_request':
        return 'text-purple-600 bg-purple-50';
      case 'info_update_approved':
        return 'text-green-600 bg-green-50';
      case 'info_update_rejected':
        return 'text-red-600 bg-red-50';
      case 'brgy_id_request':
        return 'text-indigo-600 bg-indigo-50';
      case 'document_clearance':
        return 'text-green-600 bg-green-50';
      case 'document_certificate':
        return 'text-yellow-600 bg-yellow-50';
      case 'document_permit':
        return 'text-blue-600 bg-blue-50';
      case 'document_request':
        return 'text-blue-600 bg-blue-50';
      case 'personal_info_update':
        return 'text-purple-600 bg-purple-50';
      case 'new_registration':
        return 'text-green-600 bg-green-50';
      case 'complaint':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  // Smart notification click handler with routing logic
  const handleNotificationClick = async (notification) => {
    // Mark as read first (don't wait for it)
    if (!notification.seen) {
      markAsRead(notification.id).catch(error => {
        console.error('Error marking notification as read:', error);
      });
    }

    // Close the notification panel immediately
    setIsOpen(false);

    // Detect if we're on resident dashboard or admin dashboard
    const isResidentDashboard = window.location.pathname.startsWith('/resident-dashboard');

    if (isResidentDashboard) {
      // For residents, always navigate to notifications page
      console.log('Resident notification clicked, navigating to notifications page');
      try {
        // Use window.location for more reliable navigation
        window.location.href = `/resident-dashboard/notifications?highlight=${notification.id}`;
      } catch (navError) {
        console.error('Navigation error:', navError);
        // Fallback to router
        router.push(`/resident-dashboard/notifications?highlight=${notification.id}`);
      }
      return;
    } else {
      // Admin dashboard routing (existing logic)
      switch (notification.type) {
        case 'info_update_request':
          // Use modal for info update requests (quick review)
          setSelectedNotification(notification);
          setShowInfoUpdateModal(true);
          break;
          
        case 'brgy_id_request':
          // Redirect to ID requests page (complex action - printing)
          router.push(`/dashboard/residents?highlight=${notification.dataId}&action=id-request`);
          break;
          
        case 'document_clearance':
          // Redirect to documents page with clearance filter
          router.push(`/dashboard/services?type=clearance&request=${notification.dataId}`);
          break;
          
        case 'document_certificate':
          // Redirect to documents page with certificate filter
          router.push(`/dashboard/services?type=certificate&request=${notification.dataId}`);
          break;
          
        case 'document_permit':
          // Redirect to documents page with permit filter
          router.push(`/dashboard/services?type=permit&request=${notification.dataId}`);
          break;
          
        case 'document_request':
          // Generic document request - redirect to services
          router.push(`/dashboard/services?request=${notification.dataId}`);
          break;
          
        case 'new_registration':
          // Redirect to residents page to review new registration
          router.push(`/dashboard/residents?highlight=${notification.residentId}&action=review`);
          break;
          
        case 'complaint':
          // Could redirect to a complaints management page (if exists)
          router.push(`/dashboard/services?type=complaint&id=${notification.dataId}`);
          break;
          
        default:
          // Fallback - redirect to notifications page
          router.push('/dashboard/notifications');
          break;
      }
    }
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          ref={bellRef}
          onClick={() => {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            // Refresh notifications when opening the panel
            if (newIsOpen) {
              refreshNotifications();
            }
          }}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell size={24} className="text-green-700" />
          
          {/* Red indicator with pulse effect */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1">
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-50"></div>
              
              {/* Main indicator */}
              <div className="relative flex items-center justify-center w-5 h-5 bg-red-500 rounded-full shadow-lg">
                <span className="text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            </div>
          )}
        </button>

        {/* Notification Panel */}
        {isOpen && (
          <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 text-red-500">
                  <X className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm mb-2">{error}</p>
                  <button
                    onClick={() => refreshNotifications()}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <Bell className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group p-4 transition-colors cursor-pointer border-l-4 ${
                        !notification.seen 
                          ? 'bg-blue-50/50 border-l-blue-500 hover:bg-blue-50' 
                          : 'bg-white border-l-gray-200 hover:bg-gray-50 opacity-75'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon with read/unread styling */}
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)} ${
                          notification.seen ? 'opacity-70' : ''
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-medium ${
                                  !notification.seen ? 'text-gray-900' : 'text-gray-600'
                                }`}>
                                  {notification.title}
                                </p>
                                
                                {/* Read status indicator */}
                                {notification.seen ? (
                                  <CheckCheck className="w-4 h-4 text-green-500 flex-shrink-0" title="Read" />
                                ) : (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" title="Unread"></div>
                                )}
                              </div>
                              
                              <p className={`text-xs mt-1 line-clamp-2 ${
                                !notification.seen ? 'text-gray-700' : 'text-gray-500'
                              }`}>
                                {notification.message}
                              </p>
                              
                              {/* Notification type badge */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  notification.seen ? 'opacity-70' : ''
                                } ${
                                  notification.type === 'info_update_request' ? 'bg-purple-100 text-purple-700' :
                                  notification.type === 'info_update_approved' ? 'bg-green-100 text-green-700' :
                                  notification.type === 'info_update_rejected' ? 'bg-red-100 text-red-700' :
                                  notification.type === 'brgy_id_request' ? 'bg-indigo-100 text-indigo-700' :
                                  notification.type === 'document_clearance' ? 'bg-green-100 text-green-700' :
                                  notification.type === 'document_certificate' ? 'bg-yellow-100 text-yellow-700' :
                                  notification.type === 'document_permit' ? 'bg-blue-100 text-blue-700' :
                                  notification.type === 'new_registration' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {notification.type === 'info_update_request' ? 'Info Update' :
                                   notification.type === 'info_update_approved' ? 'Approved' :
                                   notification.type === 'info_update_rejected' ? 'Rejected' :
                                   notification.type === 'brgy_id_request' ? 'ID Request' :
                                   notification.type === 'document_clearance' ? 'Clearance' :
                                   notification.type === 'document_certificate' ? 'Certificate' :
                                   notification.type === 'document_permit' ? 'Permit' :
                                   notification.type === 'new_registration' ? 'New Registration' :
                                   notification.type.replace('_', ' ')}
                                </span>
                                
                                {notification.priority === 'urgent' && (
                                  <span className={`px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full ${
                                    notification.read ? 'opacity-70' : ''
                                  }`}>
                                    Urgent
                                  </span>
                                )}
                                
                                {/* Status indicator */}
                                {notification.status && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    notification.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    notification.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    notification.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    notification.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  } ${notification.seen ? 'opacity-70' : ''}`}>
                                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Time and actions */}
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <span className={`text-xs ${
                                !notification.seen ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {/* Mark as read/unread button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className={`p-1 transition-colors opacity-0 group-hover:opacity-100 ${
                                    notification.seen 
                                      ? 'text-gray-400 hover:text-blue-500' 
                                      : 'text-blue-500 hover:text-blue-600'
                                  }`}
                                  title={notification.seen ? 'Mark as unread' : 'Mark as read'}
                                >
                                  {notification.seen ? <Eye className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                </button>
                                
                                {/* Delete button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete notification"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    refreshNotifications();
                  }}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    error 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                {recentNotifications.length > 0 && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // Check if we're on resident dashboard
                      const isResidentDashboard = window.location.pathname.startsWith('/resident-dashboard');
                      if (isResidentDashboard) {
                        router.push('/resident-dashboard/notifications');
                      } else {
                        setShowAllModal(true);
                      }
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Show all notifications
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Update Modal */}
      {showInfoUpdateModal && selectedNotification && (
        <InfoUpdateModal
          notification={selectedNotification}
          onClose={() => {
            setShowInfoUpdateModal(false);
            setSelectedNotification(null);
          }}
        />
      )}

      {/* Show All Notifications Modal */}
      {showAllModal && (
        <NotificationModal
          isOpen={showAllModal}
          onClose={() => setShowAllModal(false)}
          notifications={notifications}
          unreadCount={unreadCount}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          deleteNotification={deleteNotification}
          loadMoreNotifications={loadMoreNotifications}
          getNotificationIcon={getNotificationIcon}
          getNotificationColor={getNotificationColor}
          formatTimeAgo={formatTimeAgo}
          handleNotificationClick={handleNotificationClick}
        />
      )}
    </>
  );
};

// Info Update Modal Component
const InfoUpdateModal = ({ notification, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState(notification?.status || 'pending');

  // Load the pending update data when modal opens
  useEffect(() => {
    const loadPendingUpdate = async () => {
      try {
        // Use the embedded notification data directly - this contains all the info we need
        if (notification.data && notification.data.residentId) {
          console.log('Using embedded notification data:', notification.data);
          setPendingUpdate(notification.data);
          setLoadingData(false);
          return;
        }

        // Fallback: create structure from notification fields (shouldn't be needed)
        console.log('No embedded data found, creating fallback structure');
        const fallbackUpdate = {
          id: notification.requestId,
          residentId: notification.senderUserId || notification.targetUserId,
          requestedBy: notification.senderUserId || 'Unknown',
          requestedAt: notification.createdAt,
          status: notification.status || 'pending',
          originalData: {
            firstName: 'Data not available in notification',
            middleName: '',
            lastName: '',
            email: '',
            phone: '',
            birthdate: ''
          },
          requestedChanges: {
            firstName: 'Please check notification details',
            middleName: '',
            lastName: '',
            email: '',
            phone: '',
            birthdate: ''
          }
        };
        setPendingUpdate(fallbackUpdate);
      } catch (error) {
        console.error('Error loading pending update:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadPendingUpdate();
  }, [notification.requestId, notification.data, notification.senderUserId, notification.createdAt, notification.status]);

  const handleApprove = async () => {
    setLoading(true);
    try {
      if (!pendingUpdate) {
        alert('No pending update found');
        return;
      }

      console.log('=== APPROVAL PROCESS STARTED ===');
      console.log('Pending update:', pendingUpdate);
      console.log('Resident ID:', pendingUpdate.residentId);
      console.log('Requested changes:', pendingUpdate.requestedChanges);

      // Step 1: Update the resident record in the database
      let databaseUpdateSuccess = false;
      try {
        // First, let's check if the resident exists
        const checkResponse = await fetch(`/api/residents/${pendingUpdate.residentId}`);
        console.log('Check resident response status:', checkResponse.status);
        
        if (!checkResponse.ok) {
          console.error('Resident not found with ID:', pendingUpdate.residentId);
          throw new Error(`Resident not found: ${pendingUpdate.residentId}`);
        }
        
        const existingResident = await checkResponse.json();
        console.log('Existing resident data:', existingResident);
        
        // Now update the resident
        const updateData = { ...pendingUpdate.requestedChanges };
        
        // Map field names if necessary (phone -> contactNumber)
        if (updateData.phone && !updateData.contactNumber) {
          updateData.contactNumber = updateData.phone;
          delete updateData.phone;
        }
        
        // Handle empty address object - don't send it if all fields are empty
        if (updateData.address && typeof updateData.address === 'object') {
          const addressValues = Object.values(updateData.address).filter(val => val && val.trim());
          if (addressValues.length === 0) {
            // All address fields are empty, remove the address from update
            delete updateData.address;
            console.log('Removed empty address object from update data');
          }
        }
        
        console.log('Final data to update (after field mapping):', updateData);
        
        const updateResponse = await fetch(`/api/residents/${pendingUpdate.residentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        console.log('Update response status:', updateResponse.status);
        
        if (updateResponse.ok) {
          const updatedResident = await updateResponse.json();
          console.log('Database update successful:', updatedResident);
          databaseUpdateSuccess = true;
        } else {
          const errorData = await updateResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Database update failed:', errorData);
          throw new Error(`Database update failed: ${JSON.stringify(errorData)}`);
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
        alert(`Database update failed: ${dbError.message}. Please check the console for details.`);
        return; // Don't continue if database update fails
      }

      // Step 2: Update localStorage for immediate UI feedback (only for the resident)
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id === pendingUpdate.residentId || currentUser.uniqueId === pendingUpdate.residentId) {
          const updatedUser = {
            ...currentUser,
            ...pendingUpdate.requestedChanges
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('LocalStorage updated for current user');
        } else {
          console.log('Current user is not the resident being updated, skipping localStorage update');
        }
      } catch (localStorageError) {
        console.error('LocalStorage update error:', localStorageError);
      }

      // Step 4: Update the original notification status
      try {
        console.log('Updating notification status to approved for ID:', notification.id);
        const statusResponse = await fetch(`/api/notifications?id=${notification.id}&action=updateStatus&status=approved`, {
          method: 'PATCH'
        });
        
        const responseData = await statusResponse.json();
        console.log('Status update response:', responseData);
        
        if (statusResponse.ok) {
          console.log('Original notification status updated to approved');
          // Update the notification object directly
          notification.status = 'approved';
          // Also update embedded data status if it exists
          if (notification.data) {
            notification.data.status = 'approved';
          }
          // Update local state to trigger re-render
          setNotificationStatus('approved');
          console.log('Local notification object updated:', notification);
        } else {
          console.error('Failed to update notification status:', statusResponse.status, responseData);
        }
      } catch (statusError) {
        console.error('Failed to update notification status:', statusError);
      }

      // Step 5: Create notification for the resident
      try {
        const notificationResponse = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'info_update_approved',
            title: 'Information Update Approved',
            message: `Your personal information update request has been approved and your profile has been updated.`,
            targetRole: 'resident',
            targetUserId: pendingUpdate.residentId,
            requestId: `approval_${notification.requestId}`,
            priority: 'medium',
            redirectTarget: 'page',
            status: 'completed',
            data: {
              id: notification.requestId,
              residentId: pendingUpdate.residentId,
              requestedBy: pendingUpdate.requestedBy,
              requestedAt: pendingUpdate.requestedAt,
              approvedAt: new Date().toISOString(),
              status: 'approved',
              originalData: pendingUpdate.originalData,
              requestedChanges: pendingUpdate.requestedChanges
            }
          })
        });
        
        if (notificationResponse.ok) {
          console.log('Approval notification sent to resident');
        } else {
          console.error('Failed to send approval notification:', notificationResponse.status);
        }
      } catch (notificationError) {
        console.error('Failed to send approval notification:', notificationError);
      }

      // Step 6: Trigger refresh events for admin side
      if (typeof window !== 'undefined') {
        const refreshEvent = new CustomEvent('residentDataUpdated', {
          detail: { 
            residentId: pendingUpdate.residentId,
            updatedData: pendingUpdate.requestedChanges
          }
        });
        window.dispatchEvent(refreshEvent);
        console.log('Refresh event dispatched');
        
        // Also trigger a general admin refresh event
        const adminRefreshEvent = new CustomEvent('adminDataRefresh', {
          detail: { type: 'resident_updated', residentId: pendingUpdate.residentId }
        });
        window.dispatchEvent(adminRefreshEvent);
        console.log('Admin refresh event dispatched');
      }

      console.log('=== APPROVAL PROCESS COMPLETED ===');
      
      // Force refresh the notifications list to update the status
      if (typeof window !== 'undefined' && window.notificationContext) {
        window.notificationContext.refreshNotifications();
      }
      
      // Don't close modal - let user see the updated status
      alert('Information update approved successfully! Resident has been notified and database updated.');
    } catch (error) {
      console.error('Error in approval process:', error);
      alert(`Failed to approve update: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      if (!pendingUpdate) return;

      // No need to remove from localStorage since we're using notification data directly

      // Update the original notification status to rejected
      try {
        console.log('Updating notification status to rejected for ID:', notification.id);
        const statusResponse = await fetch(`/api/notifications?id=${notification.id}&action=updateStatus&status=rejected`, {
          method: 'PATCH'
        });
        
        const responseData = await statusResponse.json();
        console.log('Status update response:', responseData);
        
        if (statusResponse.ok) {
          console.log('Original notification status updated to rejected');
          // Update the notification object directly
          notification.status = 'rejected';
          // Also update embedded data status if it exists
          if (notification.data) {
            notification.data.status = 'rejected';
          }
          // Update local state to trigger re-render
          setNotificationStatus('rejected');
          console.log('Local notification object updated:', notification);
        } else {
          console.error('Failed to update notification status:', statusResponse.status, responseData);
        }
      } catch (statusError) {
        console.error('Failed to update notification status:', statusError);
      }

      // Create notification for the resident about rejection with embedded data
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'info_update_rejected',
            title: 'Information Update Rejected',
            message: `Your personal information update request has been reviewed and rejected. Please contact the admin for more details.`,
            targetRole: 'resident',
            targetUserId: pendingUpdate.residentId,
            requestId: `rejection_${notification.requestId}`,
            priority: 'medium',
            redirectTarget: 'page',
            status: 'completed',
            data: {
              id: notification.requestId,
              residentId: pendingUpdate.residentId,
              requestedBy: pendingUpdate.requestedBy,
              requestedAt: pendingUpdate.requestedAt,
              rejectedAt: new Date().toISOString(),
              status: 'rejected',
              originalData: pendingUpdate.originalData,
              requestedChanges: pendingUpdate.requestedChanges
            }
          })
        });
        console.log('Rejection notification sent to resident');
      } catch (notificationError) {
        console.error('Failed to send rejection notification:', notificationError);
      }

      // Force refresh the notifications list to update the status
      if (typeof window !== 'undefined' && window.notificationContext) {
        window.notificationContext.refreshNotifications();
      }

      console.log('Info update rejected for:', pendingUpdate.residentId);
      
      // Don't close modal - let user see the updated status
      alert('Information update rejected. Resident has been notified.');
    } catch (error) {
      console.error('Error rejecting info update:', error);
      alert('Failed to reject update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderFieldComparison = (label, originalValue, newValue) => {
    const hasChanged = originalValue !== newValue;
    
    return (
      <div className={`p-3 rounded-lg border ${hasChanged ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Current</div>
            <div className="text-sm text-gray-900">{originalValue || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Requested</div>
            <div className={`text-sm ${hasChanged ? 'text-blue-600 font-medium' : 'text-gray-900'}`}>
              {newValue || 'Not provided'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Information Update Request</h2>
              <p className="text-sm text-gray-600">Review and approve changes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-gray-600">Loading update details...</span>
            </div>
          ) : !pendingUpdate ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Update request not found or has already been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Request Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Request Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Resident ID:</span> {pendingUpdate.residentId}
                  </div>
                  <div>
                    <span className="text-blue-700">Requested by:</span> {pendingUpdate.requestedBy}
                  </div>
                  <div>
                    <span className="text-blue-700">Request Date:</span> {new Date(pendingUpdate.requestedAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      notificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      notificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notificationStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Field Comparisons */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Requested Changes</h3>
                <div className="space-y-3">
                  {renderFieldComparison(
                    'First Name',
                    pendingUpdate.originalData.firstName,
                    pendingUpdate.requestedChanges.firstName
                  )}
                  {renderFieldComparison(
                    'Middle Name',
                    pendingUpdate.originalData.middleName,
                    pendingUpdate.requestedChanges.middleName
                  )}
                  {renderFieldComparison(
                    'Last Name',
                    pendingUpdate.originalData.lastName,
                    pendingUpdate.requestedChanges.lastName
                  )}
                  {renderFieldComparison(
                    'Email',
                    pendingUpdate.originalData.email,
                    pendingUpdate.requestedChanges.email
                  )}
                  {renderFieldComparison(
                    'Phone',
                    pendingUpdate.originalData.phone,
                    pendingUpdate.requestedChanges.phone
                  )}
                  {renderFieldComparison(
                    'Birth Date',
                    pendingUpdate.originalData.birthdate,
                    pendingUpdate.requestedChanges.birthdate
                  )}
                  {renderFieldComparison(
                    'Street Address',
                    pendingUpdate.originalData.address?.street,
                    pendingUpdate.requestedChanges.address?.street
                  )}
                  {renderFieldComparison(
                    'Barangay',
                    pendingUpdate.originalData.address?.barangay,
                    pendingUpdate.requestedChanges.address?.barangay
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

                {/* Actions */}
        {!loadingData && pendingUpdate && (
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
            {/* Left side: Status info for processed requests */}
            {(notificationStatus !== 'pending') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Request Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  notificationStatus === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {notificationStatus}
                </span>
                {(notificationStatus === 'approved') && (
                  <span className="text-sm text-gray-500">• Changes have been applied</span>
                )}
              </div>
            )}
            
            {/* Spacer for pending requests to push buttons to the right */}
            {(notificationStatus === 'pending') && <div className="flex-1"></div>}
            
            {/* Right side: Action buttons */}
            <div className="flex items-center gap-3">
              {/* Only show approve/reject buttons if status is pending */}
              {(notificationStatus === 'pending') && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Approve'}
                  </button>
                </>
              )}
              
              {/* Close button - always visible */}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Modal Component
const NotificationModal = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  loadMoreNotifications,
  getNotificationIcon,
  getNotificationColor,
  formatTimeAgo,
  handleNotificationClick
}) => {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    setLoading(true);
    const hasMoreNotifications = await loadMoreNotifications();
    setHasMore(hasMoreNotifications);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">All Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Bell className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
              <p className="text-sm">You'll see notifications here when there are new activities</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.seen ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    handleNotificationClick(notification);
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${getNotificationColor(notification.type, notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-base font-semibold ${!notification.seen ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.seen && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Time and Priority */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(notification.createdAt)}
                        </div>
                        {notification.priority === 'urgent' && (
                          <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                            Urgent
                          </span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                            High
                          </span>
                        )}
                        {notification.type && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full capitalize">
                            {notification.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Load More Button */}
          {hasMore && notifications.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    Loading...
                  </div>
                ) : (
                  'Load More Notifications'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
