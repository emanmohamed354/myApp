import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { VoiceCommandService } from '../utils/voiceCommands';
import { useSensorData } from '../contexts/SensorDataContext';
import { useAuth } from '../contexts/AuthContext';

export const useVoiceCommands = () => {
  const navigation = useNavigation();
  const { sensorData, carHealth } = useSensorData();
  const { userInfo } = useAuth();

  useEffect(() => {
    const callbacks = {
      navigate: (screen) => {
        navigation.navigate(screen);
      },
      
      getSensorValue: (sensor) => {
        return sensorData[sensor];
      },
      
      getCarHealth: () => {
        return carHealth;
      },
      
      checkStatus: (type) => {
        if (type === 'engine') {
          const temp = sensorData.ENGINE_COOLANT_TEMPERATURE;
          const rpm = sensorData.ENGINE_RPM;
          VoiceCommandService.speak(
            `Engine temperature is ${temp} degrees. RPM is ${rpm}.`
          );
        }
      },
      
      emergency: () => {
        navigation.navigate('Emergency');
      },
      
      onUnknownCommand: (text) => {
        // Send to AI assistant
        navigation.navigate('LLM', { initialQuery: text });
      },
    };

    VoiceCommandService.initialize(callbacks);

    return () => {
      VoiceCommandService.destroy();
    };
  }, [navigation, sensorData, carHealth]);

  const startListening = useCallback(() => {
    VoiceCommandService.startListening();
  }, []);

  const stopListening = useCallback(() => {
    VoiceCommandService.stopListening();
  }, []);

  const speak = useCallback((text) => {
    VoiceCommandService.speak(text);
  }, []);

  return {
    startListening,
    stopListening,
    speak,
    isListening: VoiceCommandService.isListening,
  };
};