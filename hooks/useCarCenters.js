// hooks/useCarCenters.js
import { useState, useEffect } from 'react';
import { searchNearbyCarCenters } from '../services/locationService';

export const useCarCenters = (userLocation) => {
  const [maintenanceCenters, setMaintenanceCenters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLocation) {
      fetchCarCenters();
    }
  }, [userLocation]);

  const fetchCarCenters = async () => {
    if (!userLocation) return;
    
    try {
      setLoading(true);
      const centers = await searchNearbyCarCenters(
        userLocation.latitude,
        userLocation.longitude
      );
      setMaintenanceCenters(centers);
    } catch (error) {
      console.error('Error fetching car centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCenters = () => {
    if (userLocation) {
      fetchCarCenters();
    }
  };

  return {
    maintenanceCenters,
    loading,
    refreshCenters
  };
};