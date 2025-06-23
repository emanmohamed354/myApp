// components/sync/SyncSummaryCard.js
import React from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const SyncSummaryCard = ({ syncData, fadeAnim, pulseAnim }) => {
  const readingsCount = syncData?.readings?.length || 0;
  const diagnosticsCount = syncData?.diagnostics?.length || 0;
  const summariesCount = syncData?.summaries?.length || 0;
  const eventsCount = syncData?.events?.length || 0;
  const criticalCount = syncData?.readings?.filter(r =>
    Object.values(r.readings).some(sensor => sensor.severity === 'critical')
  ).length || 0;

  return (
    <Animated.View
      style={[
        tw`mb-6`,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
        style={tw`rounded-xl p-6`}
      >
        <View style={tw`items-center`}>
          <MaterialCommunityIcons name="cloud-check" size={48} color="#3B82F6" />
          <Text style={tw`text-white text-2xl font-bold mt-3`}>Sync Complete</Text>
          <Text style={tw`text-gray-400 text-sm mt-1`}>Vehicle data retrieved successfully</Text>
        </View>

        <View style={tw`flex-row justify-around mt-6`}>
          <StatItem
            count={readingsCount}
            label="Readings"
            icon="gauge"
            color="#3B82F6"
          />
          <StatItem
            count={diagnosticsCount}
            label="Diagnostics"
            icon="car-cog"
            color="#F59E0B"
          />
          <StatItem
            count={criticalCount}
            label="Critical"
            icon="alert-octagon"
            color="#EF4444"
          />
        </View>
        <View style={tw`flex-row justify-around mt-6`}>
          <StatItem
            count={summariesCount}
            label="Summaries"
            icon="chart-box"
            color="#10B981"
          />
          <StatItem
            count={eventsCount}
            label="Events"
            icon="history"
            color="#10B981"
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const StatItem = ({ count, label, icon, color }) => (
  <View style={tw`items-center`}>
    <View style={[tw`p-3 rounded-full mb-2`, { backgroundColor: `${color}20` }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={tw`text-white text-xl font-bold`}>{count}</Text>
    <Text style={tw`text-gray-400 text-xs`}>{label}</Text>
  </View>
);

export default SyncSummaryCard;