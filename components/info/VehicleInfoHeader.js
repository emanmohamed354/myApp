// components/info/VehicleInfoHeader.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const VehicleInfoHeader = ({ onRefresh, isRefreshing }) => (
  <View style={tw`flex-row items-center justify-between mb-6`}>
    <View style={tw`flex-row items-center flex-1`}>
      <View style={tw`w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center mr-3`}>
        <MaterialCommunityIcons name="car-info" size={24} color="#60A5FA" />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-2xl font-bold text-white`}>
          Vehicle Information
        </Text>
        <Text style={tw`text-gray-400 text-sm`}>
          Your car's complete profile
        </Text>
      </View>
    </View>
    
    {onRefresh && (
      <TouchableOpacity 
        onPress={onRefresh} 
        disabled={isRefreshing}
        style={tw`p-2`}
      >
        <MaterialCommunityIcons 
          name="refresh" 
          size={24} 
          color={isRefreshing ? "#4B5563" : "#60A5FA"}
        />
      </TouchableOpacity>
    )}
  </View>
);

export default VehicleInfoHeader;