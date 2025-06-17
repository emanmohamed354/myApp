import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function TypingIndicator() {
  return (
    <View style={tw`flex-row items-center mb-4`}>
      <View style={tw`mr-2`}>
        <View style={tw`bg-blue-600 rounded-full p-2`}>
          <MaterialCommunityIcons name="robot" size={16} color="white" />
        </View>
      </View>
      <View style={tw`bg-gray-800 rounded-2xl px-4 py-3`}>
        <View style={tw`flex-row`}>
          <View style={tw`w-2 h-2 bg-gray-500 rounded-full mr-1`} />
          <View style={tw`w-2 h-2 bg-gray-500 rounded-full mr-1`} />
          <View style={tw`w-2 h-2 bg-gray-500 rounded-full`} />
        </View>
      </View>
    </View>
  );
}