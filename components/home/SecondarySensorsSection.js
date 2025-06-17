// components/SecondarySensorsSection.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import SensorBlock from './SensorBlock';
import { sensorConfig } from '../../utils/sensorConfig';

export default function SecondarySensorsSection({ sensorData }) {
  const [showAllSensors, setShowAllSensors] = useState(false);
  
  const visibleSecondary = showAllSensors 
    ? sensorConfig.secondary 
    : sensorConfig.secondary.slice(0, 6);

  return (
    <View style={tw`px-4 py-4`}>
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <Text style={tw`text-white text-lg font-semibold`}>Other Sensors</Text>
        <TouchableOpacity
          onPress={() => setShowAllSensors(!showAllSensors)}
          style={tw`flex-row items-center`}
        >
          <Text style={tw`text-blue-400 mr-1`}>
            {showAllSensors ? 'Show Less' : 'Show More'}
          </Text>
          <FontAwesome5 
            name={showAllSensors ? 'chevron-up' : 'chevron-down'} 
            size={12} 
            color="#60A5FA" 
          />
        </TouchableOpacity>
      </View>

      {/* Sensor Blocks Grid */}
      <View style={tw`flex-row flex-wrap -mx-1`}>
        {visibleSecondary.map((sensor, index) => (
          <View key={index} style={tw`w-1/3 p-1`}>
            <SensorBlock
              name={sensor.name}
              value={sensorData[sensor.apiKey] || null}
              unit={sensor.unit}
              icon={sensor.icon}
            />
          </View>
        ))}
      </View>
    </View>
  );
}