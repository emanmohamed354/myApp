// components/sync/EmptySyncState.js
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const EmptySyncState = ({ onSync, syncing }) => {
  return (
    <View style={tw`flex-1 items-center justify-center py-20`}>
      <View style={tw`bg-gray-800 rounded-full p-6 mb-6`}>
        <MaterialCommunityIcons name="cloud-sync-outline" size={60} color="#4B5563" />
      </View>
      
      <Text style={tw`text-white text-xl font-bold mb-2`}>No Sync Data Available</Text>
      <Text style={tw`text-gray-400 text-center px-8 mb-8`}>
        Sync your vehicle data to view sensor readings and diagnostic codes
      </Text>
      
      <TouchableOpacity
        style={tw`bg-blue-600 rounded-xl px-8 py-4 flex-row items-center ${syncing ? 'opacity-70' : ''}`}
        onPress={onSync}
        disabled={syncing}
      >
        {syncing ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={tw`mr-2`} />
            <Text style={tw`text-white font-semibold`}>Syncing...</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="cloud-download" size={20} color="#fff" style={tw`mr-2`} />
            <Text style={tw`text-white font-semibold`}>Sync Now</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EmptySyncState;