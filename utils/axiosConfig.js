// utils/axiosConfig.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const configureAxiosInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.timeout = 30000; // 30 seconds timeout
        return config;
      } catch (error) {
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        await AsyncStorage.removeItem('authToken');
        // You might want to dispatch a logout action here
      }
      return Promise.reject(error);
    }
  );
};