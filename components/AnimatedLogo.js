// components/AnimatedLogo.js
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const AnimatedLogo = ({ size = 60, color = '#3B82F6' }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
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
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        tw`bg-blue-600/20 p-6 rounded-full`,
        {
          transform: [{ rotate: spin }, { scale: pulseAnim }],
        },
      ]}
    >
      <MaterialCommunityIcons name="car-connected" size={size} color={color} />
    </Animated.View>
  );
};

export default AnimatedLogo;