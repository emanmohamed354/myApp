// components/sync/SyncHeader.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const SyncHeader = ({ insets, onBack, onSkip }) => {
  const navigation = useNavigation();
  
  const handleBack = () => {
    // Check if we can go back
    if (navigation.canGoBack()) {
      onBack();
    } else {
      // If can't go back, navigate to home
      navigation.navigate('Home');
    }
  };

  return (
    <LinearGradient
      colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
      style={{ paddingTop: insets.top }}
    >
      <View style={tw`px-6 py-6`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={tw`text-white text-xl font-bold`}>Sync Vehicle Data</Text>
          <TouchableOpacity onPress={onSkip}>
            <Text style={tw`text-gray-400`}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default SyncHeader;