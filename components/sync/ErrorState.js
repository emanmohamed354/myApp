// components/sync/ErrorState.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const ErrorState = ({ error, onRetry }) => {
  return (
    <View style={tw`flex-1 items-center justify-center py-20`}>
      <MaterialCommunityIcons name="alert-circle" size={60} color="#EF4444" />
      <Text style={tw`text-gray-400 text-lg mt-4`}>Sync Error</Text>
      <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>{error}</Text>
      <TouchableOpacity
        style={tw`bg-blue-600 rounded-lg px-6 py-2 mt-4`}
        onPress={onRetry}
      >
        <Text style={tw`text-white font-semibold`}>Retry Sync</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorState;