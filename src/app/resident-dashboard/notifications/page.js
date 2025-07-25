"use client";

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  User,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import NotificationItem from '@/components/ui/NotificationItem';

export default function ResidentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, info_update_approved, info_update_rejected, document_request, etc.
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadNotifications();
    
    // Check for highlight parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get('highlight');
    if (highlightId) {
      // Wait a moment for notifications to load, then scroll to and highlight the notification
      setTimeout(() => {
        const notification = notifications.find(n => n.id === highlightId);
        if (notification) {
          handleNotificationClick(notification);
        }
      }, 1000);
    }

    // Simple highlight handling on page load
    const handleHighlight = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const highlightId = urlParams.get('highlight');
      
      if (highlightId && notifications.length > 0) {
        console.log('Looking for notification to highlight:', highlightId);
        const notification = notifications.find(n => n.id === highlightId);
        if (notification) {
          console.log('Found notification to highlight:', notification);
          setTimeout(() => {
            handleNotificationClick(notification);
            // Clear the URL parameter
            window.history.replaceState({}, '', '/resident-dashboard/notifications');
          }, 500);
        }
      }
    };

    // Handle highlight after notifications load
    if (notifications.length > 0) {
      handleHighlight();
    }
  }, []);

  useEffect(() => {
    // Handle highlight after notifications are loaded
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get('highlight');
    if (highlightId && notifications.length > 0) {
      console.log('Handling highlight from URL:', highlightId);
      const notification = notifications.find(n => n.id === highlightId);
      if (notification) {
        console.log('Found notification for highlight:', notification);
        
        // Mark as read if not already read
        if (!notification.read) {
          markAsRead(notification.id);
        }
        
        // Open modal with notification details
        setSelectedNotification(notification);
        setShowModal(true);
        
        // Clear the URL parameter
        window.history.replaceState({}, '', '/resident-dashboard/notifications');
      } else {
        console.log('Notification not found for highlight ID:', highlightId);
      }
    }
  }, [notifications.length]); // Only depend on length to avoid infinite loops

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      // Use robust extraction for residentId
      const residentId = userData.uniqueId || userData.residentId || userData.id || userData.uid;

      if (!residentId) {
        setError('No resident ID found. Please log in again.');
        return;
      }

      const response = await fetch(`/api/notifications?targetRole=resident&residentId=${residentId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Failed to load notifications:', response.status, errorText);
        setError(`Failed to load notifications: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    setError(null);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}&action=markRead`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        ));
        return true;
      } else {
        console.error('Failed to mark notification as read:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAsUnread = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}&action=markUnread`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: false } : notif
        ));
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await markAsRead(notification.id);
        await refreshNotifications();
      }
      // Get the updated notification from state
      const updatedNotification = notifications.find(n => n.id === notification.id) || notification;
      setSelectedNotification(updatedNotification);
      setShowModal(true);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info_update_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info_update_rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'document_request':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'complaint_filed':
        return <MessageSquare className="w-5 h-5 text-orange-600" />;
      case 'info_update_request':
        return <User className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (type === 'info_update_approved') return 'border-l-green-500 bg-green-50';
    if (type === 'info_update_rejected') return 'border-l-red-500 bg-red-50';
    if (type === 'document_request') return 'border-l-blue-500 bg-blue-50';
    if (type === 'complaint_filed') return 'border-l-orange-500 bg-orange-50';
    if (priority === 'high') return 'border-l-red-500 bg-red-50';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-gray-500 bg-gray-50';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Completed</span>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return notificationDate.toLocaleDateString();
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'info_update_approved': return 'Info Update Approved';
      case 'info_update_rejected': return 'Info Update Rejected';
      case 'document_request': return 'Document Request';
      case 'complaint_filed': return 'Complaint Filed';
      case 'info_update_request': return 'Info Update Request';
      default: return 'Notification';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'read' && !notification.read) return false;
    if (filter === 'unread' && notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const uniqueTypes = [...new Set(notifications.map(n => n.type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Notifications</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadNotifications();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications</h1>
              <p className="text-blue-100 text-lg">Stay updated with your requests and activities</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{notifications.length}</div>
            <div className="text-blue-200 text-sm">Total Notifications</div>
            {unreadCount > 0 && (
              <div className="mt-2">
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                  {unreadCount} unread
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {/* Read/Unread Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{getNotificationTypeLabel(type)}</option>
              ))}
            </select>
          </div>

          <button
            onClick={refreshNotifications}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {filteredNotifications.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? "You don't have any unread notifications." : 
               filter === 'read' ? "You don't have any read notifications." :
               "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))
        )}
      </div>

      {/* Summary Stats */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
                         <div className="text-center">
               <div className="text-2xl font-bold text-green-600">
                 {notifications.filter(n => n.read).length}
               </div>
               <div className="text-sm text-gray-600">Read</div>
             </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {notifications.filter(n => n.type === 'info_update_approved' || n.type === 'info_update_rejected').length}
              </div>
              <div className="text-sm text-gray-600">Info Updates</div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {/* Custom icon for approved/rejected info update */}
                    {(selectedNotification.type === 'info_update_approved') ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : selectedNotification.type === 'info_update_rejected' ? (
                      <XCircle className="w-8 h-8 text-red-600" />
                    ) : (
                      getNotificationIcon(selectedNotification.type)
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {/* Custom header for approved/rejected info update */}
                      {selectedNotification.type === 'info_update_approved' && 'Information Update Approved'}
                      {selectedNotification.type === 'info_update_rejected' && 'Information Update Rejected'}
                      {selectedNotification.type !== 'info_update_approved' && selectedNotification.type !== 'info_update_rejected' && selectedNotification.title}
                    </h2>
                    <div className="flex items-center gap-3 mb-3">
                      {!selectedNotification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      {selectedNotification.status && getStatusBadge(selectedNotification.status)}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {getNotificationTypeLabel(selectedNotification.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Message */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Message</h3>
                  <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {/* Custom message for approved/rejected info update */}
                    {selectedNotification.type === 'info_update_approved' &&
                      'Your personal information update request has been approved and your profile has been updated.'}
                    {selectedNotification.type === 'info_update_rejected' &&
                      'Your personal information update request has been reviewed and rejected. Please contact the admin for more details.'}
                    {selectedNotification.type !== 'info_update_approved' && selectedNotification.type !== 'info_update_rejected' && selectedNotification.message}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notification ID</h4>
                    <p className="text-gray-900 font-mono text-sm">{selectedNotification.id}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedNotification.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedNotification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedNotification.priority || 'normal'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Created</h4>
                    <p className="text-gray-900 text-sm">
                      {new Date(selectedNotification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {selectedNotification.updatedAt && selectedNotification.updatedAt !== selectedNotification.createdAt && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Updated</h4>
                      <p className="text-gray-900 text-sm">
                        {new Date(selectedNotification.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Changes Details for Info Updates */}
                {(selectedNotification.type === 'info_update_approved' || selectedNotification.type === 'info_update_rejected') && 
                 selectedNotification.data && selectedNotification.data.originalData && selectedNotification.data.requestedChanges && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      {selectedNotification.type === 'info_update_approved' ? 'Approved Changes' : 'Rejected Changes'}
                    </h3>
                    <div className="space-y-4">
                      {/* Compare changes */}
                      {Object.keys(selectedNotification.data.requestedChanges).map(key => {
                        const original = selectedNotification.data.originalData[key];
                        const requested = selectedNotification.data.requestedChanges[key];
                        
                        // Handle nested objects like address
                        if (typeof requested === 'object' && requested !== null && !Array.isArray(requested)) {
                          return (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 capitalize">{key}</h4>
                              <div className="space-y-2">
                                {Object.keys(requested).map(subKey => {
                                  const originalValue = original?.[subKey] || '';
                                  const requestedValue = requested[subKey] || '';
                                  
                                  if (originalValue !== requestedValue) {
                                    return (
                                      <div key={subKey} className="text-sm">
                                        <div className="font-medium text-gray-700 capitalize">{subKey}:</div>
                                        <div className="ml-2 space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-red-600 font-medium">From:</span>
                                            <span className="px-2 py-1 bg-red-50 text-red-800 rounded text-xs">
                                              {originalValue || '(empty)'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-green-600 font-medium">To:</span>
                                            <span className="px-2 py-1 bg-green-50 text-green-800 rounded text-xs">
                                              {requestedValue || '(empty)'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          );
                        }
                        
                        // Handle simple values
                        if (original !== requested) {
                          return (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 capitalize">{key}</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 font-medium">From:</span>
                                  <span className="px-2 py-1 bg-red-50 text-red-800 rounded text-xs">
                                    {original || '(empty)'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-medium">To:</span>
                                  <span className="px-2 py-1 bg-green-50 text-green-800 rounded text-xs">
                                    {requested || '(empty)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Data for other notification types */}
                {selectedNotification.data && 
                 selectedNotification.type !== 'info_update_approved' && 
                 selectedNotification.type !== 'info_update_rejected' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedNotification.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectedNotification.read ? markAsUnread(selectedNotification.id) : markAsRead(selectedNotification.id);
                      setSelectedNotification(prev => ({ ...prev, read: !prev.read }));
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {selectedNotification.read ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {selectedNotification.read ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                  
                  <button
                    onClick={() => {
                      deleteNotification(selectedNotification.id);
                      closeModal();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    closeModal();
                    window.location.href = '/resident-dashboard/notifications';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Notification Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 