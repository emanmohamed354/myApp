// components/sync/SensorReadingCard.js
import React from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { formatDate } from '../logs/utils/formatters';
import { getSensorIcon } from '../logs/utils/helpers';

const SensorReadingCard = ({ reading, index, fadeAnim }) => {
  const delay = index * 100;
  
  const animStyle = {
    opacity: fadeAnim,
    transform: [{
      translateY: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    }],
  };

  const criticalSensors = Object.entries(reading.readings)
    .filter(([_, data]) => data.severity === 'critical');

  if (criticalSensors.length === 0) return null;

  return (
    <Animated.View style={[tw`mb-3`, animStyle]}>
      <View style={tw`bg-gray-800 rounded-xl overflow-hidden`}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
          style={tw`px-4 py-3`}
        >
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-gray-300 text-sm`}>
              {formatDate(reading.timestamp)}
            </Text>
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
              <Text style={tw`text-red-400 text-xs ml-1`}>
                {criticalSensors.length} Critical
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Sensor Data */}
        <View style={tw`p-4`}>
          {criticalSensors.map(([sensor, data], idx) => (
            <SensorItem key={sensor} sensor={sensor} data={data} isLast={idx === criticalSensors.length - 1} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const SensorItem = ({ sensor, data, isLast }) => {
  const formattedName = sensor.replace(/_/g, ' ').toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
  
  const getUnit = (sensor) => {
    if (sensor.includes('VOLTAGE')) return 'V';
    if (sensor.includes('PRESSURE')) return 'psi';
    if (sensor.includes('LOAD')) return '%';
    return '';
  };

  return (
    <View style={[tw`flex-row items-center justify-between py-3`, !isLast && tw`border-b border-gray-700`]}>
      <View style={tw`flex-row items-center flex-1`}>
        <View style={tw`bg-gray-700 p-2 rounded-lg mr-3`}>
          <MaterialCommunityIcons 
            name={getSensorIcon(sensor)} 
            size={20} 
            color="#EF4444" 
          />
        </View>
        <Text style={tw`text-gray-300 flex-1`}>{formattedName}</Text>
      </View>
      <View style={tw`items-end`}>
        <Text style={tw`text-red-400 font-bold text-lg`}>
          {data.reading.toFixed(2)} {getUnit(sensor)}
        </Text>
        <Text style={tw`text-gray-500 text-xs`}>{data.severity}</Text>
      </View>
    </View>
  );
};

export default SensorReadingCard;