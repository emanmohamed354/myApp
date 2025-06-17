// components/info/TechnicalDetailsCard.js
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import InfoItem from './InfoItem';

const TechnicalDetailsCard = ({ carData }) => {
  // Helper to safely get value with fallback
  const getValue = (value, fallback = 'Not specified') => {
    return value || fallback;
  };

  // Format supported sensors for display
  const formatSensors = (sensors) => {
    if (!sensors || !Array.isArray(sensors) || sensors.length === 0) {
      return 'None configured';
    }
    return `${sensors.length} sensor${sensors.length > 1 ? 's' : ''}`;
  };

  return (
    <LinearGradient
      colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
      style={tw`rounded-xl p-6 mb-4`}
    >
      <View style={tw`flex-row items-center mb-4`}>
        <MaterialCommunityIcons 
          name="engine" 
          size={24} 
          color="#60A5FA" 
          style={tw`mr-2`}
        />
        <Text style={tw`text-lg font-bold text-white`}>Technical Details</Text>
      </View>
      
      <InfoItem 
        label="Engine Size" 
        value={getValue(carData?.engineSize)} 
        icon="cog" 
        iconComponent={MaterialCommunityIcons}
      />
      <InfoItem 
        label="Transmission" 
        value={getValue(carData?.transmission)} 
        icon="car-shift-pattern" 
        iconComponent={MaterialCommunityIcons}
      />
      <InfoItem 
        label="Fuel Type" 
        value={getValue(carData?.fuelType)} 
        icon="gas-station" 
        iconComponent={MaterialCommunityIcons}
      />
      <InfoItem 
        label="OBD Protocol" 
        value={getValue(carData?.protocol)} 
        icon="lan-connect" 
        iconComponent={MaterialCommunityIcons}
      />
      
      <View style={tw`pt-4 border-t border-gray-700 mt-4`}>
        <InfoItem 
          label="Supported Sensors" 
          value={formatSensors(carData?.supportedSensors)} 
          icon="chip" 
          iconComponent={MaterialCommunityIcons}
        />
        
        {/* Show sensor list if available */}
        {carData?.supportedSensors && carData.supportedSensors.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={tw`mt-2`}
          >
            <View style={tw`flex-row`}>
              {carData.supportedSensors.map((sensor, index) => (
                <View 
                  key={index} 
                  style={tw`bg-blue-500/20 rounded-lg px-3 py-1 mr-2`}
                >
                  <Text style={tw`text-blue-400 text-xs font-medium`}>
                    {sensor}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
};

export default TechnicalDetailsCard;