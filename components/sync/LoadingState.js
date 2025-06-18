// components/sync/LoadingState.js
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

const LoadingState = () => {
  return (
    <View style={tw`flex-1 items-center justify-center py-20`}>
      <View style={tw`bg-gray-800 rounded-full p-4 mb-4`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
      <Text style={tw`text-gray-400 font-semibold`}>Loading sync data...</Text>
      <Text style={tw`text-gray-500 text-xs mt-1`}>This may take a moment</Text>
    </View>
  );
};

export default LoadingState;