// components/BiometricLock.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { BiometricAuth } from '../utils/biometricAuth';

export const BiometricLock = ({ children, fallback }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const type = await BiometricAuth.getBiometricType();
    setBiometricType(type);
    
    const isAvailable = await BiometricAuth.isAvailable();
    if (isAvailable) {
      authenticate();
    } else {
      setIsAuthenticated(true); // Skip if not available
    }
  };

  const authenticate = async () => {
    const success = await BiometricAuth.authenticate();
    setIsAuthenticated(success);
  };

  if (!isAuthenticated) {
    return (
      <View style={tw`flex-1 bg-gray-900 justify-center items-center p-6`}>
        <MaterialCommunityIcons 
          name={biometricType === 'fingerprint' ? 'fingerprint' : 'face-recognition'} 
          size={80} 
          color="#3B82F6" 
        />
        <Text style={tw`text-white text-xl font-bold mt-4`}>
          Authentication Required
        </Text>
        <Text style={tw`text-gray-400 text-center mt-2`}>
          Use your {biometricType || 'biometric'} to access your car data
        </Text>
        <TouchableOpacity
          onPress={authenticate}
          style={tw`bg-blue-600 px-6 py-3 rounded-lg mt-6`}
        >
          <Text style={tw`text-white font-semibold`}>Authenticate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
};