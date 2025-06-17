// components/appointment/MapView/DirectionArrow.js
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function DirectionArrow({ direction, visible }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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

      // Rotation based on direction
      const rotation = getRotationForDirection(direction);
      Animated.timing(rotateAnim, {
        toValue: rotation,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, direction]);

  const getRotationForDirection = (dir) => {
    const modifier = dir.modifier?.toLowerCase();
    if (modifier === 'left') return -90;
    if (modifier === 'right') return 90;
    if (modifier === 'sharp left') return -135;
    if (modifier === 'sharp right') return 135;
    if (modifier === 'slight left') return -45;
    if (modifier === 'slight right') return 45;
    if (modifier === 'uturn') return 180;
    return 0;
  };

  if (!visible) return null;

  return (
    <View style={tw`absolute top-1/2 left-1/2 -ml-10 -mt-10`}>
      <Animated.View
        style={[
          tw`w-20 h-20 rounded-full bg-blue-500 items-center justify-center`,
          {
            transform: [
              { scale: pulseAnim },
              { rotate: rotateAnim.interpolate({
                inputRange: [-180, 180],
                outputRange: ['-180deg', '180deg']
              })}
            ],
          }
        ]}
      >
        <MaterialCommunityIcons name="arrow-up-thick" size={40} color="white" />
      </Animated.View>
    </View>
  );
}