import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const InfoRow = ({ label, value }) => (
  <View style={tw`flex-row justify-between py-2`}>
    <Text style={tw`text-gray-400`}>{label}</Text>
    <Text style={tw`text-white font-medium`}>{value}</Text>
  </View>
);

export default InfoRow;