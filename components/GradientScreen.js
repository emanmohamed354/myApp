import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

const GradientScreen = ({ children, colors = ['#3c3f41', '#1a1c1e', '#000'] }) => {
  return (
    <SafeAreaView style={tw`flex-1`}>
      <LinearGradient
        colors={colors}
        style={tw`flex-1`}
      >
        <KeyboardAvoidingView 
          style={tw`flex-1`}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {children}
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default GradientScreen;