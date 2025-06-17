// utils/offlineManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export class OfflineManager {
  static CACHE_PREFIX = '@cache_';
  static QUEUE_KEY = '@offline_queue';

  static async cacheData(key, data, expiryMinutes = 60) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + (expiryMinutes * 60 * 1000),
    };
    
    await AsyncStorage.setItem(
      `${this.CACHE_PREFIX}${key}`,
      JSON.stringify(cacheData)
    );
  }

  static async getCachedData(key) {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, expiry } = JSON.parse(cached);
      
      if (Date.now() > expiry) {
        await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  static async queueAction(action) {
    const queue = await this.getQueue();
    queue.push({
      ...action,
      timestamp: Date.now(),
      id: `${Date.now()}_${Math.random()}`,
    });
    
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static async getQueue() {
    try {
      const queue = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  }

  static async processQueue() {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    const queue = await this.getQueue();
    const processed = [];

    for (const action of queue) {
      try {
        await this.executeAction(action);
        processed.push(action.id);
      } catch (error) {
        console.error('Error processing queued action:', error);
      }
    }

    // Remove processed actions
    const remainingQueue = queue.filter(action => !processed.includes(action.id));
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(remainingQueue));
  }

  static async executeAction(action) {
    // Implement based on action type
    switch (action.type) {
      case 'BOOK_APPOINTMENT':
        // Call appointment API
        break;
      case 'UPDATE_SETTINGS':
        // Update user settings
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }
}