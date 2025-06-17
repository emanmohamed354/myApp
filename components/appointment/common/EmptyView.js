// components/appointment/common/EmptyView.js
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function EmptyView({ message, icon = "car-repair" }) {
  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-900 px-8`}>
      <MaterialIcons name={icon} size={64} color="#4B5563" />
      <Text style={tw`text-gray-400 mt-4 text-center text-lg`}>
        {message || 'No data available'}
      </Text>
    </View>
  );
}