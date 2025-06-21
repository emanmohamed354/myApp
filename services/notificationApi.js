// services/notificationApi.js
import api from './api';

export const notificationApi = {
  // Get recent notifications - primary endpoint
  getRecentNotifications: async (limit = 50) => {
    try {
      const response = await api.get(`/api/notifications/recent?limit=${limit}`, {
        timeout: 10000,
      });
      console.log('Notifications fetched:', response?.length || 0);
      return response || [];
    } catch (error) {
      
      // Return empty array instead of throwing for better UX
      if (error.response?.status === 404 || error.response?.status === 401) {
        return [];
      }
      
      throw error;
    }
  },

  // Mark notifications as read - updated to match backend format
  markAsRead: async (notificationIds) => {
    try {
      const idsArray = Array.isArray(notificationIds)
        ? notificationIds
        : [notificationIds];
      
      // Skip if no IDs provided
      if (idsArray.length === 0) {
        return;
      }
      
      console.log('Marking as read, sending IDs:', idsArray);
      
      // Backend expects { ids: [...] } format
      const payload = {
        ids: idsArray
      };
      
      console.log('Payload being sent:', JSON.stringify(payload));
      
      return await api.patch(
        '/api/notifications/read',
        payload,
        {
          timeout: 10000,
        }
      );
    } catch (error) {
      // Check if it's a 500 error and log more details
      if (error.response?.status === 500) {

      } else if (error.response?.status === 404) {
        console.warn('Mark as read endpoint not found');
      } else {
      }
      
      // Don't throw - let the UI continue working
      return null;
    }
  },
};