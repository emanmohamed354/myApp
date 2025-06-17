// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';

class ApiService {
  constructor() {
    this.initializeApis();
    this.setupInterceptors();
  }

  async initializeApis() {
    // Get saved IP or use default
    const localApiUrl = await Config.getLocalApiUrl();
    
    this.localApi = axios.create({
      baseURL: localApiUrl,
      timeout: 30000,
    });
    
    this.remoteApi = axios.create({
      baseURL: Config.remoteUrl,
      timeout: 30000,
    });
  }

  // Add method to update base URL dynamically
  updateBaseUrl(newUrl) {
    if (this.localApi) {
      this.localApi.defaults.baseURL = newUrl;
    }
  }

  setupInterceptors() {
    // Wait for APIs to be initialized
    setTimeout(() => {
      if (!this.localApi || !this.remoteApi) return;

      // Local API interceptor
      this.localApi.interceptors.request.use(
        async (config) => {
          // Skip auth for endpoints that don't need it
          const noAuthEndpoints = ['/api/auth/pairing-token', '/api/auth/qr-code'];
          if (noAuthEndpoints.some(endpoint => config.url.includes(endpoint))) {
            return config;
          }
          
          const token = await AsyncStorage.getItem('localAuthToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Remote API interceptor
      this.remoteApi.interceptors.request.use(
        async (config) => {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Handle token expiry for both
      [this.localApi, this.remoteApi].forEach(api => {
        if (!api) return;
        
        api.interceptors.response.use(
          (response) => response,
          async (error) => {
            // Don't log 401 errors during pairing phase
            if (error.response?.status === 401) {
              const isCarPaired = await AsyncStorage.getItem('isCarPaired');
              if (isCarPaired !== 'true') {
                // Silently fail during pairing
                return Promise.reject(error);
              }
              
              console.log('Token expired or invalid, clearing auth data');
              await AsyncStorage.multiRemove(['authToken', 'localAuthToken', 'isCarPaired']);
            }
            return Promise.reject(error);
          }
        );
      });
    }, 100);
  }

  // Helper to determine which API to use
  getApi(endpoint) {
    // Ensure APIs are initialized
    if (!this.localApi || !this.remoteApi) {
      console.warn('APIs not initialized yet');
      return null;
    }

    // Add /api/auth/me/settings to local endpoints
    const localEndpoints = [
      '/api/notifications',
      '/api/sensors',
      '/api/diagnostics',
      '/api/auth/me/settings',
      '/api/auth/pairing-token',
      '/api/auth/register',
      '/api/auth/qr-code',
      '/api/obd/profile',
      '/api/sync',
      '/api/logs'
    ];
    
    const remoteEndpoints = [
      '/auth/login', 
      '/auth/register', 
      '/auth/me', 
      '/auth/verify-pairing'
    ];
    
    // Check if it's a local endpoint
    const isLocal = localEndpoints.some(local => endpoint.includes(local));
    const isRemote = remoteEndpoints.some(remote => endpoint.includes(remote));
    
    // If explicitly local or not explicitly remote, use local API
    return isLocal || !isRemote ? this.localApi : this.remoteApi;
  }

  // Generic request method with better error handling
  async request(method, endpoint, data = null, options = {}) {
    // Wait for APIs to be initialized if needed
    if (!this.localApi || !this.remoteApi) {
      await this.initializeApis();
    }

    const api = this.getApi(endpoint);
    
    if (!api) {
      throw new Error('API not initialized');
    }
    
    try {
      const response = await api.request({
        method,
        url: endpoint,
        data,
        ...options,
      });
      return response.data;
    } catch (error) {
      // Don't log errors for notification endpoints during pairing
      const isNotificationEndpoint = endpoint.includes('/notifications');
      const isCarPaired = await AsyncStorage.getItem('isCarPaired');
      
      if (isNotificationEndpoint && isCarPaired !== 'true') {
        // Silently fail for notifications during pairing
        throw error;
      }
      
      // Only log non-401 errors or if car is paired
      if (error.response?.status !== 401 || isCarPaired === 'true') {
        console.error(`API Error ${method} ${endpoint}:`, error.message || error);
      }
      
      throw error;
    }
  }

  // Convenience methods
  get(endpoint, options) {
    return this.request('GET', endpoint, null, options);
  }

  post(endpoint, data, options) {
    return this.request('POST', endpoint, data, options);
  }

  patch(endpoint, data, options) {
    return this.request('PATCH', endpoint, data, options);
  }

  delete(endpoint, options) {
    return this.request('DELETE', endpoint, null, options);
  }
}

export default new ApiService();