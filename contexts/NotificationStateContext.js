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
  const { isCarPaired, isAuthenticated, localToken } = useAuth(); // Add localToken

  const loadNotifications = useCallback(async () => {
    // Don't load if not authenticated or no local token
    if (!isAuthenticated && !isCarPaired && !localToken) {
      console.log('Skipping notifications - not ready');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationApi.getRecentNotifications(50);

      // Ensure we always work with arrays
      const notificationsArray = Array.isArray(response) ? response : [];

      setNotifications(notificationsArray);

      const unread = notificationsArray.filter(n => n && !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log('Notification load error:', err.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isCarPaired, isAuthenticated, localToken]);

  // Update effect dependencies
  useEffect(() => {
    loadNotifications();

    if (isAuthenticated && isCarPaired && localToken) {
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isCarPaired, isAuthenticated, localToken, loadNotifications]);

  // Fix markAsRead to handle edge cases
  const markAsRead = useCallback(async (notificationIds) => {
    try {
      const idsArray = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

      if (idsArray.length === 0) return;

      // Update local state immediately
      setNotifications(prev =>
        prev.map(n =>
          idsArray.includes(n.id) ? { ...n, isRead: true } : n
        )
      );

      // Update unread count
      setUnreadCount(prev => {
        const markedCount = notifications.filter(n =>
          !n.isRead && idsArray.includes(n.id)
        ).length;
        return Math.max(0, prev - markedCount);
      });

      // Sync with backend (don't await)
      if (isAuthenticated && localToken) {
        notificationApi.markAsRead(idsArray).catch(err => {
          console.log('Mark as read sync failed:', err.message);
        });
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, [notifications, isAuthenticated, localToken]);

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