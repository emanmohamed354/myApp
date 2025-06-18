// components/sync/SyncActionButtons.js
import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const SyncActionButtons = ({ onContinue, onSync, syncing, showContinue = true }) => {
  return (
    <View style={tw`px-6 py-4 bg-gray-900 border-t border-gray-800`}>
      {showContinue && (
        <TouchableOpacity
          style={tw`bg-blue-600 rounded-xl py-4 mb-3 flex-row items-center justify-center`}
          onPress={onContinue}
        >
          <Text style={tw`text-white font-bold text-lg mr-2`}>Continue to Pairing</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={tw`bg-gray-800 rounded-xl py-3 flex-row items-center justify-center ${syncing ? 'opacity-70' : ''}`}
        onPress={onSync}
        disabled={syncing}
      >
        {syncing ? (
          <>
            <ActivityIndicator size="small" color="#60A5FA" style={tw`mr-2`} />
            <Text style={tw`text-gray-400`}>Syncing...</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="refresh" size={20} color="#60A5FA" style={tw`mr-2`} />
            <Text style={tw`text-gray-400`}>Sync Data</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SyncActionButtons;