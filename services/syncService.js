// services/syncService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS } from '../Constants/storageKey';

const SYNC_DATA_KEY = '@vehicle_sync_data';
const LAST_SYNC_KEY = '@last_sync_timestamp';
const SENSOR_READINGS_KEY = '@sensor_readings_data';
const DIAGNOSTICS_KEY = '@diagnostics_data';
const EVENTS_KEY = '@events_data';

export const syncService = {
  // Get sync data from local API (when paired)
 getLocalSyncDataFromAPI: async () => {
    try {
      const response = await api.get('/api/sync');
      console.log('Local sync GET response:', response);
      
      if (response) {
        await syncService.saveLocalSyncData(response);
        return response;
      }
      return null;
    } catch (error) {
      console.error('Error getting sync data from local API:', error);
      throw error;
    }
  },

  // Sync data to remote server (when unpaired)
  syncToRemote: async () => {
    try {
      // Get stored sync data
      const storedData = await syncService.getLocalSyncData();
      
      const payload = {
        readings: storedData?.readings || [],
        diagnostics: storedData?.diagnostics || [],
        events: storedData?.events || []
      };

      console.log('Syncing to remote with payload:', payload);
      
      // POST request to remote API (not /api prefix)
      const response = await api.post('/sync', payload);
      
      console.log('Remote sync POST response:', response);
      
      return response;
    } catch (error) {
      console.error('Error syncing to remote:', error);
      throw error;
    }
  },

  // Save sync data locally
  saveLocalSyncData: async (data) => {
    try {
      await AsyncStorage.setItem(SYNC_DATA_KEY, JSON.stringify(data));
      
      if (data.readings) {
        await AsyncStorage.setItem(SENSOR_READINGS_KEY, JSON.stringify(data.readings));
      }
      
      if (data.diagnostics) {
        await AsyncStorage.setItem(DIAGNOSTICS_KEY, JSON.stringify(data.diagnostics));
      }
      
      if (data.events) {
        await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(data.events));
      }
      
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving sync data:', error);
      throw error;
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

  // Get diagnostics
  getDiagnostics: async () => {
    try {
      const data = await AsyncStorage.getItem(DIAGNOSTICS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting diagnostics:', error);
      return [];
    }
  },

  // Get events
  getEvents: async () => {
    try {
      const data = await AsyncStorage.getItem(EVENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
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
      await AsyncStorage.multiRemove([
        SYNC_DATA_KEY, 
        LAST_SYNC_KEY, 
        SENSOR_READINGS_KEY,
        DIAGNOSTICS_KEY,
        EVENTS_KEY
      ]);
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