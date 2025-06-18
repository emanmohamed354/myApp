// components/sync/SensorReadingsSection.js
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import SensorReadingCard from './SensorReadingCard';

const SensorReadingsSection = ({ readings, fadeAnim }) => {
  const criticalReadings = readings.filter(reading => 
    Object.values(reading.readings).some(sensor => sensor.severity === 'critical')
  );

  if (criticalReadings.length === 0) {
    return (
      <View style={tw`mb-6`}>
        <SectionHeader 
          icon="gauge" 
          title="Sensor Readings" 
          count={readings.length} 
          severity="normal" 
        />
        <View style={tw`bg-green-900/20 rounded-xl p-4 border border-green-800/30`}>
          <View style={tw`flex-row items-center`}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
            <Text style={tw`text-green-400 ml-2`}>All sensors within normal range</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`mb-6`}>
      <SectionHeader 
        icon="gauge-full" 
        title="Critical Sensor Readings" 
        count={criticalReadings.length} 
        severity="critical" 
      />
      {criticalReadings.map((reading, index) => (
        <SensorReadingCard
          key={reading.id}
          reading={reading}
          index={index}
          fadeAnim={fadeAnim}
        />
      ))}
    </View>
  );
};

const SectionHeader = ({ icon, title, count, severity }) => {
  const getColor = () => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <View style={tw`flex-row items-center justify-between mb-4`}>
      <View style={tw`flex-row items-center`}>
        <MaterialCommunityIcons name={icon} size={20} color={getColor()} />
        <Text style={tw`text-white text-lg font-bold ml-2`}>{title}</Text>
      </View>
      <View style={[tw`px-3 py-1 rounded-full`, { backgroundColor: `${getColor()}20` }]}>
        <Text style={[tw`text-sm font-semibold`, { color: getColor() }]}>{count}</Text>
      </View>
    </View>
  );
};

export default SensorReadingsSection;