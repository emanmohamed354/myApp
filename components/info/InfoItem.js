import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';

const InfoItem = ({ label, value, icon, iconComponent: IconComponent = FontAwesome5 }) => (
  <View style={tw`flex-row items-center justify-between py-4 border-b border-gray-800`}>
    <View style={tw`flex-row items-center flex-1`}>
      <View style={tw`w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-3`}>
        <IconComponent name={icon} size={18} color="#60A5FA" />
      </View>
      <Text style={tw`text-gray-400 font-medium`}>{label}</Text>
    </View>
    <Text style={tw`text-white font-semibold ml-2`}>{value || 'N/A'}</Text>
  </View>
);

export default InfoItem;