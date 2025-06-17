// components/ErrorBoundary/NetworkErrorBoundary.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export const NetworkErrorBoundary = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  if (!isConnected) {
    return (
      <View style={tw`flex-1 bg-gray-900 justify-center items-center p-6`}>
        <MaterialCommunityIcons 
          name="wifi-off" 
          size={60} 
          color="#EF4444" 
        />
        <Text style={tw`text-white text-lg font-bold mt-4`}>
          No Internet Connection
        </Text>
        <Text style={tw`text-gray-400 text-center mt-2`}>
          Please check your internet connection and try again
        </Text>
        <TouchableOpacity
          onPress={() => NetInfo.fetch().then(state => {
            setIsConnected(state.isConnected ?? true);
          })}
          style={tw`bg-blue-600 px-4 py-2 rounded-lg mt-4`}
        >
          <Text style={tw`text-white`}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
};