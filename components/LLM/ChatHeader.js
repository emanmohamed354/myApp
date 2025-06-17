import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function ChatHeader({ insets, goBack, startNewChat }) {
  return (
    <LinearGradient
      colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
      style={{ paddingTop: insets.top }}
    >
      <View style={tw`px-4 py-4 flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={goBack} style={tw`mr-3`}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <MaterialCommunityIcons name="robot-outline" size={28} color="#60A5FA" />
          <Text style={tw`text-white text-xl font-bold ml-2`}>AI Assistant</Text>
        </View>
        <TouchableOpacity
          onPress={startNewChat}
          style={tw`bg-blue-600 rounded-lg px-3 py-2 flex-row items-center`}
        >
        
          <Ionicons name="add" size={20} color="white" />
          <Text style={tw`text-white ml-1`}>New Chat</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}