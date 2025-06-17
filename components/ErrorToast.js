// components/ErrorToast.js
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export const ErrorToast = ({ message, type = 'error', duration = 3000, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getStyle = () => {
    switch (type) {
      case 'success':
        return { bg: 'bg-green-600', icon: 'check-circle' };
      case 'warning':
        return { bg: 'bg-yellow-600', icon: 'alert-circle' };
      case 'error':
        return { bg: 'bg-red-600', icon: 'alert-circle' };
      default:
        return { bg: 'bg-blue-600', icon: 'information' };
    }
  };

  const style = getStyle();

  return (
    <Animated.View
      style={[
        tw`absolute top-12 left-4 right-4 ${style.bg} rounded-xl p-4 shadow-lg`,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity onPress={dismiss} activeOpacity={0.9}>
        <View style={tw`flex-row items-center`}>
          <MaterialCommunityIcons name={style.icon} size={24} color="white" style={tw`mr-3`} />
          <Text style={tw`text-white flex-1`}>{message}</Text>
          <MaterialCommunityIcons name="close" size={20} color="white" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};