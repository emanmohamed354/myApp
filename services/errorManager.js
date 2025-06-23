// services/errorManager.js
import { Alert } from 'react-native';

class ErrorManager {
  constructor() {
    this.suppressErrors = false; // Global flag to suppress error popups
    this.errorHandlers = new Map();
  }

  // Register custom error handlers for specific error types
  registerHandler(errorType, handler) {
    this.errorHandlers.set(errorType, handler);
  }

  // Handle errors silently without showing alerts
  handleError(error, context = '') {
    // Silent contexts list
    const silentContexts = [
      'loadNotifications',
      'fetchSensorData',
      'syncService',
      'getRecentNotifications'
    ];

    // Check for network/connection errors
    if (this.isNetworkError(error)) {
      console.log(`[${context}] Network error detected - suppressing`);
      console.log(error);
      return {
        type: 'network',
        message: 'Connection error',
        silent: true
      };
    }

    // Check for auth errors
    if (this.isAuthError(error)) {
      console.log(`[${context}] Auth error detected - suppressing`);
      console.log(error);
      return {
        type: 'auth',
        message: 'Authentication required',
        silent: true
      };
    }

    // Don't log errors for these contexts when on login page
    if (silentContexts.includes(context)) {
      // Check if it's a 401 or network error
      if (error.response?.status === 401 || error.code === 'ECONNREFUSED') {
        return {
          type: 'auth',
          message: 'Authentication required',
          silent: true
        };
      }
    }

    // Check for token errors
    if (this.isTokenError(error)) {
      console.log(`[${context}] Token error detected - suppressing`);
      return {
        type: 'token',
        message: 'Token invalid or missing',
        silent: true
      };
    }

    // Log the error with context
    console.log(`[${context}] Error:`, error.message || error);

    // Default silent error
    return {
      type: 'unknown',
      message: error.message || 'An error occurred',
      silent: true
    };
  }

  isNetworkError(error) {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED' ||
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('connection') ||
      error.message?.toLowerCase().includes('timeout') ||
      (!error.response && error.request)
    );
  }

  isAuthError(error) {
    return (
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      error.message?.toLowerCase().includes('unauthorized') ||
      error.message?.toLowerCase().includes('forbidden')
    );
  }

  isTokenError(error) {
    return (
      error.message?.toLowerCase().includes('token') ||
      error.message?.toLowerCase().includes('jwt') ||
      error.response?.data?.message?.toLowerCase().includes('token')
    );
  }

  // Show error only if it's critical and user action is required
  showError(title, message, actions = []) {
    if (this.suppressErrors) {
      console.log(`Suppressed error alert: ${title} - ${message}`);
      return; // Don't show any alerts
    }

    Alert.alert(title, message, actions);
  }
}

export default new ErrorManager();