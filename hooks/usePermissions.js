// hooks/usePermissions.js
import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Alert, Platform, Linking } from 'react-native';

export const usePermissions = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [hasWifiPermission, setHasWifiPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
            // Location permission (needed for WiFi on Android)
      if (Platform.OS === 'android') {
        const locationStatus = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(locationStatus.status === 'granted');
        setHasWifiPermission(locationStatus.status === 'granted');
      }
    })();
  }, []);

  const requestAudioPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setHasAudioPermission(status === 'granted');
    return status === 'granted';
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setHasLocationPermission(status === 'granted');
    
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services to find nearby centers and Wifi connection',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
    
    return true;
  };
  const checkWifiPermissions = async () => {
    if (Platform.OS === 'ios') return true; // No special permissions needed on iOS
    
    if (hasWifiPermission === null) {
      return await requestLocationPermission();
    }
    
    if (hasWifiPermission === false) {
      Alert.alert(
        'Location Permission Needed',
        'Android requires location permission to manage WiFi connections',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => requestLocationPermission() }
        ]
      );
      return false;
    }
    
    return true;
  };
  const checkCameraPermission = async () => {
    if (hasCameraPermission === null) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    }
    
    if (hasCameraPermission === false) {
      Alert.alert('No access to camera', 'Please enable camera permissions in settings.');
      return false;
    }
    
    return true;
  };

  const checkLocationPermission = async () => {
    if (hasLocationPermission === null) {
      return await requestLocationPermission();
    }
    
    if (hasLocationPermission === false) {
      Alert.alert(
        'Location Permission Denied',
        'Please enable location permissions in settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
    
    return true;
  };

  return {
    hasCameraPermission,
    hasAudioPermission,
    hasLocationPermission,
    requestAudioPermission,
    requestLocationPermission,
    checkCameraPermission,
    checkLocationPermission,
    checkWifiPermissions,
    hasWifiPermission,

  };
};