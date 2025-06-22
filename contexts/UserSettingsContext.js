// contexts/UserSettingsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { settingsApi } from '../services/settingsApi';
import { authApi } from '../services/authApi';

const UserSettingsContext = createContext({});

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within UserSettingsProvider');
  }
  return context;
};

// Default settings with all required fields
const DEFAULT_SETTINGS = {
  units: 'imperial',
  language: 'en',
  aiChat: {
    language: 'en',
    voice: 'en-US-Standard-A',
    autoPlay: 'never'
  },
  theme: 'dark',
  dashboard: {
    selectedSensors: ['ENGINE_RPM', 'VEHICLE_SPEED'],
    refreshRate: 500,
    showWarnings: true,
    autoScale: true,
    gaugeSize: 180
  },
  notifications: {
    enabled: true,
    sound: false,
    vibration: true,
    criticalOnly: false
  },
  dataLogging: {
    enabled: false,
    interval: 1000,
    maxFileSize: 100
  },
  display: {
    keepScreenOn: false,
    brightness: 80,
    orientation: 'auto'
  }
};

export const UserSettingsProvider = ({ children }) => {
  const { userInfo, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
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
      // First, try to get settings from the user profile
      if (isAuthenticated && userInfo) {
        try {
          // Use the auth API to get the full profile including settings
          const profile = await authApi.getUserProfile();
          console.log('Profile fetched for settings:', profile);
          
          if (profile?.settings) {
            // Use profile settings as the source of truth
            const profileSettings = profile.settings;
            
            // Ensure all required fields exist by merging with defaults
            const mergedSettings = {
              ...DEFAULT_SETTINGS,
              ...profileSettings,
              aiChat: {
                ...DEFAULT_SETTINGS.aiChat,
                ...(profileSettings.aiChat || {})
              },
              dashboard: {
                ...DEFAULT_SETTINGS.dashboard,
                ...(profileSettings.dashboard || {})
              },
              notifications: {
                ...DEFAULT_SETTINGS.notifications,
                ...(profileSettings.notifications || {})
              },
              dataLogging: {
                ...DEFAULT_SETTINGS.dataLogging,
                ...(profileSettings.dataLogging || {})
              },
              display: {
                ...DEFAULT_SETTINGS.display,
                ...(profileSettings.display || {})
              }
            };
            
            console.log('Settings loaded from profile:', mergedSettings);
            setSettings(mergedSettings);
            
            // Cache the settings locally
            await AsyncStorage.setItem('userSettings', JSON.stringify(mergedSettings));
            return;
          } else {
            console.log('No settings in profile, using cached or defaults');
          }
        } catch (error) {
          console.log('Could not fetch profile settings:', error.message);
        }
      }

      // Fall back to cached settings if profile fetch fails or no settings in profile
      const cachedSettings = await AsyncStorage.getItem('userSettings');
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        // Merge with defaults to ensure all fields exist
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          aiChat: {
            ...DEFAULT_SETTINGS.aiChat,
            ...(parsed.aiChat || {})
          },
          dashboard: {
            ...DEFAULT_SETTINGS.dashboard,
            ...(parsed.dashboard || {})
          },
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(parsed.notifications || {})
          },
          dataLogging: {
            ...DEFAULT_SETTINGS.dataLogging,
            ...(parsed.dataLogging || {})
          },
          display: {
            ...DEFAULT_SETTINGS.display,
            ...(parsed.display || {})
          }
        };
        console.log('Settings loaded from cache:', mergedSettings);
        setSettings(mergedSettings);
      } else {
        console.log('No cached settings, using defaults');
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings on error
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    const userId = getUserId();
    
    console.log('updateSettings called with:', newSettings);
    
    // Ensure all required fields are present
    const completeSettings = {
      ...DEFAULT_SETTINGS,
      ...newSettings,
      aiChat: {
        ...DEFAULT_SETTINGS.aiChat,
        ...(newSettings.aiChat || {})
      },
      dashboard: {
        ...DEFAULT_SETTINGS.dashboard,
        ...(newSettings.dashboard || {})
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(newSettings.notifications || {})
      },
      dataLogging: {
        ...DEFAULT_SETTINGS.dataLogging,
        ...(newSettings.dataLogging || {})
      },
      display: {
        ...DEFAULT_SETTINGS.display,
        ...(newSettings.display || {})
      }
    };
    
    // Update state immediately (optimistic update)
    setSettings(completeSettings);
    
    // Always save locally first
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(completeSettings));
      console.log('Settings saved locally');
    } catch (error) {
      console.error('Error saving settings locally:', error);
    }
    
    // Try to sync with backend if user is authenticated
    if (userId && isAuthenticated) {
      setSyncing(true);
      try {
        console.log('Syncing settings with userId:', userId);
        console.log('Settings being sent:', JSON.stringify({
          userId,
          settings: completeSettings
        }, null, 2));
        
        const response = await settingsApi.updateSettings(userId, completeSettings);
        console.log('Settings sync response:', response);
        
        // If server returns updated settings, use them
        if (response?.settings) {
          setSettings(response.settings);
          await AsyncStorage.setItem('userSettings', JSON.stringify(response.settings));
        }
      } catch (error) {
        // Don't rollback on sync failure - keep local changes
        console.warn('Settings sync failed, but local changes preserved:', error.message);
        if (error.response) {
          console.error('Server response:', error.response.status, error.response.data);
        }
      } finally {
        setSyncing(false);
      }
    } else {
      console.log('Not syncing - userId:', userId, 'isAuthenticated:', isAuthenticated);
    }
  };

  const updateSetting = async (path, value) => {
    console.log('UserSettingsContext - updateSetting called:', path, value);
    
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
    
    console.log('UserSettingsContext - New settings after update:', newSettings);
    
    await updateSettings(newSettings);
  };

  const getSetting = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], settings);
  };

  const resetSettings = async () => {
    await updateSettings(DEFAULT_SETTINGS);
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