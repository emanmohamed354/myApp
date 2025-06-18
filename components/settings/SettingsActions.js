import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { showUnpairAlert, showLogoutAlert } from './utils/alerts';

const SettingsActions = ({ isCarPaired, onUnpair, onLogout }) => {
  const handleUnpair = () => {
    showUnpairAlert(async () => {
      try {
        await onUnpair();
        Alert.alert('Success', 'Vehicle unpaired successfully');
      } catch (error) {
        console.error('Unpair error:', error);
        Alert.alert('Error', 'Failed to unpair vehicle. Please try again.');
      }
    });
  };

  const handleLogout = () => {
    showLogoutAlert(async () => {
      try {
        await onLogout();
      } catch (error) {
        console.error('Logout error:', error);
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    });
  };

  return (
    <View style={tw`px-4 pb-8 mt-4`}>
      {isCarPaired && (
        <TouchableOpacity
          style={tw`bg-orange-900/20 rounded-xl p-4 items-center mb-3`}
          onPress={handleUnpair}
        >
          <View style={tw`flex-row items-center`}>
            <MaterialCommunityIcons name="car-off" size={20} color="#FB923C" />
            <Text style={tw`text-orange-400 ml-2 font-medium`}>Unpair Vehicle</Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={tw`bg-red-900/20 rounded-xl p-4 items-center`}
        onPress={handleLogout}
      >
        <View style={tw`flex-row items-center`}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={tw`text-red-400 ml-2 font-medium`}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsActions;