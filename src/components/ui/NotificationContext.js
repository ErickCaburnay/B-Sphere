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
        const residentId = userData.residentId || userData.id;
        params.append('targetRole', 'resident');
        if (residentId) {
          params.append('residentId', residentId);
        }
      } else {
        // Admin notifications
        params.append('targetRole', 'admin');
      }

      const response = await fetch(`/api/notifications?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadCount: 0, pagination: { total: 0, hasMore: false } };
    }
  }, []);

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotifications({ limit: 10 });
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    setLoading(false);
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
      const response = await fetch(`/api/notifications?id=${notificationId}&action=markRead`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, seen: true }
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
          prev.map(notif => ({ ...notif, seen: true }))
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
        
        if (deletedNotification && !deletedNotification.seen) {
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
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [fetchNotifications]);

  // Initialize notifications on mount only
  useEffect(() => {
    loadNotifications();
  }, []); // Empty dependency array - only run once

  // Set up polling interval
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications();
    }, 60000); // Poll every 60 seconds (reduced frequency)

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    loadNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 