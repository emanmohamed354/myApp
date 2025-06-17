// components/EmptyCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const EmptyCard = () => (
  <LinearGradient
    colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
    style={tw`rounded-xl p-6`}
  >
    <View style={tw`items-center justify-center py-8`}>
      <MaterialCommunityIcons name="car-off" size={48} color="#4B5563" />
      <Text style={tw`text-gray-400 mt-4 text-center`}>No vehicle data available</Text>
      <Text style={tw`text-gray-500 mt-2 text-center text-sm`}>
        Make sure your OBD-II device is connected
      </Text>
    </View>
  </LinearGradient>
);

export default EmptyCard;