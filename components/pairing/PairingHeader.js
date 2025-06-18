import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

const PairingHeader = ({ insets }) => {
  return (
    <LinearGradient
      colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
      style={{ paddingTop: insets.top }}
    >
      <View style={tw`px-6 py-6`}>
        <Text style={tw`text-white text-3xl font-bold`}>Pair Your Vehicle</Text>
        <Text style={tw`text-gray-300 mt-2`}>Connect your car to unlock all features</Text>
      </View>
    </LinearGradient>
  );
};

export default PairingHeader;