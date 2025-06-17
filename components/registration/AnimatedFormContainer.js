import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import tw from 'twrnc';

const { width } = Dimensions.get('window');

const AnimatedFormContainer = ({ children, style, formType }) => {
  const formAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    // Reset animation position
    formAnim.setValue(-width);
    
    // Start animation
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [formType]); // Only animate when formType changes

  return (
    <View style={tw`flex-1`}>
      <Animated.View
        style={[
          tw`px-4 pt-8`,
          {
            transform: [{ translateX: formAnim }],
          },
          style
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export default AnimatedFormContainer;