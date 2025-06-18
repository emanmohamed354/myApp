import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import tw from 'twrnc';

const CommonIpButton = ({ ip, onPress }) => (
  <TouchableOpacity
    style={tw`bg-gray-700 px-3 py-2 rounded-lg mr-2 mb-2`}
    onPress={onPress}
  >
    <Text style={tw`text-gray-300 text-sm`}>{ip}</Text>
  </TouchableOpacity>
);

export default CommonIpButton;