import { Alert } from 'react-native';

class ErrorManager {
  constructor() {
    this.suppressErrors = true; // Global flag to suppress error popups
    this.errorHandlers = new Map();
  }

  // Register custom error handlers for specific error types
  registerHandler(errorType, handler) {
    this.errorHandlers.set(errorType, handler);
  }

  // Handle errors silently without showing alerts
  handleError(error, context = '') {
    // Log error for debugging
   

    // Check for network/connection errors
    if (this.isNetworkError(error)) {
      console.log('Network error detected - suppressing');
      return {
        type: 'network',
        message: 'Connection error',
        silent: true
      };
    }

    // Check for auth errors
    if (this.isAuthError(error)) {
      console.log('Auth error detected - suppressing');
      return {
        type: 'auth',
        message: 'Authentication required',
        silent: true
      };
    }

    // Check for token errors
    if (this.isTokenError(error)) {
      console.log('Token error detected - suppressing');
      return {
        type: 'token',
        message: 'Token invalid or missing',
        silent: true
      };
    }

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
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('connection') ||
      !error.response && error.request
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
    // Make sure showError respects suppressErrors
  showError(title, message, actions = []) {
    if (this.suppressErrors) {
      console.log(  `Suppressed error: ${title} - ${message}`);
      return; // Don't show any alerts
    }

    Alert.alert(title, message, actions);
  }

}

export default new ErrorManager();