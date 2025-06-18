import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

const LoadingState = () => {
  return (
    <View style={tw`flex-1 bg-gray-900 justify-center items-center`}>
      <ActivityIndicator size="large" color="#60A5FA" />
    </View>
  );
};

export default LoadingState;