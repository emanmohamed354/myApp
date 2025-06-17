// components/NoInternet.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const NoInternet = ({ onRetry, message = "This feature requires an internet connection" }) => {
  return (
    <View style={tw`flex-1 bg-gray-900 justify-center items-center p-6`}>
      <View style={tw`bg-gray-800 rounded-3xl p-8 items-center max-w-sm w-full`}>
        <View style={tw`w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-6`}>
          <MaterialCommunityIcons name="wifi-off" size={40} color="#EF4444" />
        </View>
        
        <Text style={tw`text-white text-2xl font-bold text-center mb-3`}>
          No Internet Connection
        </Text>
        
        <Text style={tw`text-gray-400 text-center mb-6`}>
          {message}
        </Text>
        
        {onRetry && (
          <TouchableOpacity
            style={tw`bg-blue-600 rounded-xl px-6 py-3 w-full`}
            onPress={onRetry}
          >
            <Text style={tw`text-white text-center font-semibold`}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default NoInternet;