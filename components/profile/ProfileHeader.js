import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const ProfileHeader = ({ 
  insets, 
  navigation, 
  isCarPaired, 
  editing, 
  onEditToggle, 
  onSave 
}) => {
  return (
    <LinearGradient
      colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
      style={{ paddingTop: insets.top }}
    >
      <View style={tw`px-4 py-4 flex-row justify-between items-center`}>
        {isCarPaired ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={tw`w-6`} />
        )}
        <Text style={tw`text-white text-xl font-bold`}>Profile</Text>
        <TouchableOpacity onPress={editing ? onSave : onEditToggle}>
          <Text style={tw`text-blue-400 font-medium`}>
            {editing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ProfileHeader;