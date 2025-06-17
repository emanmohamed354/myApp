// components/appointment/MapView/RouteInfoBar.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function RouteInfoBar({ 
  routeDetails, 
  onClearRoute, 
  onViewDirections,
  onStartNavigation 
}) {
  return (
    <View style={tw`absolute top-2 left-4 right-4`}>
      <LinearGradient
        colors={['rgba(31, 41, 55, 0.95)', 'rgba(17, 24, 39, 0.95)']}
        style={tw`rounded-xl shadow-lg p-3`}
      >
        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-sm text-gray-400`}>To: {routeDetails.destination}</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Text style={tw`text-lg font-semibold text-white`}>
                {routeDetails.distance} km
              </Text>
              <Text style={tw`text-lg text-gray-400 ml-3`}>
                ~{routeDetails.duration} min
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={tw`bg-red-500 p-2 rounded-full`}
            onPress={onClearRoute}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={tw`flex-row gap-2 mt-3`}>
          <TouchableOpacity
            style={tw`flex-1 bg-blue-500 py-2 px-3 rounded-lg flex-row items-center justify-center`}
            onPress={onStartNavigation}
          >
            <MaterialCommunityIcons name="navigation" size={20} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white font-medium`}>
              Start Navigation
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`bg-blue-500/20 py-2 px-3 rounded-lg`}
            onPress={onViewDirections}
          >
            <Text style={tw`text-blue-400 text-center font-medium`}>
              Steps
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}