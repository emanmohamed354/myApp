// components/appointment/ViewModeToggle.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

export default function ViewModeToggle({ viewMode, setViewMode, centersCount }) {
  return (
    <LinearGradient
      colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
      style={tw`px-4 py-2`}
    >
      <View style={tw`flex-row bg-gray-800/50 rounded-lg p-1`}>
        <TouchableOpacity
          style={tw`flex-1 py-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-500' : ''}`}
          onPress={() => setViewMode('map')}
        >
          <Text style={tw`text-center font-medium ${viewMode === 'map' ? 'text-white' : 'text-gray-400'}`}>
            Map View
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={tw`flex-1 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500' : ''}`}
          onPress={() => setViewMode('list')}
        >
          <Text style={tw`text-center font-medium ${viewMode === 'list' ? 'text-white' : 'text-gray-400'}`}>
            List View ({centersCount})
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}