// components/appointment/MapView/VoiceNavigation.js
import { useEffect } from 'react';
import * as Speech from 'expo-speech';

export default function VoiceNavigation({ currentStep, direction, enabled }) {
  useEffect(() => {
    if (enabled && direction) {
      speakDirection(direction);
    }
  }, [currentStep, enabled]);

  const speakDirection = async (direction) => {
    const text = formatForSpeech(direction.instruction);
    
    await Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });

    // Speak distance warning
    const distance = parseFloat(direction.distance);
    if (distance <= 0.3) {
      setTimeout(() => {
        Speech.speak(`In ${Math.round(distance * 1000)} meters`, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
      }, 2000);
    }
  };

  const formatForSpeech = (instruction) => {
    return instruction
      .replace(/St\./g, 'Street')
      .replace(/Ave\./g, 'Avenue')
      .replace(/Rd\./g, 'Road')
      .replace(/Blvd\./g, 'Boulevard')
      .replace(/N\./g, 'North')
      .replace(/S\./g, 'South')
      .replace(/E\./g, 'East')
      .replace(/W\./g, 'West');
  };

  return null;
}