// hooks/useCrashDetection.js
import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CrashDetectionService } from '../utils/crashDetection';
import { Alert } from 'react-native';

// hooks/useCrashDetection.js (continued)
export const useCrashDetection = () => {
  const navigation = useNavigation();
  const isEnabled = useRef(false);

  useEffect(() => {
    return () => {
      if (isEnabled.current) {
        CrashDetectionService.stopMonitoring();
      }
    };
  }, []);

  const startCrashDetection = () => {
    if (isEnabled.current) return;
    
    isEnabled.current = true;
    CrashDetectionService.startMonitoring((crashData) => {
      if (!crashData.cancelled) {
        // Navigate to emergency screen with crash data
        navigation.navigate('Emergency', { crashData });
        
        // Log crash event
        AnalyticsService.trackEvent('crash_detected', {
          force: crashData.force,
          location: crashData.location,
          timestamp: crashData.timestamp,
        });
      }
    });
  };

  const stopCrashDetection = () => {
    isEnabled.current = false;
    CrashDetectionService.stopMonitoring();
  };

  const setEmergencyContacts = async (contacts) => {
    await CrashDetectionService.setEmergencyContacts(contacts);
  };

  const getCrashHistory = async () => {
    return await CrashDetectionService.getCrashHistory();
  };

  return {
    startCrashDetection,
    stopCrashDetection,
    setEmergencyContacts,
    getCrashHistory,
    isEnabled: isEnabled.current,
  };
};