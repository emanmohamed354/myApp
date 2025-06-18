import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import StatsCard from './StatsCard';
import { useHeaderAnimations } from './utils/animations';
import { formatSyncTime } from './utils/formatters';

const AnimatedHeader = ({ 
  insets,
  activeTab,
  diagnosticLogs,
  lastSyncTime,
  isLoading,
  isSyncing,
  onRefresh,
  fadeAnim
}) => {
  const { iconRotateAnim, iconFloatAnim, pulseAnim, statusDotAnim } = useHeaderAnimations();

  const rotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate diagnostic stats
  const activeCodes = diagnosticLogs.filter(log => log.status === 'active').length;
  const pendingCodes = diagnosticLogs.filter(log => log.status === 'pending').length;
  const clearedCodes = diagnosticLogs.filter(log => log.status === 'cleared').length;
  const criticalCodes = diagnosticLogs.filter(log => log.severity === 'critical').length;

  const hasIssues = activeCodes > 0 || criticalCodes > 0;

  return (
    <LinearGradient
      colors={
        hasIssues
          ? ['rgba(220, 38, 38, 0.4)', 'rgba(220, 38, 38, 0.25)', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.9)']
          : ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.25)', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.9)']
      }
      locations={[0, 0.3, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: insets.top }}
    >
      <View style={tw`px-4 pt-4 pb-6`}>
        {/* Decorative Background Icons */}
        <View style={tw`absolute inset-0 flex-row justify-between items-center px-2`}>
          <Animated.View
            style={{
              transform: [{ rotate }, { translateY: iconFloatAnim }],
            }}
          >
            <MaterialCommunityIcons 
              name="car-cog" 
              size={20} 
              color="rgba(255, 255, 255, 0.1)" 
              style={tw`absolute left-0 top-0`}
            />
          </Animated.View>
          
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <FontAwesome5 
              name="tools" 
              size={18} 
              color="rgba(255, 255, 255, 0.1)" 
              style={tw`absolute right-0 top-0`}
            />
          </Animated.View>
        </View>
        
        {/* Main Title Section */}
        <View style={tw`items-center py-2`}>
          <View style={tw`flex-row items-center mb-1`}>
            <MaterialCommunityIcons 
              name="database-search" 
              size={16} 
              color="rgba(255, 255, 255, 0.4)" 
              style={tw`mr-2`}
            />
            <Text style={tw`text-gray-400 text-xs uppercase tracking-wider`}>
              Vehicle Diagnostics
            </Text>
          </View>
          <Text style={tw`text-white text-xl font-bold`}>
            {activeTab === 'sync' ? 'Sensor Readings' : 'System Logs & Codes'}
          </Text>
          <View style={tw`flex-row items-center mt-1`}>
            {activeTab === 'sync' ? (
              <>
                <MaterialCommunityIcons name="cloud-sync" size={14} color="#60A5FA" style={tw`mr-2`} />
                <Text style={tw`text-gray-400 text-xs`}>
                  {lastSyncTime ? `Last sync: ${formatSyncTime(lastSyncTime)}` : 'Not synced yet'}
                </Text>
              </>
            ) : (
              <>
                <Animated.View
                  style={[
                    tw`h-2 w-2 rounded-full mr-2`,
                    {
                      backgroundColor: hasIssues ? '#EF4444' : '#10B981',
                      opacity: statusDotAnim,
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                />
                <Text style={tw`text-gray-400 text-xs`}>
                  {activeCodes > 0 
                    ? `${activeCodes} Active ${activeCodes === 1 ? 'Code' : 'Codes'}` 
                    : 'All Systems Normal'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          onPress={onRefresh}
          disabled={isLoading || isSyncing}
          style={tw`absolute right-4 top-4`}
        >
          <Animated.View
            style={{
              transform: [{
                rotate: (isLoading || isSyncing)
                  ? iconRotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  : '0deg',
              }],
            }}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color={(isLoading || isSyncing) ? "#6B7280" : "#60A5FA"} 
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Stats Cards */}
        {activeTab !== 'sync' && (
          <View style={tw`flex-row justify-between mb-2`}>
            <StatsCard
              count={criticalCodes}
              label="Critical"
              icon="alert-octagon"
              color={criticalCodes > 0 ? "#EF4444" : "#6B7280"}
              gradientColors={
                criticalCodes > 0 
                  ? ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']
                  : ['rgba(55, 65, 81, 0.5)', 'rgba(55, 65, 81, 0.3)']
              }
              animation={{
                opacity: fadeAnim,
                transform: [{ scale: criticalCodes > 0 ? pulseAnim : 1 }],
              }}
            />

            <StatsCard
              count={activeCodes}
              label="Active"
              icon="alert-circle"
              color={activeCodes > 0 ? "#F59E0B" : "#6B7280"}
              gradientColors={
                activeCodes > 0 
                  ? ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']
                  : ['rgba(55, 65, 81, 0.5)', 'rgba(55, 65, 81, 0.3)']
              }
              animation={{
                opacity: fadeAnim,
                transform: [{ translateY: iconFloatAnim }],
              }}
            />

            <StatsCard
              count={clearedCodes}
              label="Cleared"
              icon="check-circle"
              color="#10B981"
              gradientColors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
              animation={{
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              }}
            />
          </View>
        )}

        {/* Progress Bar */}
        <View style={tw`flex-row justify-center items-center mt-4`}>
          <MaterialCommunityIcons 
            name="car-connected" 
            size={14} 
            color="rgba(255, 255, 255, 0.2)" 
            style={tw`mx-1`}
          />
          <View style={tw`h-1 w-16 bg-gray-800 rounded-full mx-2`}>
            <Animated.View 
              style={[
                tw`h-1 rounded-full`,
                {
                  width: `${((activeCodes + pendingCodes) / diagnosticLogs.length) * 100 || 0}%`,
                  backgroundColor: hasIssues ? '#EF4444' : '#10B981',
                  opacity: statusDotAnim,
                }
              ]} 
            />
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
};

export default AnimatedHeader;