// hooks/useLocation.js
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { usePermissions } from './usePermissions';

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { checkLocationPermission } = usePermissions();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Unable to get your location');
    } finally {
      setLoading(false);
    }
  };

  return {
    userLocation,
    loading,
    getCurrentLocation
  };
};