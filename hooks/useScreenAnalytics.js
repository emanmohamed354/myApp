// hooks/useScreenAnalytics.js
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { PerformanceMonitor } from '../utils/performanceMonitor';

export const useScreenAnalytics = (screenName) => {
  const navigation = useNavigation();

  useEffect(() => {
    PerformanceMonitor.startScreenLoad(screenName);
    
    const unsubscribe = navigation.addListener('focus', () => {
      console.log(`Screen viewed: ${screenName}`);
      // Send to analytics service
    });

    PerformanceMonitor.endScreenLoad(screenName);

    return unsubscribe;
  }, [navigation, screenName]);
};