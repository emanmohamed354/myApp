// components/CriticalSensorsSection.js
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import tw from 'twrnc';
import SensorIndicator from './SensorIndicator';
import MainRPMIndicator from './MainRPMIndicator';
import { sensorConfig } from '../../utils/sensorConfig';

export default function CriticalSensorsSection({ sensorData }) {
  const insets = useSafeAreaInsets();
  const safeData = sensorData || {};

  return (
    <LinearGradient
      colors={[
        'rgba(220, 38, 38, 0.4)',
        'rgba(220, 38, 38, 0.25)',
        'rgba(0, 0, 0, 0.6)',
        'rgba(0, 0, 0, 0.9)'
      ]}
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: insets.top }} // Gradient extends to top, padding for content only
    >
      <View style={tw`px-4 pt-4 pb-6`}>
        {/* Decorative Header Section */}
        <View style={tw`relative mb-4`}>
          {/* Background decorative icons */}
          <View style={tw`absolute inset-0 flex-row justify-between items-center px-2`}>
            <MaterialCommunityIcons 
              name="engine" 
              size={20} 
              color="rgba(255, 255, 255, 0.1)" 
              style={tw`absolute left-0 top-0`}
            />
            <FontAwesome5 
              name="tachometer-alt" 
              size={18} 
              color="rgba(255, 255, 255, 0.1)" 
              style={tw`absolute right-0 top-0`}
            />
            <MaterialCommunityIcons 
              name="speedometer" 
              size={20} 
              color="rgba(255, 255, 255, 0.1)" 
              style={tw`absolute left-8 bottom-0`}
            />
            <MaterialCommunityIcons 
              name="oil-temperature" 
              size={20} 
              color="rgba(255, 255, 255, 0.1)" 
              style={tw`absolute right-8 bottom-0`}
            />
          </View>
          
          {/* Main Title Section */}
          <View style={tw`items-center py-2`}>
            <View style={tw`flex-row items-center mb-1`}>
              <MaterialCommunityIcons 
                name="car-cruise-control" 
                size={16} 
                color="rgba(255, 255, 255, 0.4)" 
                style={tw`mr-2`}
              />
              <Text style={tw`text-gray-400 text-xs uppercase tracking-wider`}>
                Live Engine Monitoring
              </Text>
              <MaterialCommunityIcons 
                name="car-cruise-control" 
                size={16} 
                color="rgba(255, 255, 255, 0.4)" 
                style={tw`ml-2`}
              />
            </View>
            <Text style={tw`text-white text-xl font-bold`}>
              Real-Time Performance
            </Text>
            <View style={tw`flex-row items-center mt-1`}>
              <View style={tw`h-1 w-1 rounded-full bg-green-400 mr-2`} />
              <Text style={tw`text-gray-500 text-xs`}>
                All Systems Active
              </Text>
              <View style={tw`h-1 w-1 rounded-full bg-green-400 ml-2`} />
            </View>
          </View>
        </View>

        {/* Center Layout with Main Indicator */}
        <View style={tw`items-center mb-4`}>
          <MainRPMIndicator
            value={safeData.ENGINE_RPM || 0}
            size={180}
          />
        </View>

        {/* Three Secondary Indicators Below */}
        <View style={tw`flex-row justify-around px-2`}>
          <View style={tw`items-center`}>
            <SensorIndicator
              value={safeData.VEHICLE_SPEED || 0}
              config={sensorConfig.critical.VEHICLE_SPEED}
              size={90}
            />
          </View>
          <View style={tw`items-center`}>
            <SensorIndicator
              value={safeData.ENGINE_COOLANT_TEMPERATURE || 0}
              config={sensorConfig.critical.ENGINE_COOLANT_TEMPERATURE}
              size={90}
            />
          </View>
          <View style={tw`items-center`}>
            <SensorIndicator
              value={safeData.CALCULATED_ENGINE_LOAD || 0}
              config={sensorConfig.critical.ENGINE_LOAD}
              size={90}
            />
          </View>
        </View>

        {/* Bottom decorative elements */}
        <View style={tw`flex-row justify-center items-center mt-4`}>
          <MaterialCommunityIcons 
            name="car-connected" 
            size={14} 
            color="rgba(255, 255, 255, 0.2)" 
            style={tw`mx-1`}
          />
          <View style={tw`h-1 w-16 bg-gray-800 rounded-full mx-2`}>
            <View style={tw`h-1 w-8 bg-blue-500 rounded-full opacity-50`} />
          </View>
          <MaterialCommunityIcons 
            name="bluetooth-connect" 
            size={14} 
            color="rgba(255, 255, 255, 0.2)" 
            style={tw`mx-1`}
          />
        </View>
      </View>
    </LinearGradient>
  );
}