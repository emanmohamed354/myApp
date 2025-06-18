import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const UnpairedState = ({ insets }) => {
  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
        style={{ paddingTop: insets.top }}
      >
        <View style={tw`px-4 py-4`}>
          <Text style={tw`text-white text-xl font-bold`}>Notifications</Text>
        </View>
      </LinearGradient>
      
      <View style={tw`flex-1 items-center justify-center`}>
        <Ionicons name="notifications-off-outline" size={60} color="#4B5563" />
        <Text style={tw`text-gray-400 text-lg mt-4`}>No notifications yet</Text>
        <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>
          Complete vehicle pairing to receive notifications
        </Text>
      </View>
    </View>
  );
};

export default UnpairedState;