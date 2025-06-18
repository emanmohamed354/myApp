// contexts/NotificationStateContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../services/notificationApi';
import { useAuth } from './AuthContext';

const NotificationStateContext = createContext({});

export const useNotificationState = () => {
  const context = useContext(NotificationStateContext);
  if (!context) {
    throw new Error('useNotificationState must be used within NotificationStateProvider');
  }
  return context;
};

export const NotificationStateProvider = ({ children }) => {
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
      const recentNotifications = await notificationApi.getRecentNotifications(50);
      setNotifications(recentNotifications || []);
      
      // Calculate unread count from the fetched notifications
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
      // Immediately update UI
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) 
            ? { ...n, isRead: true }
            : n
        )
      );
      
      // Immediately update unread count
      const newUnreadCount = notifications.filter(n => 
        !n.isRead && !notificationIds.includes(n.id)
      ).length;
      setUnreadCount(newUnreadCount);
      
      // Sync with backend (fire and forget)
      notificationApi.markAsRead(notificationIds).catch(err => {
        console.error('Failed to sync read status:', err);
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  }, [notifications, markAsRead]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationStateContext.Provider value={value}>
      {children}
    </NotificationStateContext.Provider>
  );
};