"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (options = {}) => {
    try {
      const { limit = 10, offset = 0, unreadOnly = false } = options;
      
      // Detect if we're on admin or resident dashboard
      const isResidentDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/resident-dashboard');
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        unreadOnly: unreadOnly.toString()
      });
      
      if (isResidentDashboard) {
        // Get current user ID for resident notifications
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
        
        // Try multiple possible fields for resident ID
        const residentId = userData.uniqueId || userData.residentId || userData.id || userData.uid;
  
        
        params.append('targetRole', 'resident');
        if (residentId) {
          params.append('residentId', residentId);
        } else {
          console.warn('No resident ID found for resident dashboard. Available fields:', Object.keys(userData));
          // Don't return early, just continue without residentId filter
  
        }
      } else {
        // Admin notifications
        params.append('targetRole', 'admin');
      }

      const url = `/api/notifications?${params.toString()}`;

      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, response.statusText, errorText);
        // Don't throw error, just return empty result
        
        return { notifications: [], unreadCount: 0, pagination: { total: 0, hasMore: false } };
      }
      
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      console.error('Full error:', error);
      
      // Return empty result but don't completely fail
      return { notifications: [], unreadCount: 0, pagination: { total: 0, hasMore: false } };
    }
  }, []);

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  // Load more notifications (for pagination)
  const loadMoreNotifications = useCallback(async () => {
    const data = await fetchNotifications({ 
      limit: 10, 
      offset: notifications.length 
    });
    setNotifications(prev => [...prev, ...(data.notifications || [])]);
    return data.pagination?.hasMore || false;
  }, [fetchNotifications, notifications.length]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?action=markAllRead', {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Create new notification
  const createNotification = useCallback(async (notificationData) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });
      
      if (response.ok) {
        const newNotification = await response.json();
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        return newNotification;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, []);

  // Refresh notifications manually
  const refreshNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setError('Failed to refresh notifications');
      // Don't throw error, just log it to prevent UI breaking
    }
  }, [fetchNotifications]);

  // Initialize notifications on mount only
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]); // Include loadNotifications in dependencies

  // Set up adaptive polling interval
  useEffect(() => {
    let interval;
    
    const startPolling = () => {
      // Check if page is visible and user is active
      const isVisible = !document.hidden;
      const pollingInterval = isVisible ? 15000 : 60000; // 15 seconds when active, 1 minute when hidden
      
      interval = setInterval(() => {
        if (!document.hidden) {
          refreshNotifications();
        }
      }, pollingInterval);
    };
    
    // Start initial polling
    startPolling();
    
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      clearInterval(interval);
      startPolling();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for focus events for immediate refresh
    const handleFocus = () => {
      refreshNotifications();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    loadNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications
  };

  // Expose refreshNotifications globally for other components to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.notificationContext = {
        refreshNotifications
      };
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.notificationContext) {
        delete window.notificationContext;
      }
    };
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 