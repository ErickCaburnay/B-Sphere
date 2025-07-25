"use client";

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  CheckCheck, 
  Trash2, 
  Eye, 
  Clock,
  FileText,
  User,
  UserPlus,
  MessageSquare,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import DashboardPageContainer from '@/components/DashboardPageContainer';
import { useNotifications } from '@/components/ui/NotificationContext';

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications,
    refreshNotifications,
    setNotifications
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_request':
        return <FileText className="w-5 h-5" />;
      case 'personal_info_update':
        return <User className="w-5 h-5" />;
      case 'new_registration':
        return <UserPlus className="w-5 h-5" />;
      case 'complaint':
        return <MessageSquare className="w-5 h-5" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-50 border-red-200';
    if (priority === 'high') return 'text-orange-600 bg-orange-50 border-orange-200';
    
    switch (type) {
      case 'document_request':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'personal_info_update':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'new_registration':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'complaint':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[priority] || colors.medium}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium'}
      </span>
    );
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

  // Filter notifications based on search and filters
  const allFilteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.read) ||
                         (filterStatus === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  // Calculate pagination
  const totalFilteredItems = allFilteredNotifications.length;
  const calculatedTotalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  
  // Update total pages when filtered notifications change
  useEffect(() => {
    setTotalPages(calculatedTotalPages);
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [calculatedTotalPages, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterPriority, filterStatus]);

  // Get notifications for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = allFilteredNotifications.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedNotifications([]); // Clear selections when changing pages
    setShowBulkActions(false);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      const newSelection = prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId];
      
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const allIds = paginatedNotifications.map(n => n.id);
    setSelectedNotifications(allIds);
    setShowBulkActions(allIds.length > 0);
  };

  const handleDeselectAll = () => {
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const handleBulkMarkAsRead = async () => {
    for (const notificationId of selectedNotifications) {
      await markAsRead(notificationId);
    }
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
      for (const notificationId of selectedNotifications) {
        await deleteNotification(notificationId);
      }
      setSelectedNotifications([]);
      setShowBulkActions(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Open detail modal for full notification view
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  return (
    <DashboardPageContainer
      heading="Notifications"
      subtitle="Manage and review all system notifications"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Document Requests</p>
              <p className="text-2xl font-bold text-blue-600">
                {notifications.filter(n => n.type === 'document_request').length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Registrations</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type === 'new_registration').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="document_request">Document Requests</option>
              <option value="personal_info_update">Info Updates</option>
              <option value="new_registration">New Registrations</option>
              <option value="complaint">Complaints</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedNotifications.length} notification(s) selected
              </span>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark as Read
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications ({totalFilteredItems})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, totalFilteredItems)} of {totalFilteredItems}
              </span>
              <button
                onClick={paginatedNotifications.length > 0 ? handleSelectAll : undefined}
                disabled={paginatedNotifications.length === 0}
                className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Select All on Page
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600">Loading notifications...</span>
            </div>
          ) : totalFilteredItems === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Bell className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' || filterPriority !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'You\'ll see notifications here when there are new activities'
                }
              </p>
            </div>
          ) : (
            paginatedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 transition-colors cursor-pointer border-l-4 ${
                  !notification.read
                    ? 'bg-blue-50/30 border-l-blue-500 hover:bg-blue-100'
                    : 'bg-gray-50 border-l-gray-300 text-gray-400 hover:bg-gray-100'
                } ${selectedNotifications.includes(notification.id) ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectNotification(notification.id);
                    }}
                    className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />

                  {/* Icon */}
                  <div className={`p-3 rounded-xl border ${getNotificationColor(notification.type, notification.priority)}`}> 
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-base font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-400'}`}> 
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-600' : 'text-gray-400'}`}> 
                          {notification.message}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
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
                            if (confirm('Are you sure you want to delete this notification?')) {
                              deleteNotification(notification.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Metadata */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(notification.createdAt)}
                      </div>
                      {getPriorityBadge(notification.priority)}
                      {notification.type && (
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full capitalize">
                          {notification.type.replace('_', ' ')}
                        </span>
                      )}
                      {!notification.read && (
                        <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} • {totalFilteredItems} total notifications
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedNotification(null);
          }}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      )}
    </DashboardPageContainer>
  );
}

// Notification Detail Modal Component
const NotificationDetailModal = ({ notification, onClose, onMarkAsRead, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setNotifications } = useNotifications();
  // For info_update_request, reconstruct pendingUpdate from notification.data
  const pendingUpdate = notification.type === 'info_update_request' && notification.data ? notification.data : null;

  // Approve/Reject logic for info_update_request
  const handleApprove = async () => {
    setActionLoading(true);
    setError(null);
    try {
      if (!pendingUpdate) throw new Error('No pending update found');
      // 1. Update resident record
      let databaseUpdateSuccess = false;
      try {
        const checkResponse = await fetch(`/api/residents/${pendingUpdate.residentId}`);
        if (!checkResponse.ok) throw new Error(`Resident not found: ${pendingUpdate.residentId}`);
        const updateData = { ...pendingUpdate.requestedChanges };
        if (updateData.phone && !updateData.contactNumber) {
          updateData.contactNumber = updateData.phone;
          delete updateData.phone;
        }
        if (updateData.address && typeof updateData.address === 'object') {
          const addressValues = Object.values(updateData.address).filter(val => val && val.trim());
          if (addressValues.length === 0) {
            delete updateData.address;
          }
        }
        const updateResponse = await fetch(`/api/residents/${pendingUpdate.residentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        if (!updateResponse.ok) throw new Error('Database update failed');
        databaseUpdateSuccess = true;
      } catch (dbError) {
        setActionLoading(false);
        setError('Database update failed: ' + dbError.message);
        return;
      }
      // 2. Update notification status
      let statusUpdateFailed = false;
      try {
        const statusResponse = await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.id, status: 'approved' })
        });
        if (!statusResponse.ok) statusUpdateFailed = true;
      } catch (statusError) {
        statusUpdateFailed = true;
      }
      // 3. Send notification to resident
      let residentNotifFailed = false;
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      } catch (notificationError) {
        residentNotifFailed = true;
      }
      // 4. Optimistically update notification in UI
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: 'approved' } : n));
      setActionLoading(false);
      onClose();
    } catch (e) {
      setActionLoading(false);
      setError('Failed to approve request.');
    }
  };
  const handleReject = async () => {
    setActionLoading(true);
    setError(null);
    try {
      if (!pendingUpdate) throw new Error('No pending update found');
      // 1. Update notification status
      let updatedNotification = { ...notification, status: 'rejected' };
      try {
        const statusResponse = await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification.id, status: 'rejected' })
        });
        if (!statusResponse.ok) throw new Error('Failed to update notification status');
      } catch (statusError) {
        setError('Failed to update notification status.');
      }
      // 2. Send notification to resident
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      } catch (notificationError) {
        setError('Failed to send rejection notification to resident.');
      }
      // 3. Optimistically update notification in UI
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: 'rejected' } : n));
      setActionLoading(false);
      onClose();
    } catch (e) {
      setActionLoading(false);
      setError('Failed to reject request.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case 'completed':
        return <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">Completed</span>;
      default:
        return null;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info_update_request':
        return <User className="w-6 h-6 text-purple-600" />;
      case 'document_request':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'new_registration':
        return <UserPlus className="w-6 h-6 text-green-600" />;
      case 'complaint':
        return <MessageSquare className="w-6 h-6 text-orange-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const handleMarkAsRead = async () => {
    setLoading(true);
    await onMarkAsRead(notification.id);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this notification?')) {
      setLoading(true);
      await onDelete(notification.id);
      setLoading(false);
      onClose();
    }
  };

  function renderFieldComparison(label, originalValue, newValue) {
    const hasChanged = originalValue !== newValue;
    // For name fields, force uppercase
    const isNameField = ['First Name', 'Middle Name', 'Last Name'].includes(label);
    const displayOriginal = isNameField && originalValue ? originalValue.toUpperCase() : originalValue;
    const displayNew = isNameField && newValue ? newValue.toUpperCase() : newValue;
    return (
      <div className={`p-3 rounded-lg border ${hasChanged ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Current</div>
            <div className="text-sm text-gray-900">{displayOriginal || 'Not provided'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Requested</div>
            <div className={`text-sm ${hasChanged ? 'text-blue-600 font-medium' : 'text-gray-900'}`}>{displayNew || 'Not provided'}</div>
          </div>
        </div>
      </div>
    );
  }

  function formatAddress(addressObj) {
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
        addressObj.zipCode
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Not provided';
    }
    return 'Not provided';
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/70 rounded-lg">
              {getNotificationIcon(notification.type)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
              <p className="text-sm text-gray-600">Review notification information</p>
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
        <div className="px-8 py-8 max-h-[60vh] overflow-y-auto bg-white space-y-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{notification.title}</h3>
              <p className="text-gray-700 leading-relaxed">{notification.message}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <p className="text-sm text-gray-900 capitalize">
                  {notification.type?.replace('_', ' ') || 'General'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Priority:</span>
                <p className="text-sm text-gray-900 capitalize">
                  {notification.priority || 'Medium'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <p className="text-sm text-gray-900">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <div className="mt-1">
                  {getStatusBadge(notification.status)}
                </div>
              </div>
              {notification.senderUserId && (
                <div>
                  <span className="text-sm font-medium text-gray-600">From:</span>
                  <p className="text-sm text-gray-900">{notification.senderUserId}</p>
                </div>
              )}
              {notification.requestId && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Request ID:</span>
                  <p className="text-sm text-gray-900 font-mono">{notification.requestId}</p>
                </div>
              )}
            </div>

            {/* Additional Data */}
            {/* Info Update Request Field Comparison UI */}
            {notification.type === 'info_update_request' && notification.data && notification.data.originalData && notification.data.requestedChanges && (
              <>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Requested Changes</h3>
                  <div className="space-y-3">
                    {renderFieldComparison('First Name', notification.data.originalData.firstName, notification.data.requestedChanges.firstName)}
                    {renderFieldComparison('Middle Name', notification.data.originalData.middleName, notification.data.requestedChanges.middleName)}
                    {renderFieldComparison('Last Name', notification.data.originalData.lastName, notification.data.requestedChanges.lastName)}
                    {renderFieldComparison('Email', notification.data.originalData.email, notification.data.requestedChanges.email)}
                    {renderFieldComparison('Phone', notification.data.originalData.phone || notification.data.originalData.contactNumber, notification.data.requestedChanges.phone || notification.data.requestedChanges.contactNumber)}
                    {renderFieldComparison('Birth Date', notification.data.originalData.birthdate, notification.data.requestedChanges.birthdate)}
                    {renderFieldComparison('Address', formatAddress(notification.data.originalData.address), formatAddress(notification.data.requestedChanges.address))}
                    {renderFieldComparison('Voter Status', notification.data.originalData.voterStatus, notification.data.requestedChanges.voterStatus)}
                    {renderFieldComparison('Marital Status', notification.data.originalData.maritalStatus, notification.data.requestedChanges.maritalStatus)}
                    {renderFieldComparison('Employment Status', notification.data.originalData.employmentStatus, notification.data.requestedChanges.employmentStatus)}
                    {renderFieldComparison('Occupation', notification.data.originalData.occupation, notification.data.requestedChanges.occupation)}
                    {renderFieldComparison('Educational Attainment', notification.data.originalData.educationalAttainment, notification.data.requestedChanges.educationalAttainment)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Programs & Benefits</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <tbody>
                        {['isTUPAD', 'is4Ps', 'isPWD', 'isSoloParent'].map((field) => {
                          const oldValue = notification.data.originalData ? notification.data.originalData[field] : false;
                          const newValue = notification.data.requestedChanges ? notification.data.requestedChanges[field] : false;
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

            {/* Read Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Read Status:</span>
              {notification.read ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCheck className="w-4 h-4" />
                  Read
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-orange-600">
                  <Eye className="w-4 h-4" />
                  Unread
                </span>
              )}
            </div>
            {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-end space-x-4">
          {/* Approve/Reject for pending info_update_request */}
          {notification.type === 'info_update_request' && notification.status === 'pending' && (
            <>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            Close
          </button>
          {/* Only show Mark as Read and Delete if not pending */}
          {notification.status !== 'pending' && !notification.read && (
            <button
              onClick={handleMarkAsRead}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              {loading ? 'Processing...' : 'Mark as Read'}
            </button>
          )}
          {notification.status !== 'pending' && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-red-600 shadow-sm text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              {loading ? 'Processing...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};