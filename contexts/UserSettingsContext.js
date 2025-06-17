// contexts/UserSettingsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { settingsApi } from '../services/settingsApi';

const UserSettingsContext = createContext({});

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within UserSettingsProvider');
  }
  return context;
};

export const UserSettingsProvider = ({ children }) => {
  const { userInfo, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState({
    units: 'imperial',
    language: 'en',
    aiChat: {
      language: 'en',
      voice: 'en-US-Standard-A'
    },
    theme: 'dark',
    dashboard: {
      selectedSensors: ['SPEED', 'RPM'],
      refreshRate: 500,
      showWarnings: true,
      autoScale: true,
      gaugeSize: 180
    },
    dataLogging: {
      enabled: false,
      interval: 1000,
      maxFileSize: 100
    }
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Helper to get user ID
  const getUserId = () => {
    return userInfo?.id || userInfo?.userId || userInfo?.sub;
  };

  // Load settings when user logs in
  useEffect(() => {
    const userId = getUserId();
    console.log('UserSettingsContext - User info:', userInfo);
    console.log('UserSettingsContext - User ID:', userId);
    
    if (isAuthenticated && userId) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, userInfo]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load from local cache only since there's no GET endpoint
      const cachedSettings = await AsyncStorage.getItem('userSettings');
      if (cachedSettings) {
        setSettings(JSON.parse(cachedSettings));
      }
    } catch (error) {
      console.error('Error loading cached settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    const previousSettings = settings;
    const userId = getUserId();
    
    // Optimistic update
    setSettings(newSettings);
    
    // Always save locally first
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings locally:', error);
    }
    
    // Try to sync with backend if user is authenticated
    if (userId && isAuthenticated) {
      setSyncing(true);
      try {
        console.log('Syncing settings with userId:', userId);
        await settingsApi.updateSettings(userId, newSettings);
      } catch (error) {
        // Don't rollback on sync failure - keep local changes
        console.warn('Settings sync failed, but local changes preserved:', error.message);
        // Only show error if it's not a 404 (missing endpoint)
        if (error.response?.status !== 404) {
          console.error('Settings sync error:', error);
        }
      } finally {
        setSyncing(false);
      }
    }
  };

  const updateSetting = async (path, value) => {
    const updateNestedObject = (obj, path, value) => {
      const keys = path.split('.');
      const newObj = { ...obj };
      let current = newObj;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newObj;
    };

    const newSettings = path.includes('.') 
      ? updateNestedObject(settings, path, value)
      : { ...settings, [path]: value };
    
    await updateSettings(newSettings);
  };

  const getSetting = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], settings);
  };

  const resetSettings = async () => {
    const defaultSettings = {
      units: 'imperial',
      language: 'en',
      aiChat: {
        language: 'en',
        voice: 'en-US-Standard-A'
      },
      theme: 'dark',
      dashboard: {
        selectedSensors: ['SPEED', 'RPM'],
        refreshRate: 500,
        showWarnings: true,
        autoScale: true,
        gaugeSize: 180
      },
      dataLogging: {
        enabled: false,
        interval: 1000,
        maxFileSize: 100
      }
    };
    
    await updateSettings(defaultSettings);
  };

  const value = {
    settings,
    loading,
    syncing,
    updateSettings,
    updateSetting,
    getSetting,
    resetSettings,
    reloadSettings: loadSettings
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};