// hooks/useSettings.js
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings } from '../contexts/UserSettingsContext';

export const useSettings = (navigation) => {
  const { isCarPaired, userInfo, remoteToken, logout, clearLocalToken } = useAuth();
  const { settings, updateSetting, syncing, loading } = useUserSettings();

  useEffect(() => {
    console.log('useSettings - Current settings:', settings);
  }, [settings]);

  useEffect(() => {
    console.log('SettingsScreen - UserInfo:', userInfo);
    console.log('SettingsScreen - RemoteToken exists:', !!remoteToken);
  }, [userInfo, remoteToken]);

  // Navigate away from Settings when car is unpaired
  useEffect(() => {
    if (!isCarPaired) {
      navigation.navigate('Home');
    }
  }, [isCarPaired, navigation]);

  // Wrap updateSetting to add logging
  const wrappedUpdateSetting = (path, value) => {
    console.log('useSettings - Updating setting:', path, 'to:', value);
    return updateSetting(path, value);
  };

  return {
    isCarPaired,
    settings,
    updateSetting: wrappedUpdateSetting,
    syncing,
    loading,
    logout,
    clearLocalToken
  };
};