"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Eye, Trash2, Clock, FileText, User, UserPlus, MessageSquare, CreditCard, FileCheck, Award, CheckCircle } from 'lucide-react';
import { useNotifications } from './NotificationContext';
import { useRouter } from 'next/navigation';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showInfoUpdateModal, setShowInfoUpdateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const panelRef = useRef(null);
  const bellRef = useRef(null);
  const router = useRouter();
  const [residentModalOpen, setResidentModalOpen] = useState(false);
  const [residentModalNotification, setResidentModalNotification] = useState(null);
  
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
    if (!notification.read) {
      await markAsRead(notification.id);
      // Optionally refresh notifications for reliability
      await refreshNotifications();
    }
    // Get the updated notification from state
    const updatedNotification = notifications.find(n => n.id === notification.id) || notification;
    setIsOpen(false);

    // Detect if we're on resident dashboard or admin dashboard
    const isResidentDashboard = window.location.pathname.startsWith('/resident-dashboard');

    if (isResidentDashboard) {
      // For residents, show modal with details and navigation button
      setResidentModalNotification(updatedNotification);
      setResidentModalOpen(true);
      return;
    } else {
      // Admin dashboard routing (existing logic)
      switch (updatedNotification.type) {
        case 'info_update_request':
          // Use modal for info update requests (quick review)
          setSelectedNotification(updatedNotification);
          setShowInfoUpdateModal(true);
          break;
          
        case 'brgy_id_request':
          // Redirect to ID requests page (complex action - printing)
          router.push(`/dashboard/residents?highlight=${updatedNotification.dataId}&action=id-request`);
          break;
          
        case 'document_clearance':
          // Redirect to documents page with clearance filter
          router.push(`/dashboard/services?type=clearance&request=${updatedNotification.dataId}`);
          break;
          
        case 'document_certificate':
          // Redirect to documents page with certificate filter
          router.push(`/dashboard/services?type=certificate&request=${updatedNotification.dataId}`);
          break;
          
        case 'document_permit':
          // Redirect to documents page with permit filter
          router.push(`/dashboard/services?type=permit&request=${updatedNotification.dataId}`);
          break;
          
        case 'document_request':
          // Generic document request - redirect to services
          router.push(`/dashboard/services?request=${updatedNotification.dataId}`);
          break;
          
        case 'new_registration':
          // Redirect to residents page to review new registration
          router.push(`/dashboard/residents?highlight=${updatedNotification.residentId}&action=review`);
          break;
          
        case 'complaint':
          // Could redirect to a complaints management page (if exists)
          router.push(`/dashboard/services?type=complaint&id=${updatedNotification.dataId}`);
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
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={() => handleNotificationClick(notif)}
                  />
                ))
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
      {/* Resident Notification Modal */}
      {residentModalOpen && residentModalNotification && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-900/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Information Update Approved</h2>
              </div>
              <button onClick={() => setResidentModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 mb-2">Your personal information update request has been approved and your profile has been updated.</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Received: 9m ago</span>
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold ml-2">completed</span>
              </div>
            </div>
            <button className="w-full mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 transition-all text-base" onClick={() => {
                setResidentModalOpen(false);
                router.push('/resident-dashboard/notifications');
              }}>
              Go to Notifications Page
            </button>
          </div>
        </div>
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

  // Add this useEffect inside InfoUpdateModal to sync notificationStatus with notification.status
  useEffect(() => {
    setNotificationStatus(notification?.status || 'pending');
  }, [notification]);

  // In InfoUpdateModal, add useEffect to fetch the latest notification status from the backend when the modal opens
  useEffect(() => {
    async function fetchLatestStatus() {
      if (!notification?.id) return;
      try {
        const res = await fetch(`/api/notifications?id=${notification.id}`);
        if (res.ok) {
          const data = await res.json();
          setNotificationStatus(data.notification?.status || 'pending');
        } else {
          setNotificationStatus(notification?.status || 'pending');
        }
      } catch {
        setNotificationStatus(notification?.status || 'pending');
      }
    }
    fetchLatestStatus();
  }, [notification]);

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
          
          // Also update the pendingUpdates in localStorage to remove the approved request
          const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
          const updatedPendingUpdates = pendingUpdates.filter(update => 
            update.id !== pendingUpdate.id && update.status !== 'approved'
          );
          localStorage.setItem('pendingUpdates', JSON.stringify(updatedPendingUpdates));
          console.log('Pending updates cleaned up in localStorage');
        } else {
          console.log('Current user is not the resident being updated, skipping localStorage update');
        }
      } catch (localStorageError) {
        console.error('LocalStorage update error:', localStorageError);
      }

      // Step 4: Update the original notification status
      try {
        console.log('Updating notification status to approved for ID:', notification.id);
        const statusResponse = await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.id, status: 'approved' })
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

      // Step 6: Trigger refresh events for both admin and resident sides
      if (typeof window !== 'undefined') {
        // Event for admin side refresh
        const adminRefreshEvent = new CustomEvent('adminDataRefresh', {
          detail: { type: 'resident_updated', residentId: pendingUpdate.residentId }
        });
        window.dispatchEvent(adminRefreshEvent);
        console.log('Admin refresh event dispatched');
        
        // Event for resident side refresh (personal info page)
        const residentRefreshEvent = new CustomEvent('residentDataUpdated', {
          detail: { 
            residentId: pendingUpdate.residentId,
            updatedData: pendingUpdate.requestedChanges,
            action: 'approved'
          }
        });
        window.dispatchEvent(residentRefreshEvent);
        console.log('Resident refresh event dispatched');
        
        // Event specifically for personal info page
        const personalInfoRefreshEvent = new CustomEvent('personalInfoUpdated', {
          detail: { 
            residentId: pendingUpdate.residentId,
            updatedData: pendingUpdate.requestedChanges,
            action: 'approved'
          }
        });
        window.dispatchEvent(personalInfoRefreshEvent);
        console.log('Personal info refresh event dispatched');
      }

      console.log('=== APPROVAL PROCESS COMPLETED ===');
      
      // Force refresh the notifications list to update the status
      if (typeof window !== 'undefined' && window.notificationContext) {
        window.notificationContext.refreshNotifications();
      }
      
      // Show success message and close modal
      alert('Information update approved successfully! Resident has been notified and database updated.');
      
      // Close the modal after approval
      onClose();
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
        const statusResponse = await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.id, status: 'rejected' })
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

      // Trigger events for resident side to handle rejection
      if (typeof window !== 'undefined') {
        // Event for resident side to clear pending status
        const residentRejectionEvent = new CustomEvent('residentDataUpdated', {
          detail: { 
            residentId: pendingUpdate.residentId,
            action: 'rejected'
          }
        });
        window.dispatchEvent(residentRejectionEvent);
        console.log('Resident rejection event dispatched');
        
        // Event specifically for personal info page
        const personalInfoRejectionEvent = new CustomEvent('personalInfoUpdated', {
          detail: { 
            residentId: pendingUpdate.residentId,
            action: 'rejected'
          }
        });
        window.dispatchEvent(personalInfoRejectionEvent);
        console.log('Personal info rejection event dispatched');
      }

      console.log('Info update rejected for:', pendingUpdate.residentId);
      
      // Show success message and close modal
      alert('Information update rejected. Resident has been notified.');
      
      // Close the modal after rejection
      onClose();
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

  // Helper to format address object or string as a string
  const formatAddress = (addressObj) => {
    if (!addressObj) return 'Not provided';
    if (typeof addressObj === 'string') {
      return addressObj.trim() ? addressObj : 'Not provided';
    }
    if (typeof addressObj === 'object') {
      const parts = [
        addressObj.street,
        addressObj.barangay,
        addressObj.city,
        addressObj.province,
        addressObj.zip,
        addressObj.zipCode // support both zip and zipCode
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Not provided';
    }
    return 'Not provided';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Information Update Request</h2>
                <p className="text-green-100 text-sm">Review and approve changes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* Content Section */}
        <div className="px-8 py-8 max-h-[60vh] overflow-y-auto bg-white space-y-6">
          {/* Request Info and Field Comparison Cards */}
          {!pendingUpdate ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Update request not found or has already been processed.</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Request Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Resident ID:</span> {pendingUpdate?.residentId || <span className="text-gray-400 italic">N/A</span>}
                  </div>
                  <div>
                    <span className="text-blue-700">Requested by:</span> {pendingUpdate?.requestedBy || <span className="text-gray-400 italic">N/A</span>}
                  </div>
                  <div>
                    <span className="text-blue-700">Request Date:</span> {pendingUpdate?.requestedAt ? new Date(pendingUpdate.requestedAt).toLocaleString() : <span className="text-gray-400 italic">N/A</span>}
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${notificationStatus === 'approved' ? 'bg-green-100 text-green-800' : notificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{notificationStatus}</span>
                  </div>
                </div>
              </div>
              {/* Field Comparisons */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-4">
                <h3 className="font-medium text-gray-900 mb-3">Requested Changes</h3>
                <div className="space-y-3">
                  {renderFieldComparison(
                    'First Name',
                    pendingUpdate?.originalData?.firstName,
                    pendingUpdate?.requestedChanges?.firstName
                  )}
                  {renderFieldComparison(
                    'Middle Name',
                    pendingUpdate?.originalData?.middleName,
                    pendingUpdate?.requestedChanges?.middleName
                  )}
                  {renderFieldComparison(
                    'Last Name',
                    pendingUpdate?.originalData?.lastName,
                    pendingUpdate?.requestedChanges?.lastName
                  )}
                  {renderFieldComparison(
                    'Email',
                    pendingUpdate?.originalData?.email,
                    pendingUpdate?.requestedChanges?.email
                  )}
                  {renderFieldComparison(
                    'Phone',
                    pendingUpdate?.originalData?.phone,
                    pendingUpdate?.requestedChanges?.phone
                  )}
                  {renderFieldComparison(
                    'Birth Date',
                    pendingUpdate?.originalData?.birthdate,
                    pendingUpdate?.requestedChanges?.birthdate
                  )}
                  {/* Address field (combined) */}
                  {renderFieldComparison(
                    'Address',
                    formatAddress(pendingUpdate?.originalData?.address),
                    formatAddress(pendingUpdate?.requestedChanges?.address)
                  )}
                  {renderFieldComparison(
                    'Voter Status',
                    pendingUpdate?.originalData?.voterStatus,
                    pendingUpdate?.requestedChanges?.voterStatus
                  )}
                  {renderFieldComparison(
                    'Marital Status',
                    pendingUpdate?.originalData?.maritalStatus,
                    pendingUpdate?.requestedChanges?.maritalStatus
                  )}
                  {renderFieldComparison(
                    'Employment Status',
                    pendingUpdate?.originalData?.employmentStatus,
                    pendingUpdate?.requestedChanges?.employmentStatus
                  )}
                  {renderFieldComparison(
                    'Occupation',
                    pendingUpdate?.originalData?.occupation,
                    pendingUpdate?.requestedChanges?.occupation
                  )}
                  {renderFieldComparison(
                    'Educational Attainment',
                    pendingUpdate?.originalData?.educationalAttainment,
                    pendingUpdate?.requestedChanges?.educationalAttainment
                  )}
                </div>
              </div>
              {/* --- In the Requested Changes section, wrap the program <tr> rows in a <table><tbody> ... </tbody></table> --- */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-4">
                <h3 className="font-medium text-gray-900 mb-3">Programs & Benefits</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <tbody>
                      {['isTUPAD', 'is4Ps', 'isPWD', 'isSoloParent'].map((field) => {
                        const oldValue = pendingUpdate?.originalData ? pendingUpdate.originalData[field] : false;
                        const newValue = pendingUpdate?.requestedChanges ? pendingUpdate.requestedChanges[field] : false;
                        const changed = oldValue !== newValue;
                        const labelMap = {
                          isTUPAD: 'TUPAD',
                          is4Ps: '4Ps',
                          isPWD: 'PWD',
                          isSoloParent: 'Solo Parent',
                        };
                        const colorMap = {
                          isTUPAD: 'blue',
                          is4Ps: 'green',
                          isPWD: 'purple',
                          isSoloParent: 'orange',
                        };
                        return (
                          <tr key={field} className={changed ? 'bg-yellow-50 font-semibold' : ''}>
                            <td className="p-2 text-gray-600">{labelMap[field]}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${oldValue ? `bg-${colorMap[field]}-100 text-${colorMap[field]}-700` : 'bg-gray-100 text-gray-400'}`}>{oldValue ? 'Yes' : 'No'}</span>
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${newValue ? `bg-${colorMap[field]}-100 text-${colorMap[field]}-700` : 'bg-gray-100 text-gray-400'}`}>{newValue ? 'Yes' : 'No'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-end space-x-4">
          {notificationStatus === 'pending' && (
            <>
              <button
                onClick={handleReject}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                {loading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                {loading ? 'Processing...' : 'Approve'}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            Close
          </button>
        </div>
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
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => {
                    handleNotificationClick(notification);
                    onClose();
                  }}
                />
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
