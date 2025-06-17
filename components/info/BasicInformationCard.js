// components/info/BasicInformationCard.js
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import InfoItem from './InfoItem';

const BasicInformationCard = ({ carData }) => {
  // Helper to safely get value with fallback
  const getValue = (value, fallback = 'Not specified') => {
    return value || fallback;
  };

  // Handle VIN copy
  const handleVinPress = () => {
    if (carData?.vin) {
      // In a real app, you'd use Clipboard API here
      Alert.alert('VIN', carData.vin, [
        { text: 'OK', style: 'default' }
      ]);
    }
  };

  return (
    <LinearGradient
      colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
      style={tw`rounded-xl p-6 mb-4`}
    >
      <View style={tw`flex-row items-center mb-4`}>
        <MaterialCommunityIcons 
          name="car-side" 
          size={24} 
          color="#60A5FA" 
          style={tw`mr-2`}
        />
        <Text style={tw`text-lg font-bold text-white`}>Basic Information</Text>
      </View>
      
      <InfoItem 
        label="Make" 
        value={getValue(carData?.make)} 
        icon="factory" 
        iconComponent={MaterialCommunityIcons}
      />
      <InfoItem 
        label="Model" 
        value={getValue(carData?.model)} 
        icon="car-sports" 
        iconComponent={MaterialCommunityIcons}
      />
      <InfoItem 
        label="Year" 
        value={getValue(carData?.year?.toString())} 
        icon="calendar-blank" 
        iconComponent={MaterialCommunityIcons}
      />
      <InfoItem 
        label="Trim" 
        value={getValue(carData?.trim)} 
        icon="star-box" 
        iconComponent={MaterialCommunityIcons}
      />
      <InfoItem 
        label="Color" 
        value={getValue(carData?.color)} 
        icon="palette" 
        iconComponent={MaterialCommunityIcons}
      />
      
      {/* VIN Section with copy functionality */}
      <View style={tw`pt-4 mt-4 border-t border-gray-700`}>
        <TouchableOpacity onPress={handleVinPress} activeOpacity={0.7}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center flex-1`}>
              <MaterialCommunityIcons 
                name="identifier" 
                size={16} 
                color="#9CA3AF" 
                style={tw`mr-2`}
              />
              <Text style={tw`text-gray-400 text-sm`}>VIN</Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-gray-300 text-sm font-mono mr-2`}>
                {getValue(carData?.vin, 'No VIN')}
              </Text>
              <MaterialCommunityIcons 
                name="content-copy" 
                size={16} 
                color="#60A5FA"
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Last Updated */}
      {carData?.updated_at && (
        <View style={tw`mt-4 pt-4 border-t border-gray-700`}>
          <Text style={tw`text-gray-400 text-xs text-center`}>
            Last updated: {new Date(carData.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default BasicInformationCard;