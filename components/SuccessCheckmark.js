// components/SuccessCheckmark.js
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const SuccessCheckmark = ({ visible, onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 20,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete && onComplete());
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        tw`absolute inset-0 items-center justify-center`,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          tw`bg-green-600 rounded-full p-8`,
          {
            transform: [{ scale: scaleAnim }, { rotate }],
          },
        ]}
      >
        <MaterialCommunityIcons name="check-bold" size={60} color="white" />
      </Animated.View>
    </Animated.View>
  );
};

export default SuccessCheckmark;