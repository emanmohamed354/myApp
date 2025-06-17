// hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../services/notificationApi';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isCarPaired } = useAuth();

  const loadNotifications = useCallback(async () => {
    if (!isCarPaired) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Only use the recent endpoint
      const recentNotifications = await notificationApi.getRecentNotifications(50);
      setNotifications(recentNotifications || []);
      
      // Calculate unread count from the fetched notifications (using isRead field)
      const unread = (recentNotifications || []).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isCarPaired]);

  useEffect(() => {
    if (isCarPaired) {
      loadNotifications();
      
      // Refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isCarPaired, loadNotifications]);

  const markAsRead = useCallback(async (notificationIds) => {
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) 
            ? { ...n, isRead: true }
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      
      // Try to sync with backend (but don't fail if it errors)
      await notificationApi.markAsRead(notificationIds);
    } catch (err) {
      // Error already logged in notificationApi
      // UI update remains even if backend fails
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }, [notifications, markAsRead]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
};