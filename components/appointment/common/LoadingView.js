// components/appointment/common/LoadingView.js
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

export default function LoadingView({ message }) {
  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
      <ActivityIndicator size="large" color="#60A5FA" />
      <Text style={tw`mt-4 text-gray-400`}>
        {message || 'Loading...'}
      </Text>
    </View>
  );
}