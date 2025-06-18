import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const EmptyState = () => {
  return (
    <View style={tw`flex-1 items-center justify-center py-20`}>
      <Ionicons name="notifications-off-outline" size={60} color="#4B5563" />
      <Text style={tw`text-gray-400 text-lg mt-4`}>No notifications yet</Text>
      <Text style={tw`text-gray-500 text-sm mt-2`}>
        You'll see updates about your vehicle here
      </Text>
    </View>
  );
};

export default EmptyState;