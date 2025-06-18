import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const SettingsSection = ({ title, children }) => (
  <View style={tw`mb-6`}>
    <Text style={tw`text-gray-400 text-sm uppercase tracking-wider px-4 mb-3`}>
      {title}
    </Text>
    <View style={tw`bg-gray-800 mx-4 rounded-xl overflow-hidden`}>
      {children}
    </View>
  </View>
);

export default SettingsSection;