// components/forms/LoginForm.js
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  Animated,
  Keyboard, 
  TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/authApi';

const LoginForm = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { saveToken } = useAuth();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (!username.trim() || !password) {
      shake();
      return;
    }

    setLoading(true);
    try {
      const loginResponse = await authApi.remoteLogin({
        username: username.trim().toLowerCase(),
        password: password
      });

      if (loginResponse.accessToken) {
        await saveToken(loginResponse.accessToken);
      }
    } catch (error) {
      shake();
      let errorMessage = 'Invalid username or password';
      
      if (error.response?.status === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Connection error. Please check your internet.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      <Text style={tw`text-white text-2xl font-bold text-center mb-8`}>Welcome Back</Text>
      
      {/* Username Input */}
      <View style={tw`mb-4`}>
        <View style={tw`bg-white/10 rounded-2xl flex-row items-center px-4 border border-white/20`}>
          <MaterialCommunityIcons name="account" size={20} color="#9CA3AF" />
          <TextInput
            style={tw`flex-1 py-4 px-3 text-white`}
            placeholder="Username"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
      </View>

      {/* Password Input */}
      <View style={tw`mb-6`}>
        <View style={tw`bg-white/10 rounded-2xl flex-row items-center px-4 border border-white/20`}>
          <MaterialCommunityIcons name="lock" size={20} color="#9CA3AF" />
          <TextInput
            style={tw`flex-1 py-4 px-3 text-white`}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons 
              name={showPassword ? "eye-off" : "eye"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={tw`bg-blue-600 rounded-2xl py-4 mb-4 ${loading ? 'opacity-70' : ''}`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={tw`text-white text-center font-bold text-lg`}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Registration')}
        disabled={loading}
      >
        <Text style={tw`text-gray-400 text-center`}>
          New to AutoCare? <Text style={tw`text-blue-400 font-semibold`}>Create Account</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default LoginForm;