// screens/NotificationScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';

// Import components
import NotificationHeader from '../components/notifications/NotificationHeader';
import NotificationList from '../components/notifications/NotificationList';
import NotificationModal from '../components/notifications/NotificationModal';
import UnpairedState from '../components/notifications/UnpairedState';

export default function NotificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isCarPaired } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    error,
    loadNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotifications();
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    if (isCarPaired && !hasMarkedRef.current) {
      const unreadIds = notifications
        .filter(notif => !notif.isRead)
        .map(notif => notif.id);
      
      if (unreadIds.length > 0) {
        // Mark as read after a short delay
        const timer = setTimeout(() => {
          markAsRead(unreadIds);
          hasMarkedRef.current = true;
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, isCarPaired, markAsRead]);

  // Reset hasMarkedRef when leaving screen
  useEffect(() => {
    return () => {
      hasMarkedRef.current = false;
    };
  }, []);

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    
    if (!notification.isRead) {
      // Immediately mark as read when clicked
      markAsRead([notification.id]);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  if (!isCarPaired) {
    return <UnpairedState insets={insets} />;
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <NotificationHeader
        insets={insets}
        navigation={navigation}
        unreadCount={unreadCount}
        onMarkAllRead={markAllAsRead}
      />

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        onRefresh={loadNotifications}
        onNotificationPress={handleNotificationPress}
      />
      
      <NotificationModal
        visible={modalVisible}
        notification={selectedNotification}
        onClose={handleCloseModal}
        insets={insets}
      />
    </View>
  );
}