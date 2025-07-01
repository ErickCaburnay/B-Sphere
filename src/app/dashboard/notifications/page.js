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

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMoreNotifications
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
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.seen) ||
                         (filterStatus === 'unread' && !notification.seen);
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

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
    const allIds = filteredNotifications.map(n => n.id);
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
    if (!notification.seen) {
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
              Notifications ({filteredNotifications.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={filteredNotifications.length > 0 ? handleSelectAll : undefined}
                disabled={filteredNotifications.length === 0}
                className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Select All
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
          ) : filteredNotifications.length === 0 ? (
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
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.seen ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
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
                      {!notification.seen && (
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
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
        <div className="p-6 max-h-96 overflow-y-auto">
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
            {notification.data && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Additional Information</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(notification.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Read Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Read Status:</span>
              {notification.seen ? (
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
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          
          {!notification.seen && (
            <button
              onClick={handleMarkAsRead}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Mark as Read'}
            </button>
          )}
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};