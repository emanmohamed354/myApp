import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import carImage from '../../assets/images/Car.png';

const { width, height } = Dimensions.get('window');

export default function AuthContainer({ children, title, subtitle }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const carSlideAnim = useRef(new Animated.Value(-width * 1.8)).current;
  const carFloatAnim = useRef(new Animated.Value(0)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(height)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(carSlideAnim, {
          toValue: -width * 0.2,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(formSlideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(carFloatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(carFloatAnim, {
          toValue: 10,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={tw`flex-1 bg-black`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background */}
      <Animated.View style={[tw`absolute inset-0`, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#0f172a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={tw`flex-1`}
        />
      </Animated.View>

      {/* Car Background */}
      <Animated.View
        style={[
          tw`absolute`,
          {
            top: height * 0.1,
            left: 0,
            right: 0,
            height: height * 0.5,
            opacity: fadeAnim,
            transform: [{ translateX: carSlideAnim }, { translateY: carFloatAnim }],
          },
        ]}
      >
        <Image
          source={carImage}
          style={{
            width: width * 1.3,
            height: '100%',
            opacity: 0.3,
          }}
          resizeMode="contain"
        />

        {/* Glow effect */}
        <Animated.View
          style={[
            tw`absolute inset-0`,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(59, 130, 246, 0.3)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={tw`flex-1`}
          />
        </Animated.View>
      </Animated.View>

      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={tw`flex-1`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View
            style={[
              tw`items-center mt-${Platform.OS === 'ios' ? '20' : '16'}`,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScaleAnim }],
              },
            ]}
          >
            <View style={tw`bg-blue-600/20 p-4 rounded-full mb-4`}>
              <MaterialCommunityIcons name="car-connected" size={40} color="#60A5FA" />
            </View>
            <Text style={tw`text-white text-3xl font-bold`}>AutoCare</Text>
            <Text style={tw`text-gray-400 text-base mt-1`}>Smart Vehicle Assistant</Text>
          </Animated.View>

          {/* Form Container */}
          <Animated.View
            style={[
              tw`flex-1 mt-8`,
              {
                opacity: formFadeAnim,
                transform: [{ translateY: formSlideAnim }],
              },
            ]}
          >
            <View style={tw`mx-4`}>
              <View style={tw`bg-gray-900/50 rounded-3xl p-6 border border-gray-800`}>
                <Text style={tw`text-white text-2xl font-bold text-center mb-8`}>
                  {title}
                </Text>
                {subtitle && (
                  <Text style={tw`text-gray-400 text-center mb-6`}>{subtitle}</Text>
                )}
                {children}
              </View>
            </View>

            {/* Bottom Design */}
            <Animated.View
              style={[
                tw`absolute bottom-0 left-0 right-0`,
                {
                  opacity: formFadeAnim,
                },
              ]}
            >
              <View style={tw`flex-row justify-center mb-8`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-8 h-px bg-blue-600/30`} />
                  <View style={tw`w-2 h-2 rounded-full bg-blue-600/50 mx-2`} />
                  <View style={tw`w-2 h-2 rounded-full bg-blue-600 mx-2`} />
                  <View style={tw`w-2 h-2 rounded-full bg-blue-600/50 mx-2`} />
                  <View style={tw`w-8 h-px bg-blue-600/30`} />
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}