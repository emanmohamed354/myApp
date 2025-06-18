import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

const LoadingState = () => {
  return (
    <View style={tw`flex-1 items-center justify-center py-20`}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={tw`text-gray-400 mt-2`}>Loading notifications...</Text>
    </View>
  );
};

export default LoadingState;