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
        // Determine which API is being used
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

    // Response interceptor
    const responseInterceptor = (response) => {
      // Return just the data
      return response.data;
    };

    // Error interceptor
    const errorInterceptor = (error) => {
      console.log('API Error interceptor:', error.response?.status, error.config?.url);
      
      // Handle errors silently
      const handledError = errorManager.handleError(error, 'API');
      
      // Create a clean error object
      const cleanError = {
        ...error,
        handled: true,
        errorType: handledError.type,
        userMessage: handledError.message,
        silent: true
      };

      return Promise.reject(cleanError);
    };

    // Apply interceptors to remote API
    if (apiInstance.remoteApi) {
      // Clear any existing interceptors
      apiInstance.remoteApi.interceptors.request.handlers = [];
      apiInstance.remoteApi.interceptors.response.handlers = [];
      
      // Add new interceptors
      apiInstance.remoteApi.interceptors.request.use(requestInterceptor, errorInterceptor);
      apiInstance.remoteApi.interceptors.response.use(responseInterceptor, errorInterceptor);
      console.log('Remote API interceptors set up');
    }

    // Apply interceptors to local API
    if (apiInstance.localApi) {
      // Clear any existing interceptors
      apiInstance.localApi.interceptors.request.handlers = [];
      apiInstance.localApi.interceptors.response.handlers = [];
      
      // Add new interceptors
      apiInstance.localApi.interceptors.request.use(requestInterceptor, errorInterceptor);
      apiInstance.localApi.interceptors.response.use(responseInterceptor, errorInterceptor);
      console.log('Local API interceptors set up');
    }
  }
// In api.js, modify the request method:
async request(method, endpoint, data = null, options = {}) {
  try {
    await this.ensureInitialized();
    
    const isLocalEndpoint = endpoint.startsWith('/api/');
    const api = isLocalEndpoint ? apiInstance.getLocalApi() : apiInstance.getRemoteApi();
    
    console.log('Using API:', isLocalEndpoint ? 'local' : 'remote');
    console.log('Base URL:', api.defaults.baseURL);
    
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
    console.log('Response received:', response);
    return response;
  } catch (error) {
    console.error('Request error:', error);
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