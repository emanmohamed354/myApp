// contexts/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
        // Handle navigation based on notification data
      });

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    }
  }, [isAuthenticated]);

  const value = {
    expoPushToken,
    notification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

async function registerForPushNotificationsAsync() {
  let token;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  
  return token;
}