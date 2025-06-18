import React from 'react';
import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { getSeverityColor, getSeverityIcon, getStatusColor } from './utils/helpers';
import { formatDate } from './utils/formatters';

const DiagnosticLog = ({ log, index, itemAnimation, onClearCode, fadeAnim }) => {
  const animStyle = {
    opacity: itemAnimation || fadeAnim,
    transform: [
      {
        translateY: (itemAnimation || fadeAnim).interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const isActive = log.status === 'active';
  const isPending = log.status === 'pending';
  const isCleared = log.status === 'cleared';

  const handlePress = () => {
    if (!isCleared) {
      Alert.alert(
        'Clear Diagnostic Code',
        `Are you sure you want to clear code ${log.code}?\n\nThis code has occurred ${log.occurrenceCount} times.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear Code',
            style: 'destructive',
            onPress: () => onClearCode(log)
          }
        ]
      );
    }
  };

  return (
    <Animated.View key={log.id} style={[tw`mb-3`, animStyle]}>
      <TouchableOpacity
        style={tw`relative overflow-hidden`}
        onPress={handlePress}
        disabled={isCleared}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isActive ? ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']
            : isPending ? ['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)']
            : ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']
          }
          style={tw`rounded-xl`}
        >
          <View style={tw`p-4`}>
            {/* Header Row */}
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <View style={tw`flex-row items-center flex-1`}>
                <View style={tw`mr-3`}>
                  <MaterialCommunityIcons 
                    name={getSeverityIcon(log.severity)} 
                    size={24} 
                    color={getSeverityColor(log.severity)} 
                  />
                </View>
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center`}>
                    <Text style={tw`text-white font-bold text-lg mr-2`}>{log.code}</Text>
                    <View 
                      style={[
                        tw`px-2 py-0.5 rounded-full`,
                        { backgroundColor: `${getSeverityColor(log.severity)}20` }
                      ]}
                    >
                      <Text style={[tw`text-xs font-semibold`, { color: getSeverityColor(log.severity) }]}>
                        {log.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={tw`flex-row items-center mt-1`}>
                    <View 
                      style={[
                        tw`w-2 h-2 rounded-full mr-1`,
                        { backgroundColor: getStatusColor(log.status) }
                      ]}
                    />
                    <Text style={[tw`text-xs capitalize`, { color: getStatusColor(log.status) }]}>
                      {log.status}
                    </Text>
                  </View>
                </View>
              </View>
              
              {!isCleared && (
                <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
              )}
            </View>
            
            {/* Description */}
            <Text style={tw`text-gray-300 text-sm mb-3 leading-5`}>{log.description}</Text>
            
            {/* Stats Row */}
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-gray-800/50 rounded-lg px-3 py-1.5 mr-2`}>
                  <Text style={tw`text-gray-400 text-xs`}>
                    <Text style={tw`text-white font-semibold`}>{log.occurrenceCount}</Text> occurrences
                  </Text>
                </View>
                {!isCleared && (
                  <View style={tw`bg-gray-800/50 rounded-lg px-3 py-1.5`}>
                    <Text style={tw`text-gray-400 text-xs`}>
                      {formatDate(log.lastOccurrence)}
                    </Text>
                  </View>
                )}
              </View>
              
              {!isCleared && (
                <TouchableOpacity
                  style={tw`bg-red-500/20 px-4 py-2 rounded-lg flex-row items-center`}
                  onPress={handlePress}
                >
                  <MaterialCommunityIcons name="close-circle" size={16} color="#EF4444" />
                  <Text style={tw`text-red-400 text-sm font-semibold ml-1`}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Cleared Info */}
            {isCleared && log.clearedAt && (
              <View style={tw`mt-3 bg-green-500/10 rounded-lg p-2 flex-row items-center`}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                <Text style={tw`text-green-400 text-xs ml-2`}>
                  Cleared on {formatDate(log.clearedAt)}
                </Text>
              </View>
            )}
            
            {/* Sync Status */}
            <View style={tw`absolute top-2 right-2`}>
              {log.synced ? (
                <MaterialCommunityIcons name="cloud-check" size={16} color="#10B981" />
              ) : (
                <MaterialCommunityIcons name="cloud-off-outline" size={16} color="#6B7280" />
              )}
            </View>
          </View>
        </LinearGradient>
        
        {/* Side Accent Bar */}
        <View 
          style={[
            tw`absolute left-0 top-0 bottom-0 w-1`,
            { backgroundColor: getSeverityColor(log.severity) }
          ]} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DiagnosticLog;