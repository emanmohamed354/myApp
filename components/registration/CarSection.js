// Alternative CarSection.js with gradient starting from screen edge
import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';

const { width, height } = Dimensions.get('window');

const CarSection = ({ sectionHeight, carImage }) => {
  const insets = useSafeAreaInsets();
  const carAnimX = useRef(new Animated.Value(-width * 1.3)).current;

  useEffect(() => {
    Animated.timing(carAnimX, {
      toValue: width / 2 - (width * 1.6) / 2,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ height: sectionHeight }}>
      {/* Gradient background extending beyond safe area */}
      <LinearGradient
        colors={['#3c3f41', '#1a1c1e', '#000']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[
          StyleSheet.absoluteFillObject,
          { 
            top: -insets.top, // Extend gradient above safe area
            height: sectionHeight + insets.top 
          }
        ]}
      />
      
      {/* Content container with safe area padding */}
      <View style={[styles.carSection, { paddingTop: insets.top, height: '100%' }]}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: height * -0.06,
              width: width * 1.8,
              height: height * 0.6,
              transform: [{ translateX: carAnimX }],
            },
          ]}
        >
          <Image
            source={carImage}
            style={tw`w-full h-full`}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CarSection;