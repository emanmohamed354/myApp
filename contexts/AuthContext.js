// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../services/apiInstance';
import { authApi } from '../services/authApi';
import { STORAGE_KEYS } from '../Constants/storageKey';
import errorManager from '../services/errorManager';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [remoteToken, setRemoteToken] = useState(null);
  const [localToken, setLocalToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCarPaired, setIsCarPaired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const SYNC_DATA_KEY = '@vehicle_sync_data';
  const LAST_SYNC_KEY = '@last_sync_timestamp';
  const SENSOR_READINGS_KEY = '@sensor_readings_data';
  const DIAGNOSTICS_KEY = '@diagnostics_data';
  const EVENTS_KEY = '@events_data';
  // Refs to track refresh status
  const localTokenRefreshPromise = useRef(null);

  // Decode JWT token to extract user information
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      errorManager.handleError(error, 'decodeToken');
      return null;
    }
  };

  // Check if token is expired (with buffer time)
  const isTokenExpired = (tokenToCheck, bufferMinutes = 0) => {
    if (!tokenToCheck) return true;
    const payload = decodeToken(tokenToCheck);
    if (!payload || !payload.exp) return true;
    
    // Add buffer time to refresh before actual expiry
    const bufferMs = bufferMinutes * 60 * 1000;
    return Date.now() >= (payload.exp * 1000 - bufferMs);
  };

  // Get token expiry time
  const getTokenExpiryTime = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return null;
    return payload.exp * 1000;
  };

  // Check pairing status in AsyncStorage
  const checkPairingStatus = async () => {
    try {
      const storedPairingStatus = await AsyncStorage.getItem('isCarPaired');
      const storedLocalToken = await AsyncStorage.getItem('localAuthToken');
      
      // If pairing status changed
      if (storedPairingStatus === 'true' && !isCarPaired) {
        console.log('Pairing status changed externally, updating state');
        setIsCarPaired(true);
      }
      
      // If local token exists but not in state
      if (storedLocalToken && !localToken) {
        console.log('Local token found in storage but not in state, updating');
        setLocalToken(storedLocalToken);
      }
    } catch (error) {
      errorManager.handleError(error, 'checkPairingStatus');
    }
  };

  // Refresh local token when needed
  const refreshLocalTokenIfNeeded = async () => {
    if (isRefreshing || localTokenRefreshPromise.current) {
      return localTokenRefreshPromise.current;
    }

    if (!localToken || !isTokenExpired(localToken, 5)) {
      return localToken;
    }

    setIsRefreshing(true);
    
    localTokenRefreshPromise.current = (async () => {
      try {
        console.log('Refreshing local token...');
        const response = await authApi.refreshLocalToken();
        
        if (response.accessToken) {
          await saveLocalToken(response.accessToken);
          return response.accessToken;
        }
        throw new Error('No access token in refresh response');
      } catch (error) {
        // Handle error silently
        errorManager.handleError(error, 'refreshLocalToken');
        await clearLocalToken();
        return null;
      } finally {
        setIsRefreshing(false);
        localTokenRefreshPromise.current = null;
      }
    })();

    return localTokenRefreshPromise.current;
  };

  // Fetch user profile from remote backend
  const fetchUserProfile = async () => {
    try {
      const profile = await authApi.getUserProfile();
      console.log('User profile fetched:', profile);
      
      setUserInfo({
        id: profile.id,
        userId: profile.userId || profile.id,
        username: profile.firstName + ' ' + profile.lastName || profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
      });
      
      return profile;
    } catch (error) {
      // Handle error silently
      errorManager.handleError(error, 'fetchUserProfile');
      
      // If remote token is expired or invalid, clear everything silently
      if (error.response?.status === 401 || error.errorType === 'auth') {
        await clearToken();
        return;
      }
      
      // Fall back to token data
      if (remoteToken) {
        const payload = decodeToken(remoteToken);
        if (payload) {
          setUserInfo({
            id: payload.sub,
            userId: payload.sub,
            username: payload.sub || 'User',
          });
        }
      }
    }
  };

  // Complete the pairing flow
  const completePairing = async (carPayload) => {
    try {
      const result = await authApi.completePairingFlow(carPayload, (accessToken) => {
        // This callback will run when pairing completes successfully
        console.log('Pairing completed, updating local token and pairing status');
        setLocalToken(accessToken);
        setIsCarPaired(true);
      });
      return result;
    } catch (error) {
      errorManager.handleError(error, 'completePairing');
      throw error;
    }
  };

  // Initialize API instances and load auth data
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        // Initialize API instances first
        await apiInstance.initialize();
        // Then load auth data
        await loadAuthData();
      } catch (error) {
        errorManager.handleError(error, 'AuthContext.initialize');
        setLoading(false);
      }
    };

    initializeAndLoad();
  }, []);

  // Periodically check pairing status for external changes
  useEffect(() => {
    const interval = setInterval(checkPairingStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [isCarPaired, localToken]);

const loadAuthData = async () => {
  try {
    const savedRemoteToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const savedLocalToken = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_AUTH_TOKEN);
    const carPairingStatus = await AsyncStorage.getItem(STORAGE_KEYS.IS_CAR_PAIRED);
    
    if (!savedRemoteToken && !savedLocalToken) {
        console.log('No tokens — clearing sync data to be safe');
        try {
          // Clear sync data directly
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.SYNC_DATA_KEY,
            STORAGE_KEYS.LAST_SYNC_KEY,
            STORAGE_KEYS.SENSOR_READINGS_KEY,
            STORAGE_KEYS.DIAGNOSTICS_KEY,
            STORAGE_KEYS.EVENTS_KEY
          ]);
        } catch (error) {
          console.log('Error clearing sync data:', error);
        }
      }

      if (savedRemoteToken && !isTokenExpired(savedRemoteToken)) {
        setRemoteToken(savedRemoteToken);
        
        // Try to fetch user profile from backend
        await fetchUserProfile();
      } else {
        if (savedRemoteToken) {
          await AsyncStorage.removeItem('authToken');
        }
      }
      
      if (savedLocalToken) {
        // Check if local token needs refresh
        if (isTokenExpired(savedLocalToken, 5)) {
          try {
            await refreshLocalTokenIfNeeded();
          } catch (error) {
            errorManager.handleError(error, 'loadAuthData-refresh');
          }
        } else {
          setLocalToken(savedLocalToken);
        }
      }
      
      // Load car pairing status
      setIsCarPaired(carPairingStatus === 'true');
      
    } catch (error) {
      errorManager.handleError(error, 'loadAuthData');
    } finally {
      setLoading(false);
    }
  };
// In AuthContext.js
const saveToken = async (newToken) => {
  try {
    console.log('AuthContext - Saving token:', newToken);
    
    if (!newToken) {
      throw new Error('No token provided');
    }

    if (isTokenExpired(newToken)) {
      throw new Error('Token is already expired');
    }

    await AsyncStorage.setItem('authToken', newToken);
    setRemoteToken(newToken);
    console.log('AuthContext - Token saved, isAuthenticated should be true');
    
    // Fetch user profile after saving token
    await fetchUserProfile();
    
  } catch (error) {
    console.error('AuthContext - Error saving token:', error);
    errorManager.handleError(error, 'saveToken');
    throw error;
  }
};

  const saveLocalToken = async (newToken) => {
    try {
      if (!newToken) {
        throw new Error('No local token provided');
      }

      if (isTokenExpired(newToken)) {
        throw new Error('Local token is already expired');
      }

      await AsyncStorage.setItem('localAuthToken', newToken);
      setLocalToken(newToken);
      
      // Schedule next refresh
      scheduleLocalTokenRefresh(newToken);
    } catch (error) {
      errorManager.handleError(error, 'saveLocalToken');
      throw error;
    }
  };

  const setCarPaired = async (isPaired) => {
    try {
      await AsyncStorage.setItem('isCarPaired', isPaired ? 'true' : 'false');
      setIsCarPaired(isPaired);
    } catch (error) {
      errorManager.handleError(error, 'setCarPaired');
    }
  };

  const clearToken = async () => {
    try {
      await AsyncStorage.clear();
      setRemoteToken(null);
      setLocalToken(null);
      setUserInfo(null);
      setIsCarPaired(false);
    } catch (error) {
      errorManager.handleError(error, 'clearToken');
    }
  };

  // Clear only local token and unpair vehicle
  const clearLocalToken = async () => {
    try {
      await AsyncStorage.multiRemove([
        'localAuthToken', 
        'isCarPaired',
        'carRefreshToken',
        'payloadData'
      ]);
      setLocalToken(null);
      setIsCarPaired(false);
      // Keep remote token and user info intact
    } catch (error) {
      errorManager.handleError(error, 'clearLocalToken');
      throw error;
    }
  };

  // Schedule automatic token refresh
  const scheduleLocalTokenRefresh = (token) => {
    if (!token) return;

    const expiryTime = getTokenExpiryTime(token);
    if (!expiryTime) return;

    // Calculate when to refresh (5 minutes before expiry)
    const refreshTime = expiryTime - (5 * 60 * 1000);
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh > 0) {
      console.log(`Scheduling local token refresh in ${timeUntilRefresh / 1000 / 60} minutes`);
      
      setTimeout(async () => {
        try {
          await refreshLocalTokenIfNeeded();
        } catch (error) {
          errorManager.handleError(error, 'scheduleLocalTokenRefresh');
        }
      }, timeUntilRefresh);
    }
  };

  // Check token expiry periodically and handle automatic refresh
  useEffect(() => {
    const checkTokenExpiry = async () => {
      // Check remote token
      if (remoteToken && isTokenExpired(remoteToken)) {
        console.log('Remote token expired - clearing all tokens');
        await clearToken(); // Clear everything
        return;
      }
      
      // Check and refresh local token if needed
      if (localToken && isCarPaired) {
        try {
          if (isTokenExpired(localToken, 5)) {
            await refreshLocalTokenIfNeeded();
          }
        } catch (error) {
          errorManager.handleError(error, 'checkTokenExpiry');
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [remoteToken, localToken, isCarPaired]);

  // Add interceptor to handle token refresh on 401 errors
  useEffect(() => {
    if (!apiInstance.initialized || !apiInstance.localApi) return;

    const interceptorId = apiInstance.localApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If local API returns 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            localToken && 
            isCarPaired &&
            !originalRequest.url.includes('/auth/register') &&
            !originalRequest.url.includes('/auth/pairing-token')) {
          
          originalRequest._retry = true;

          try {
            const newToken = await refreshLocalTokenIfNeeded();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiInstance.localApi(originalRequest);
            }
          } catch (refreshError) {
            errorManager.handleError(refreshError, 'interceptor-refresh');
            await clearLocalToken();
            return Promise.reject(refreshError);
          }
        }

        // If remote API returns 401, clear everything
        if (error.response?.status === 401 && 
            apiInstance.remoteApi && 
            error.config.baseURL === apiInstance.remoteApi.defaults.baseURL) {
          console.log('Remote token invalid - clearing all tokens');
          await clearToken();
        }

        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      if (apiInstance.localApi) {
        apiInstance.localApi.interceptors.response.eject(interceptorId);
      }
    };
  }, [localToken, isCarPaired, apiInstance.initialized]);

const value = {
  token: remoteToken,
  remoteToken,
  localToken,
  userInfo,
  loading,
  isRefreshing,
  isAuthenticated: !!remoteToken && !isTokenExpired(remoteToken),
  isCarPaired, 
  isTokenExpired,
  saveToken,
  saveLocalToken,
  setCarPaired,
  logout: clearToken,
  clearLocalToken,
  refreshUserProfile: fetchUserProfile,
  refreshLocalToken: refreshLocalTokenIfNeeded,
  checkPairingStatus,
  completePairing
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};