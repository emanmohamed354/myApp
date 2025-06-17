import React, { useRef, useEffect, useState } from 'react';
import { View, TextInput, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function AnimatedInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  showPasswordToggle,
  onTogglePassword,
  autoCapitalize = 'none',
  keyboardType = 'default',
  editable = true,
  delay = 0,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false, // Must be false for border color
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false, // Must be false for border color
    }).start();
  };

  return (
    <Animated.View
      style={[
        tw`mb-4`,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          tw`bg-gray-800/50 rounded-2xl overflow-hidden`,
          {
            borderWidth: 2,
            borderRadius: 16,
            borderColor: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(75, 85, 99, 0.5)', 'rgba(59, 130, 246, 0.8)'],
            }),
          },
        ]}
      >
        <View style={tw`flex-row items-center px-4`}>
          <MaterialCommunityIcons name={icon} size={20} color="#60A5FA" />
          <TextInput
            style={tw`flex-1 py-4 px-3 text-white text-base`}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={onChangeText}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {showPasswordToggle && (
            <TouchableOpacity onPress={onTogglePassword} style={tw`p-2`}>
              <MaterialCommunityIcons
                name={secureTextEntry ? "eye" : "eye-off"}
                size={20}
                color="#60A5FA"
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}