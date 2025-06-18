import React from 'react';
import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { getEventIcon } from './utils/helpers';
import { formatDate } from './utils/formatters';

const EventLog = ({ log, index, itemAnimation, fadeAnim }) => {
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

  const eventIcon = getEventIcon(log.event || '');

  const handleViewDetails = () => {
    if (log.details) {
      Alert.alert('Event Details', JSON.stringify(log.details, null, 2));
    }
  };

  return (
    <Animated.View key={log.id} style={[tw`mb-3`, animStyle]}>
      <View style={tw`bg-gray-800/50 rounded-xl overflow-hidden`}>
        <View style={tw`p-4`}>
          {/* Header */}
          <View style={tw`flex-row items-start justify-between mb-2`}>
            <View style={tw`flex-row items-start flex-1`}>
              <View style={tw`bg-gray-700/50 p-2 rounded-lg mr-3`}>
                <MaterialCommunityIcons 
                  name={eventIcon.name} 
                  size={20} 
                  color={eventIcon.color} 
                />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white font-semibold mb-1`}>{log.event}</Text>
                <Text style={tw`text-gray-500 text-xs`}>
                  {formatDate(log.timestamp)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Description */}
          {log.description && (
            <Text style={tw`text-gray-400 text-sm mt-2 leading-5`}>
              {log.description}
            </Text>
          )}
          
          {/* Details */}
          {log.details && (
            <TouchableOpacity 
              style={tw`mt-3`}
              onPress={handleViewDetails}
            >
              <View style={tw`bg-gray-900/50 rounded-lg p-3 flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center`}>
                  <MaterialCommunityIcons name="code-json" size={16} color="#6B7280" />
                  <Text style={tw`text-gray-500 text-xs ml-2`}>View Details</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#6B7280" />
              </View>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Bottom Timestamp Bar */}
        <View style={tw`bg-gray-900/30 px-4 py-2 flex-row items-center justify-between`}>
          <Text style={tw`text-gray-600 text-xs`}>
            Event ID: {log.id.substring(0, 8)}...
          </Text>
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={12} 
            color="#6B7280" 
          />
        </View>
      </View>
    </Animated.View>
  );
};

export default EventLog;