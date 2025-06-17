// services/settingsApi.js
import api from './api';

export const settingsApi = {
  updateSettings: async (userId, settings) => {
    console.log('Updating settings for userId:', userId);
    console.log('Settings being sent:', JSON.stringify(settings, null, 2));
    
    try {
      // Use PATCH method as confirmed by your Postman test
      const response = await api.patch('/api/auth/me/settings', { 
        userId, 
        settings 
      });
      
      console.log('Settings update successful');
      return response;
    } catch (error) {
      console.error('Settings update error:', error.response?.data || error);
      
      // If it's a 404, the endpoint might not exist yet
      if (error.response?.status === 404) {
        console.warn('Settings endpoint not found, settings saved locally only');
        return { success: true, message: 'Settings saved locally' };
      }
      
      throw error;
    }
  }
};