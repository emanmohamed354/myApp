// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { authApi } from '../services/authApi';

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
      console.error('Error decoding token:', error);
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

  // NEW FUNCTION: Check pairing status in AsyncStorage
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
      console.error('Error checking pairing status:', error);
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
        console.error('Failed to refresh local token:', error);
        // Clear local token if refresh fails
        await clearLocalToken();
        throw error;
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
      const profile = await api.get('/auth/me');
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
      console.error('Error fetching user profile:', error);
      
      // If remote token is expired or invalid, clear everything
      if (error.response?.status === 401) {
        await clearToken();
        return;
      }
      
      // Fall back to token data
      const payload = decodeToken(remoteToken);
      if (payload) {
        setUserInfo({
          id: payload.sub,
          userId: payload.sub,
          username: payload.sub || 'User',
        });
      }
    }
  };

  // NEW FUNCTION: Complete the pairing flow
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
      console.error('Error in completePairing:', error);
      throw error;
    }
  };

  // Load tokens and pairing status from storage on app start
  useEffect(() => {
    loadAuthData();
  }, []);

  // Periodically check pairing status for external changes
  useEffect(() => {
    const interval = setInterval(checkPairingStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [isCarPaired, localToken]);

  const loadAuthData = async () => {
    try {
      const savedRemoteToken = await AsyncStorage.getItem('authToken');
      const savedLocalToken = await AsyncStorage.getItem('localAuthToken');
      const carPairingStatus = await AsyncStorage.getItem('isCarPaired');
      
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
            console.error('Failed to refresh local token on load');
          }
        } else {
          setLocalToken(savedLocalToken);
        }
      }
      
      // Load car pairing status
      setIsCarPaired(carPairingStatus === 'true');
      
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToken = async (newToken) => {
    try {
      if (!newToken) {
        throw new Error('No token provided');
      }

      if (isTokenExpired(newToken)) {
        throw new Error('Token is already expired');
      }

      await AsyncStorage.setItem('authToken', newToken);
      setRemoteToken(newToken);
      
      // Fetch user profile after saving token
      await fetchUserProfile();
      
    } catch (error) {
      console.error('Error saving token:', error);
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
      console.error('Error saving local token:', error);
      throw error;
    }
  };

  const setCarPaired = async (isPaired) => {
    try {
      await AsyncStorage.setItem('isCarPaired', isPaired ? 'true' : 'false');
      setIsCarPaired(isPaired);
    } catch (error) {
      console.error('Error saving car pairing status:', error);
    }
  };

  const clearToken = async () => {
    try {
      await AsyncStorage.multiRemove([
        'authToken', 
        'localAuthToken', 
        'isCarPaired',
        'carRefreshToken',
        'payloadData'
      ]);
      setRemoteToken(null);
      setLocalToken(null);
      setUserInfo(null);
      setIsCarPaired(false);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // New function to clear only local token and unpair vehicle
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
      console.error('Error clearing local token:', error);
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
          console.error('Scheduled token refresh failed:', error);
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
        await clearToken(); // Clear everything if remote token expires
        return;
      }
      
      // Check and refresh local token if needed
      if (localToken && isCarPaired) {
        try {
          if (isTokenExpired(localToken, 5)) {
            await refreshLocalTokenIfNeeded();
          }
        } catch (error) {
          console.error('Failed to refresh local token in periodic check');
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [remoteToken, localToken, isCarPaired]);

  // Add interceptor to handle token refresh on 401 errors
  useEffect(() => {
    if (!api.localApi) return;

    const interceptorId = api.localApi.interceptors.response.use(
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
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api.localApi(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear local token
            await clearLocalToken();
            return Promise.reject(refreshError);
          }
        }

        // If remote API returns 401, clear everything
        if (error.response?.status === 401 && error.config.baseURL === api.remoteApi.defaults.baseURL) {
          console.log('Remote token invalid - clearing all tokens');
          await clearToken();
        }

        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      api.localApi.interceptors.response.eject(interceptorId);
    };
  }, [localToken, isCarPaired]);

  const value = {
    // Backward compatibility
    token: remoteToken,
    
    // New token management
    remoteToken,
    localToken,
    
    // User info
    userInfo,
    loading,
    isRefreshing,
    
    // Authentication states
    isAuthenticated: !!remoteToken && !isTokenExpired(remoteToken),
    isCarPaired,
    
    // Token utilities
    isTokenExpired,
    
    // Actions
    saveToken,
    saveLocalToken,
    setCarPaired,
    logout: clearToken,
    clearLocalToken,
    refreshUserProfile: fetchUserProfile,
    refreshLocalToken: refreshLocalTokenIfNeeded,
    checkPairingStatus, // Added this
    completePairing    // Added this
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};