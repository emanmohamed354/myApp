// components/LoadingOverlay.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import tw from 'twrnc';
import AnimatedLogo from './AnimatedLogo';

const LoadingOverlay = ({ visible, message = 'Loading...' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        tw`absolute inset-0 z-50 items-center justify-center`,
        { opacity: fadeAnim }
      ]}
    >
      <BlurView intensity={80} tint="dark" style={tw`absolute inset-0`} />
      <View style={tw`items-center`}>
        <AnimatedLogo />
        <Text style={tw`text-white text-lg mt-4`}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default LoadingOverlay;