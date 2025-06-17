// components/SupportedSensorsCard.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const SupportedSensorsCard = ({ carData }) => {
  const [showAll, setShowAll] = useState(false);

  const sensorNames = {
    'ENGINE_RPM': 'Engine RPM',
    'VEHICLE_SPEED': 'Vehicle Speed',
    'FUEL_TANK_LEVEL_INPUT': 'Fuel Level',
    'ENGINE_COOLANT_TEMPERATURE': 'Coolant Temperature',
    'INTAKE_AIR_TEMPERATURE': 'Intake Air Temperature',
    'CALCULATED_ENGINE_LOAD': 'Engine Load',
    'CONTROL_MODULE_VOLTAGE': 'Battery Voltage',
    'FUEL_PRESSURE': 'Fuel Pressure',
    'INTAKE_MANIFOLD_PRESSURE': 'Manifold Pressure',
    'THROTTLE_POSITION': 'Throttle Position',
    'RUN_TIME_SINCE_ENGINE_START': 'Engine Run Time',
    'ENGINE_OIL_TEMP': 'Oil Temperature',
    'TIMING_ADVANCE': 'Timing Advance',
    'MAF_AIR_FLOW_RATE': 'Air Flow Rate',
    'AMBIENT_AIR_TEMPERATURE': 'Ambient Temperature',
    'BAROMETRIC_PRESSURE': 'Barometric Pressure',
    'DISTANCE_TRAVELED_SINCE_CODES_CLEARED': 'Distance Since Reset'
  };

  const sensorsToShow = showAll 
    ? carData.supportedSensors 
    : carData.supportedSensors?.slice(0, 5);

  return (
    <LinearGradient
      colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
      style={tw`rounded-xl p-6 mb-4`}
    >
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View style={tw`flex-row items-center`}>
          <MaterialCommunityIcons 
            name="chip" 
            size={24} 
            color="#60A5FA" 
            style={tw`mr-2`}
          />
          <Text style={tw`text-lg font-bold text-white`}>Supported Sensors</Text>
        </View>
        <Text style={tw`text-gray-400 text-sm`}>
          {carData.supportedSensors?.length || 0} total
        </Text>
      </View>
      
      <View>
        {sensorsToShow?.map((sensor, index) => (
          <View 
            key={sensor} 
            style={tw`flex-row items-center py-3 ${
              index !== sensorsToShow.length - 1 ? 'border-b border-gray-800' : ''
            }`}
          >
            <View style={tw`w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3`}>
              <MaterialCommunityIcons 
                name="circle-medium" 
                size={16} 
                color="#60A5FA" 
              />
            </View>
            <Text style={tw`text-gray-300 flex-1`}>
              {sensorNames[sensor] || sensor}
            </Text>
          </View>
        ))}
      </View>

      {carData.supportedSensors?.length > 5 && (
        <TouchableOpacity
          onPress={() => setShowAll(!showAll)}
          style={tw`mt-4 py-2 items-center`}
        >
          <Text style={tw`text-blue-400 text-sm font-medium`}>
            {showAll ? 'Show Less' : `Show All (${carData.supportedSensors.length})`}
          </Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

export default SupportedSensorsCard;