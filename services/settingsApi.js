// services/settingsApi.js
import api from './api';
import errorManager from './errorManager';

export const settingsApi = {
  updateSettings: async (userId, settings) => {
    try {
      console.log('settingsApi - Sending settings update to server...');
      const response = await api.patch('/api/auth/me/settings', { userId, settings });
      console.log('settingsApi - Response:', response);
      
      // Handle different response formats
      if (response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('settingsApi - Error:', error);
      errorManager.handleError(error, 'updateSettings');
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
  }
};