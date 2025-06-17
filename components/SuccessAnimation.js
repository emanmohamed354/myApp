// components/SuccessAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const SuccessAnimation = ({ onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete && onComplete());
  }, []);

  return (
    <Animated.View
      style={[
        tw`absolute inset-0 items-center justify-center`,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={tw`bg-green-500 rounded-full p-8`}>
        <MaterialCommunityIcons name="check" size={60} color="white" />
      </View>
    </Animated.View>
  );
};

export default SuccessAnimation;