// hooks/usePermissions.js
import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const usePermissions = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
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
        'Please enable location services to find nearby centers',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() }
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
    checkLocationPermission
  };
};