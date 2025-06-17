// hooks/useNotificationPermissions.js
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const useNotificationPermissions = () => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    if (!isExpoGo) {
      checkPermissions();
    }
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.log('Notification permissions not available in Expo Go');
    }
  };

  const requestPermissions = async () => {
    if (isExpoGo) {
      console.warn('Push notifications are not fully supported in Expo Go. Use a development build.');
      return 'denied';
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted' && Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return status;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return 'denied';
    }
  };

  const openSettings = () => {
    if (!isExpoGo) {
      Notifications.openSettingsAsync();
    }
  };

  return {
    permissionStatus,
    requestPermissions,
    openSettings,
    checkPermissions,
    isExpoGo,
  };
};