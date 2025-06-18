import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import ProfileScreen from '../../screens/ProfileScreen';

const AnimatedProfileScreen = (props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <ProfileScreen {...props} />
    </Animated.View>
  );
};

export default AnimatedProfileScreen;