import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Animated } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';
import AuthContainer from '../components/auth/AuthContainer';
import AnimatedInput from '../components/auth/AnimatedInput';
import LoadingOverlay from '../components/auth/LoadingOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this import

export default function LoginScreen({ navigation }) {
  const { saveToken } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // Add this debug line right after imports
  console.log('authApi imported:', authApi);

  const animateError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

// In LoginScreen.js, add more logging
// In LoginScreen.js handleLogin function
const handleLogin = async () => {
  console.log('Login button pressed!');
  console.log('Username:', username, 'Password:', password.length > 0 ? '***' : 'empty');
  
  if (!username.trim() || !password) {
    animateError();
    // Remove the Alert.alert - just animate the error
    return;
  }

  setLoading(true);
  console.log('Starting login process...');
  
  try {
    const response = await authApi.remoteLogin({
      username: username.trim(),
      password: password,
    });

    console.log('Login response in screen:', response);

    if (response.accessToken) {
      console.log('Saving token...');
      await saveToken(response.accessToken);
      console.log('Token saved successfully');
      
      // Verify token was saved
      const savedToken = await AsyncStorage.getItem('authToken');
      console.log('Verified token in storage:', savedToken ? 'Yes' : 'No');
    }
  } catch (error) {

    animateError();
    
    // Remove Alert.alert - errors are now suppressed
    // The error is already handled silently by the error manager
    
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <AuthContainer title="Welcome Back">
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <AnimatedInput
            icon="account"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
            delay={0}
          />

          <AnimatedInput
            icon="lock"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            editable={!loading}
            delay={100}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={tw`bg-blue-600 rounded-2xl py-4 mb-4 ${loading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={tw`text-white text-center font-bold text-lg`}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`flex-1 h-px bg-gray-700`} />
            <Text style={tw`text-gray-500 px-4`}>or</Text>
            <View style={tw`flex-1 h-px bg-gray-700`} />
          </View>

          {/* Register Link */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Registration')}
            disabled={loading}
            style={tw`py-2`}
          >
            <Text style={tw`text-gray-400 text-center`}>
              New to AutoCare? <Text style={tw`text-blue-400 font-semibold`}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </AuthContainer>
      {loading && <LoadingOverlay />}
    </>
  );
}