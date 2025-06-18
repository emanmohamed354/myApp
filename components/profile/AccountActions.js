import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const AccountActions = ({ onLogout }) => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: onLogout
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account', 
      'Please contact support to delete your account'
    );
  };

  return (
    <View style={tw`px-4 pb-8 mt-4`}>
      <TouchableOpacity
        style={tw`bg-red-900/20 rounded-xl p-4 items-center`}
        onPress={handleLogout}
      >
        <View style={tw`flex-row items-center`}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={tw`text-red-400 ml-2 font-medium`}>Logout</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`bg-gray-800 rounded-xl p-4 items-center mt-3`}
        onPress={handleDeleteAccount}
      >
        <Text style={tw`text-gray-400 font-medium`}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountActions;