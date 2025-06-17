// components/VoiceCommandButton.js
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

export const VoiceCommandButton = () => {
  const { startListening, stopListening, isListening } = useVoiceCommands();
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={tw`absolute bottom-24 right-4 z-50`}
    >
      <Animated.View
        style={[
          tw`bg-blue-600 rounded-full p-4 shadow-lg`,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: isListening ? '#EF4444' : '#3B82F6',
          }
        ]}
      >
        <MaterialCommunityIcons 
          name={isListening ? 'microphone-off' : 'microphone'} 
          size={24} 
          color="white" 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};