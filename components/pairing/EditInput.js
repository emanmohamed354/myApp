import React from 'react';
import { View, Text, TextInput } from 'react-native';
import tw from 'twrnc';

const EditInput = ({ label, value, onChangeText, keyboardType = 'default' }) => (
  <View style={tw`mb-4`}>
    <Text style={tw`text-gray-400 text-sm mb-1`}>{label}</Text>
    <TextInput
      style={tw`bg-gray-700 rounded-xl px-4 py-3 text-white`}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#6B7280"
    />
  </View>
);

export default EditInput;