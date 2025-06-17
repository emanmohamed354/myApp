// utils/appStatePersistence.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AppStatePersistence {
  static STATE_KEY = '@app_state';

  static async saveState(state) {
    try {
      const stateToSave = {
        timestamp: Date.now(),
        version: '1.0.0',
        ...state,
      };
      await AsyncStorage.setItem(this.STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving app state:', error);
    }
  }

  static async loadState() {
    try {
      const savedState = await AsyncStorage.getItem(this.STATE_KEY);
      if (!savedState) return null;

      const state = JSON.parse(savedState);
      
      // Check if state is older than 24 hours
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - state.timestamp > dayInMs) {
        await AsyncStorage.removeItem(this.STATE_KEY);
        return null;
      }

      return state;
    } catch (error) {
      console.error('Error loading app state:', error);
      return null;
    }
  }

  static async clearState() {
    try {
      await AsyncStorage.removeItem(this.STATE_KEY);
    } catch (error) {
      console.error('Error clearing app state:', error);
    }
  }
}

// hooks/useAppState.js
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { AppStatePersistence } from '../utils/appStatePersistence';
import { useSensorData } from '../contexts/SensorDataContext';

export const useAppState = () => {
  const { sensorData, carHealth } = useSensorData();

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Save state when app goes to background
        AppStatePersistence.saveState({
          lastSensorData: sensorData,
          lastCarHealth: carHealth,
          lastActiveScreen: 'Home', // You can track this
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [sensorData, carHealth]);
};