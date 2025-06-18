import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const SettingItem = ({ 
  icon, 
  label, 
  value, 
  onPress, 
  onValueChange, 
  isSwitch, 
  disabled 
}) => {
  const content = (
    <View style={tw`flex-row items-center justify-between p-4 ${disabled ? 'opacity-50' : ''}`}>
      <View style={tw`flex-row items-center flex-1`}>
        <MaterialCommunityIcons name={icon} size={20} color="#60A5FA" style={tw`mr-3`} />
        <Text style={tw`text-white ${disabled ? 'text-gray-500' : ''}`}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#374151', true: '#3B82F6' }}
          thumbColor={value ? '#fff' : '#9CA3AF'}
          disabled={disabled}
        />
      ) : value !== undefined ? (
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-gray-400 mr-2`}>{value}</Text>
          {onPress && <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />}
        </View>
      ) : onPress ? (
        <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
      ) : null}
    </View>
  );

  if (!isSwitch && onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} style={tw`border-b border-gray-700 last:border-b-0`}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={tw`border-b border-gray-700 last:border-b-0`}>{content}</View>;
};

export default SettingItem;