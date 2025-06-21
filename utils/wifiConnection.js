// src/utils/wifiConnection.js
import * as Network from 'expo-network';
import { Alert, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const handleWifiConnection = async (ssid, password) => {
  try {
    // Check current network state
    const networkState = await Network.getNetworkStateAsync();
    
    if (networkState.type === 'wifi') {
      // On iOS, we can't get SSID with Expo, so we'll trust the user
      if (Platform.OS === 'ios') {
        const lastConnected = await AsyncStorage.getItem('lastConnectedWifi');
        if (lastConnected === ssid) return true;
        
        return await promptForIosWifiConnection(ssid);
      }
      
      // On Android, we can sometimes get SSID through Network API
      if (networkState.details?.ssid === ssid) {
        return true;
      }
    }
    
    // If not connected, prompt user
    return await promptForWifiConnection(ssid);
  } catch (error) {
    console.error('WiFi connection error:', error);
    return false;
  }
};

const promptForWifiConnection = async (ssid) => {
  return new Promise((resolve) => {
    Alert.alert(
      'WiFi Connection Needed',
      `Please connect to "${ssid}" to continue pairing`,
      [
        {
          text: 'Cancel',
          onPress: () => resolve(false),
          style: 'cancel'
        },
        {
          text: 'Open WiFi Settings',
          onPress: async () => {
            await openWifiSettings();
            // Give user time to connect
            setTimeout(async () => {
              const connected = await verifyConnection(ssid);
              resolve(connected);
            }, 5000);
          }
        },
        {
          text: "I'm Connected",
          onPress: async () => {
            await AsyncStorage.setItem('lastConnectedWifi', ssid);
            resolve(true);
          }
        }
      ]
    );
  });
};

const promptForIosWifiConnection = async (ssid) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Verify WiFi Connection',
      `Are you connected to "${ssid}"?`,
      [
        {
          text: 'No',
          onPress: () => resolve(false),
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: async () => {
            await AsyncStorage.setItem('lastConnectedWifi', ssid);
            resolve(true);
          }
        }
      ]
    );
  });
};

const openWifiSettings = async () => {
  if (Platform.OS === 'ios') {
    await Linking.openURL('App-Prefs:WIFI');
  } else {
    await Linking.openSettings();
  }
};

const verifyConnection = async (ssid) => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    
    if (Platform.OS === 'android') {
      return networkState.type === 'wifi' && 
             networkState.details?.ssid === ssid;
    }
    
    // For iOS, we can't verify SSID, so trust the user
    return networkState.type === 'wifi';
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};