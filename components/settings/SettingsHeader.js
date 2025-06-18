import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

const SettingsHeader = ({ insets, syncing }) => {
  return (
    <LinearGradient
      colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
      style={{ paddingTop: insets.top }}
    >
      <View style={tw`px-4 py-4 flex-row justify-between items-center`}>
        <Text style={tw`text-white text-xl font-bold`}>Settings</Text>
        {syncing && (
          <View style={tw`flex-row items-center`}>
            <ActivityIndicator size="small" color="#60A5FA" />
            <Text style={tw`text-blue-400 ml-2 text-sm`}>Syncing...</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default SettingsHeader;