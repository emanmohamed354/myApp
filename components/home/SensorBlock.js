import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';

const SensorBlock = ({ name, value, unit, icon }) => {
  return (
    <View style={tw`bg-white rounded-lg p-4 shadow-md m-1 flex-1`}>
      <View style={tw`flex-row items-center mb-2`}>
        <FontAwesome5 name={icon} size={20} color="#6B7280" />
        <Text style={tw`ml-2 text-gray-600 text-xs`}>{name}</Text>
      </View>
      <View style={tw`flex-row items-baseline`}>
        <Text style={tw`text-2xl font-bold text-gray-800`}>
          {value !== null ? Math.round(value) : '--'}
        </Text>
        <Text style={tw`ml-1 text-gray-500 text-sm`}>{unit}</Text>
      </View>
    </View>
  );
};

export default SensorBlock;