import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useHeaderAnimations = () => {
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const iconFloatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const statusDotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotating animation
    Animated.loop(
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloatAnim, {
          toValue: -10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(iconFloatAnim, {
          toValue: 10,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
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

    // Status dot blink
    Animated.loop(
      Animated.sequence([
        Animated.timing(statusDotAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(statusDotAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return { iconRotateAnim, iconFloatAnim, pulseAnim, statusDotAnim };
};

export const useItemAnimation = () => {
  const itemAnimations = useRef([]).current;

  const animateItems = (items) => {
    items.forEach((_, index) => {
      if (!itemAnimations[index]) {
        itemAnimations[index] = new Animated.Value(0);
      }
      
      Animated.timing(itemAnimations[index], {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    });
  };

  return { itemAnimations, animateItems };
};