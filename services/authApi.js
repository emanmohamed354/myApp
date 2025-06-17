// services/authApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const authApi = {
  // Remote endpoints
  registerUser: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.accessToken) {
      await AsyncStorage.setItem('authToken', response.accessToken);
    }
    return response;
  },

  remoteLogin: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.accessToken) {
      await AsyncStorage.setItem('authToken', response.accessToken);
    }
    return response;
  },

  getUserProfile: async () => {
    return await api.get('/auth/me');
  },

  verifyPairing: async (token, payload) => {
    return await api.post('/auth/verify-pairing', { token, payload });
  },

  // Local endpoints
  updateSettings: async (userId, settings) => {
    return await api.patch('/api/auth/me/settings', { userId, settings });
  },

  getPairingToken: async () => {
    // This doesn't need auth
    return await api.get('/api/auth/pairing-token');
  },

  // New method to register/refresh local token
  registerLocalToken: async (carRefreshToken, payloadData) => {
    const response = await api.post('/api/auth/register', { 
      carRefreshToken, 
      payloadData 
    });
    
    if (response.accessToken) {
      await AsyncStorage.setItem('localAuthToken', response.accessToken);
      return response;
    }
    
    throw new Error('No access token in register response');
  },

  // Add onPairingComplete callback parameter
  completePairingFlow: async (carPayload, onPairingComplete) => {
    try {
      console.log('Starting pairing flow...');
      
      // Step 1: Get pairing token from local backend (no auth needed)
      console.log('Step 1: Getting pairing token from local backend...');
      const pairingTokenResponse = await api.get('/api/auth/pairing-token');
      console.log('Pairing token response:', pairingTokenResponse);
      
      const pairingToken = pairingTokenResponse.token;
      
      if (!pairingToken) {
        console.error('Invalid pairing token response:', pairingTokenResponse);
        throw new Error('Failed to get pairing token');
      }
      
      console.log('Got pairing token:', pairingToken);
      
      // Step 2: Verify pairing on remote backend (uses remote token)
      console.log('Step 2: Verifying pairing with remote backend...');
      const verifyResponse = await authApi.verifyPairing(pairingToken, carPayload);
      console.log('Verify response:', verifyResponse);
      
      if (!verifyResponse.payloadData || !verifyResponse.carRefreshToken) {
        console.error('Invalid verify response:', verifyResponse);
        throw new Error('Invalid response from verify pairing');
      }
      
      // Step 3: Register local token using the carRefreshToken and payloadData
      console.log('Step 3: Registering with local backend...');
      const tokenResponse = await authApi.registerLocalToken(
        verifyResponse.carRefreshToken,
        verifyResponse.payloadData
      );
      
      if (!tokenResponse.accessToken) {
        console.error('No access token in response:', tokenResponse);
        throw new Error('Failed to get local access token');
      }
      
      // Store refresh token and payload data for future use
      await AsyncStorage.setItem('carRefreshToken', verifyResponse.carRefreshToken);
      await AsyncStorage.setItem('payloadData', JSON.stringify(verifyResponse.payloadData));
      await AsyncStorage.setItem('isCarPaired', 'true');
      
      console.log('Pairing flow completed successfully');
      
      // Call the callback to update auth context immediately if provided
      if (typeof onPairingComplete === 'function') {
        onPairingComplete(tokenResponse.accessToken);
      }
      
      return {
        success: true,
        accessToken: tokenResponse.accessToken,
        message: 'Car paired successfully'
      };
      
    } catch (error) {
      console.error('Pairing flow failed:', error);
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
      console.error('Failed to refresh local token:', error);
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove([
      'authToken', 
      'localAuthToken', 
      'isCarPaired',
      'carRefreshToken',
      'payloadData'
    ]);
  },
};