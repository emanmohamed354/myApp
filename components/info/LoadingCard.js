// components/LoadingCard.js
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

const LoadingCard = () => (
  <LinearGradient
    colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
    style={tw`rounded-xl p-6`}
  >
    <View style={tw`items-center justify-center py-8`}>
      <ActivityIndicator size="large" color="#60A5FA" />
      <Text style={tw`text-gray-400 mt-4`}>Loading vehicle data...</Text>
    </View>
  </LinearGradient>
);

export default LoadingCard;