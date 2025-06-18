import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { getFieldValue } from './utils/profileHelpers';

const ProfileField = ({ 
  icon, 
  label, 
  value, 
  editable, 
  onChangeText, 
  onPress, 
  keyboardType 
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={!onPress}
    style={tw`flex-row items-center p-4 border-b border-gray-700 last:border-b-0`}
  >
    <MaterialCommunityIcons name={icon} size={20} color="#60A5FA" style={tw`mr-3`} />
    <View style={tw`flex-1`}>
      <Text style={tw`text-gray-400 text-xs mb-1`}>{label}</Text>
      {editable ? (
        <TextInput
          value={value || ''}
          onChangeText={onChangeText}
          style={tw`text-white text-base p-0`}
          placeholderTextColor="#6B7280"
          editable={editable}
          keyboardType={keyboardType || 'default'}
        />
      ) : (
        <Text style={tw`text-white text-base`}>{getFieldValue(value)}</Text>
      )}
    </View>
  </TouchableOpacity>
);

export default ProfileField;