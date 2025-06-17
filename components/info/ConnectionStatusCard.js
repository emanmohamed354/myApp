// components/ConnectionStatusCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const ConnectionStatusCard = () => (
  <LinearGradient
    colors={['rgba(16, 185, 129, 0.2)', 'rgba(17, 24, 39, 0.8)']}
    style={tw`rounded-xl p-6`}
  >
    <View style={tw`flex-row items-center justify-between`}>
      <View style={tw`flex-row items-center`}>
        <View style={tw`w-12 h-12 rounded-full bg-green-500/20 items-center justify-center mr-3`}>
          <MaterialCommunityIcons 
            name="bluetooth-connect" 
            size={24} 
            color="#10B981" 
          />
        </View>
        <View>
          <Text style={tw`text-white font-medium`}>OBD-II Status</Text>
          <Text style={tw`text-green-400 text-sm`}>Connected</Text>
        </View>
      </View>
      <View style={tw`flex-row items-center`}>
        <View style={tw`w-2 h-2 rounded-full bg-green-400 mr-2`} />
        <Text style={tw`text-green-400 text-sm`}>Active</Text>
      </View>
    </View>
  </LinearGradient>
);

export default ConnectionStatusCard;