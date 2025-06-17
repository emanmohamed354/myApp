// services/syncService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const SYNC_DATA_KEY = '@vehicle_sync_data';
const LAST_SYNC_KEY = '@last_sync_timestamp';
const SENSOR_READINGS_KEY = '@sensor_readings_data';

export const syncService = {
  // Sync data from server and save locally
  syncData: async () => {
    try {
      const response = await api.get('/api/sync');
      console.log('Sync API Response:', response);
      
      // Save the entire response
      if (response) {
        await AsyncStorage.setItem(SYNC_DATA_KEY, JSON.stringify(response));
        
        // Save readings separately if they exist
        if (response.readings) {
          await AsyncStorage.setItem(SENSOR_READINGS_KEY, JSON.stringify(response.readings));
        }
        
        await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  },

  // Get sensor readings
  getSensorReadings: async () => {
    try {
      const data = await AsyncStorage.getItem(SENSOR_READINGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sensor readings:', error);
      return [];
    }
  },

  // Get locally stored sync data
  getLocalSyncData: async () => {
    try {
      const data = await AsyncStorage.getItem(SYNC_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting local sync data:', error);
      return null;
    }
  },

  // Get last sync timestamp
  getLastSyncTime: async () => {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  },

  // Clear sync data (used when unpairing)
  clearSyncData: async () => {
    try {
      await AsyncStorage.multiRemove([SYNC_DATA_KEY, LAST_SYNC_KEY, SENSOR_READINGS_KEY]);
    } catch (error) {
      console.error('Error clearing sync data:', error);
    }
  },

  // Check if sync is needed (e.g., older than 1 hour)
  needsSync: async () => {
    const lastSync = await syncService.getLastSyncTime();
    if (!lastSync) return true;
    
    const hoursSinceSync = (new Date() - lastSync) / (1000 * 60 * 60);
    return hoursSinceSync > 1;
  }
};