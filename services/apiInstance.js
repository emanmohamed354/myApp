import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';

class ApiInstance {
  constructor() {
    this.remoteApi = null;
    this.localApi = null;
    this.initialized = false;
  }

  // services/apiInstance.js
  async initialize() {
    if (this.initialized) return;

    try {
      const remoteUrl = await Config.getRemoteApiUrl();
      const localUrl = await Config.getLocalApiUrl();

      // Remote API instance
      this.remoteApi = axios.create({
        baseURL: remoteUrl,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Local API instance with shorter timeout
      this.localApi = axios.create({
        baseURL: localUrl,
        timeout: 3000, // 3 seconds for local connection test
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.initialized = true;
      console.log('API instances initialized');
    } catch (error) {
    }
  }

  getRemoteApi() {
    if (!this.remoteApi) {
      throw new Error('Remote API not initialized');
    }
    return this.remoteApi;
  }

  getLocalApi() {
    if (!this.localApi) {
      throw new Error('Local API not initialized');
    }
    return this.localApi;
  }

  updateLocalBaseUrl(newUrl) {
    if (this.localApi) {
      this.localApi.defaults.baseURL = newUrl;
    }
  }
}

export default new ApiInstance();