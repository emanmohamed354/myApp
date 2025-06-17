// utils/crashDetection.js
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Alert, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class CrashDetectionService {
  static subscription = null;
  static threshold = 4.0; // G-force threshold
  static isMonitoring = false;
  static emergencyContacts = [];
  static cancelTimer = null;

  static async initialize() {
    // Load emergency contacts
    const contacts = await AsyncStorage.getItem('@emergency_contacts');
    if (contacts) {
      this.emergencyContacts = JSON.parse(contacts);
    }
  }

  static async startMonitoring(onCrashDetected) {
    if (this.isMonitoring) return;

    await this.initialize();
    this.isMonitoring = true;
    Accelerometer.setUpdateInterval(100); // 10Hz

    this.subscription = Accelerometer.addListener(async (data) => {
      const { x, y, z } = data;
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
      
      // Detect sudden deceleration (possible crash)
      if (totalAcceleration > this.threshold) {
        this.handlePossibleCrash(totalAcceleration, onCrashDetected);
      }
    });
  }

  static async handlePossibleCrash(force, callback) {
    // Stop monitoring to prevent multiple detections
    this.stopMonitoring();

    // Vibrate to alert user
    Vibration.vibrate([1000, 1000, 1000]);

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Start countdown
    let countdown = 30;
    let alertRef = null;

    const updateAlert = () => {
      Alert.alert(
        '🚨 Crash Detected!',
        `Emergency services will be contacted in ${countdown} seconds unless cancelled.\n\nForce detected: ${force.toFixed(2)}G`,
        [
          {
            text: `Cancel (${countdown}s)`,
            onPress: () => {
              clearInterval(this.cancelTimer);
              Vibration.cancel();
              this.startMonitoring(callback); // Resume monitoring
              callback?.({ cancelled: true });
            },
            style: 'cancel',
          },
          {
            text: 'Call Now',
            onPress: () => {
              clearInterval(this.cancelTimer);
              this.triggerEmergency(location, force, callback);
            },
            style: 'destructive',
          },
        ],
        { cancelable: false }
      );
    };

    updateAlert();

    this.cancelTimer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        updateAlert();
      } else {
        clearInterval(this.cancelTimer);
        Vibration.cancel();
        this.triggerEmergency(location, force, callback);
      }
    }, 1000);
  }

  static async triggerEmergency(location, force, callback) {
    const emergencyData = {
      timestamp: new Date().toISOString(),
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: await this.getAddressFromCoords(location.coords),
      },
      force: force,
      deviceInfo: {
        // Add device info
      },
    };

    // Save crash data
    await this.saveCrashData(emergencyData);

    // Send emergency notifications
    await this.sendEmergencyNotifications(emergencyData);

    // Callback to app
    callback?.(emergencyData);

    Alert.alert(
      'Emergency Services Contacted',
      'Your emergency contacts have been notified with your location.',
      [{ text: 'OK' }]
    );

    // Resume monitoring after a delay
    setTimeout(() => {
      this.startMonitoring(callback);
    }, 60000); // Wait 1 minute before resuming
  }

  static async getAddressFromCoords(coords) {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      
      return `${address.street || ''} ${address.city || ''} ${address.region || ''} ${address.postalCode || ''}`.trim();
    } catch (error) {
      return `Lat: ${coords.latitude.toFixed(6)}, Lon: ${coords.longitude.toFixed(6)}`;
    }
  }

  static async sendEmergencyNotifications(emergencyData) {
    const message = `🚨 EMERGENCY: Possible car crash detected!\n\nLocation: ${emergencyData.location.address}\nGoogle Maps: https://maps.google.com/?q=${emergencyData.location.latitude},${emergencyData.location.longitude}\nTime: ${new Date(emergencyData.timestamp).toLocaleString()}\nImpact Force: ${emergencyData.force.toFixed(2)}G`;

    // Send SMS to emergency contacts
    if (await SMS.isAvailableAsync()) {
      for (const contact of this.emergencyContacts) {
        try {
          await SMS.sendSMSAsync(
            [contact.phone],
            message
          );
        } catch (error) {
          console.error('Error sending SMS:', error);
        }
      }
    }

    // Also send to backend API
    try {
      // await api.reportEmergency(emergencyData);
    } catch (error) {
      console.error('Error reporting to server:', error);
    }
  }

  static async saveCrashData(data) {
    try {
      const crashes = await AsyncStorage.getItem('@crash_history');
      const crashHistory = crashes ? JSON.parse(crashes) : [];
      crashHistory.unshift(data);
      
      // Keep only last 10 crashes
      if (crashHistory.length > 10) {
        crashHistory.pop();
      }
      
      await AsyncStorage.setItem('@crash_history', JSON.stringify(crashHistory));
    } catch (error) {
      console.error('Error saving crash data:', error);
    }
  }

  static stopMonitoring() {
    this.isMonitoring = false;
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    if (this.cancelTimer) {
      clearInterval(this.cancelTimer);
      this.cancelTimer = null;
    }
  }

  static async setEmergencyContacts(contacts) {
    this.emergencyContacts = contacts;
    await AsyncStorage.setItem('@emergency_contacts', JSON.stringify(contacts));
  }

  static async getCrashHistory() {
    try {
      const crashes = await AsyncStorage.getItem('@crash_history');
      return crashes ? JSON.parse(crashes) : [];
    } catch (error) {
      return [];
    }
  }
}





