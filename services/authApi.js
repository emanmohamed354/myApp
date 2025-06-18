// services/authApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import errorManager from './errorManager';
import {
  SYNC_DATA_KEY,
  LAST_SYNC_KEY,
  SENSOR_READINGS_KEY,
  DIAGNOSTICS_KEY,
  EVENTS_KEY
} from './syncService';
export const authApi = {
  
  // Remote endpoints
  registerUser: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const accessToken = response.data?.accessToken || response.accessToken;
      if (accessToken) {
        await AsyncStorage.setItem('authToken', accessToken);
        return { accessToken };
      }
      throw new Error('No access token in response');
    } catch (error) {
      errorManager.handleError(error, 'registerUser');
      throw error;
    }
  },

  remoteLogin: async (credentials) => {
    try {
      console.log('Attempting remote login with credentials:', { username: credentials.username });
      const response = await api.post('/auth/login', credentials);
      console.log('Login API response:', response);
      
      const accessToken = response.data?.accessToken || response.accessToken;
      
      if (accessToken) {
        await AsyncStorage.setItem('authToken', accessToken);
        return { accessToken };
      }
      
      throw new Error('No access token in response');
    } catch (error) {

      errorManager.handleError(error, 'remoteLogin');
      throw error;
    }
  },

  getUserProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data || response;
    } catch (error) {
      errorManager.handleError(error, 'getUserProfile');
      throw error;
    }
  },

  verifyPairing: async (token, payload) => {
    try {
      return await api.post('/auth/verify-pairing', { token, payload });
    } catch (error) {
      errorManager.handleError(error, 'verifyPairing');
      throw error;
    }
  },

  // Local endpoints
  updateSettings: async (userId, settings) => {
    try {
      return await api.patch('/api/auth/me/settings', { userId, settings });
    } catch (error) {
      errorManager.handleError(error, 'updateSettings');
      throw error;
    }
  },

  getPairingToken: async () => {
    try {
      return await api.get('/api/auth/pairing-token');
    } catch (error) {
      errorManager.handleError(error, 'getPairingToken');
      throw error;
    }
  },

  // Register/refresh local token
  registerLocalToken: async (carRefreshToken, payloadData) => {
    try {
      const response = await api.post('/api/auth/register', {
        carRefreshToken,
        payloadData
      });

      if (response.accessToken) {
        await AsyncStorage.setItem('localAuthToken', response.accessToken);
        return response;
      }
      
      throw new Error('No access token in register response');
    } catch (error) {
      errorManager.handleError(error, 'registerLocalToken');
      throw error;
    }
  },

  // Complete pairing flow with error handling
  completePairingFlow: async (carPayload, onPairingComplete) => {
    try {
      console.log('Starting pairing flow...');

      // Step 1: Get pairing token from local backend
      console.log('Step 1: Getting pairing token from local backend...');
      const pairingTokenResponse = await api.get('/api/auth/pairing-token');
      console.log('Pairing token response:', pairingTokenResponse);
      
      const pairingToken = pairingTokenResponse.token;
      
      if (!pairingToken) {;
        throw new Error('Failed to get pairing token');
      }
      
      console.log('Got pairing token:', pairingToken);
      
      // Step 2: Verify pairing on remote backend
      console.log('Step 2: Verifying pairing with remote backend...');
      const verifyResponse = await authApi.verifyPairing(pairingToken, carPayload);
      console.log('Verify response:', verifyResponse);
      
      if (!verifyResponse.payloadData || !verifyResponse.carRefreshToken) {
        throw new Error('Invalid response from verify pairing');
      }
      
      // Step 3: Register local token
      console.log('Step 3: Registering with local backend...');
      const tokenResponse = await authApi.registerLocalToken(
        verifyResponse.carRefreshToken,
        verifyResponse.payloadData
      );
      
      if (!tokenResponse.accessToken) {
        throw new Error('Failed to get local access token');
      }
      
      // Store refresh token and payload data
      await AsyncStorage.setItem('carRefreshToken', verifyResponse.carRefreshToken);
      await AsyncStorage.setItem('payloadData', JSON.stringify(verifyResponse.payloadData));
      await AsyncStorage.setItem('isCarPaired', 'true');
      
      console.log('Pairing flow completed successfully');
      
      // Call the callback to update auth context
      if (typeof onPairingComplete === 'function') {
        onPairingComplete(tokenResponse.accessToken);
      }
      
      return {
        success: true,
        accessToken: tokenResponse.accessToken,
        message: 'Car paired successfully'
      };
      
    } catch (error) {
      errorManager.handleError(error, 'completePairingFlow');
      throw error;
    }
  },

  // Refresh local token when it expires
  refreshLocalToken: async () => {
    try {
      const carRefreshToken = await AsyncStorage.getItem('carRefreshToken');
      const payloadDataStr = await AsyncStorage.getItem('payloadData');

      if (!carRefreshToken || !payloadDataStr) {
        throw new Error('No refresh token or payload data found');
      }
      
      const payloadData = JSON.parse(payloadDataStr);
      const response = await authApi.registerLocalToken(carRefreshToken, payloadData);
      
      return response;
    } catch (error) {
      errorManager.handleError(error, 'refreshLocalToken');
      throw error;
    }
  },

  logout: async () => {
   
    try {
        console.log('LOGOUT: Clearing AsyncStorage...');
        await AsyncStorage.clear();
        console.log('LOGOUT COMPLETE');

    } catch (error) {
      errorManager.handleError(error, 'logout');
      throw error;
    }
  },
};
export default authApi;