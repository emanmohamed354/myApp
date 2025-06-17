// hooks/useOfflineSupport.js
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { OfflineManager } from '../utils/offlineManager';

export const useOfflineSupport = (dataKey, fetchFunction) => {
  const [data, setData] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });

    loadData();

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to get fresh data
      if (isOnline) {
        const freshData = await fetchFunction();
        setData(freshData);
        await OfflineManager.cacheData(dataKey, freshData);
      } else {
        // Get cached data if offline
        const cachedData = await OfflineManager.getCachedData(dataKey);
        if (cachedData) {
          setData(cachedData);
        } else {
          throw new Error('No cached data available');
        }
      }
    } catch (err) {
      setError(err);
      // Try to use cached data as fallback
      const cachedData = await OfflineManager.getCachedData(dataKey);
      if (cachedData) {
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    isOnline,
    loading,
    error,
    refresh: loadData,
  };
};