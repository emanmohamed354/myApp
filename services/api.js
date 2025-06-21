import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from './apiInstance';
import errorManager from './errorManager';

class ApiService {
  constructor() {
    this.interceptorsSetup = false;
  }

  async ensureInitialized() {
    if (!apiInstance.initialized) {
      await apiInstance.initialize();
    }
    // Always setup interceptors when making a request
    if (!this.interceptorsSetup) {
      this.setupInterceptors();
      this.interceptorsSetup = true;
    }
  }

  setupInterceptors() {
    console.log('Setting up API interceptors');
    
    // Request interceptor
    const requestInterceptor = async (config) => {
      try {
        const isRemoteApi = config.baseURL === apiInstance.remoteApi?.defaults.baseURL;
        const isLocalApi = config.baseURL === apiInstance.localApi?.defaults.baseURL;

        if (isRemoteApi) {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization header added');
          }
        } else if (isLocalApi) {
          const localToken = await AsyncStorage.getItem('localAuthToken');
          if (localToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${localToken}`;
          }
        }
      } catch (error) {
        console.log('Error in request interceptor:', error);
      }
      return config;
    };

    // Response interceptor - FIXED to properly return data
    const responseInterceptor = (response) => {
      // Return just the data, not the full response
      return response.data || response;
    };

    // Error interceptor
    const errorInterceptor = (error) => {
      console.log('API Error interceptor:', error.response?.status, error.config?.url);
      
      const handledError = errorManager.handleError(error, 'API');
      
      const cleanError = {
        ...error,
        handled: true,
        errorType: handledError.type,
        userMessage: handledError.message,
        silent: true
      };

      return Promise.reject(cleanError);
    };

    // Apply interceptors to both APIs
    [apiInstance.remoteApi, apiInstance.localApi].forEach(api => {
      if (api) {
        api.interceptors.request.use(requestInterceptor, errorInterceptor);
        api.interceptors.response.use(responseInterceptor, errorInterceptor);
      }
    });
  }

  async request(method, endpoint, data = null, options = {}) {
    try {
      await this.ensureInitialized();
      
      const isLocalEndpoint = endpoint.startsWith('/api/');
      
      // Check if we should skip the request
      if (isLocalEndpoint) {
        const localToken = await AsyncStorage.getItem('localAuthToken');
        const isCarPaired = await AsyncStorage.getItem('isCarPaired');
        
        // Skip certain endpoints if not paired
        if (!localToken || isCarPaired !== 'true') {
          const protectedEndpoints = [
            '/api/notifications',
            '/api/obd/live',
            '/api/obd/profile',
            '/api/sync',
            '/api/llm'
          ];
          
          if (protectedEndpoints.some(ep => endpoint.startsWith(ep))) {
            console.log(`Skipping ${endpoint} - car not paired or no local token`);
            // Return empty data structure based on endpoint
            if (endpoint.includes('notifications')) return [];
            if (endpoint.includes('sync')) return { readings: [], diagnostics: [], events: [] };
            return null;
          }
        }
      }
      
      const api = isLocalEndpoint ? apiInstance.getLocalApi() : apiInstance.getRemoteApi();
      
      const config = {
        method,
        url: endpoint,
        ...options,
      };

      if (data) {
        if (method === 'get') {
          config.params = data;
        } else {
          config.data = data;
        }
      }

      const response = await api(config);
      return response;
    } catch (error) {
      // Don't log errors for expected 401s on login page
      if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
        console.log('Expected 401 for:', error.config?.url);
      } else {
      }
      throw error;
    }
  }

  // Convenience methods
  get(endpoint, params, options) {
    return this.request('get', endpoint, params, options);
  }

  post(endpoint, data, options) {
    return this.request('post', endpoint, data, options);
  }

  put(endpoint, data, options) {
    return this.request('put', endpoint, data, options);
  }

  patch(endpoint, data, options) {
    return this.request('patch', endpoint, data, options);
  }

  delete(endpoint, options) {
    return this.request('delete', endpoint, null, options);
  }

  updateBaseUrl(newUrl) {
    apiInstance.updateLocalBaseUrl(newUrl);
  }

  // Expose API instances for interceptor setup in AuthContext
  get localApi() {
    return apiInstance.localApi;
  }

  get remoteApi() {
    return apiInstance.remoteApi;
  }
}

export default new ApiService();