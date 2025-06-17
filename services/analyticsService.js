// services/analyticsService.js
import * as Analytics from 'expo-analytics';
import { Platform } from 'react-native';

class AnalyticsService {
  static initialized = false;

  static async initialize() {
    if (!this.initialized) {
      // Initialize your analytics service (Firebase, Amplitude, etc.)
      this.initialized = true;
    }
  }

  static trackEvent(eventName, parameters = {}) {
    console.log(`Analytics Event: ${eventName}`, parameters);
    // Send to your analytics service
  }

  static trackScreen(screenName) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      platform: Platform.OS,
    });
  }

  static trackError(error, context = {}) {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  static trackUserAction(action, details = {}) {
    this.trackEvent(`user_${action}`, details);
  }

  static trackCarHealth(healthScore, factors) {
    this.trackEvent('car_health_check', {
      health_score: healthScore,
      ...factors,
    });
  }

  static trackAppointmentBooked(centerName, serviceType) {
    this.trackEvent('appointment_booked', {
      center_name: centerName,
      service_type: serviceType,
    });
  }
}

export default AnalyticsService;