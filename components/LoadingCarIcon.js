import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import tw from 'twrnc';

const LoadingCarIcon = ({ size = 50, color = '#4F46E5' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={tw`items-center justify-center`}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <FontAwesome name="car" size={size} color={color} />
      </Animated.View>
    </View>
  );
};

export default LoadingCarIcon;