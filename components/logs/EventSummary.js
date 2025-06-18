import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const EventSummary = ({ eventLogs }) => {
  return (
    <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
      <View style={tw`flex-row items-center mb-2`}>
        <MaterialCommunityIcons name="timeline" size={16} color="#60A5FA" />
        <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
          Event Timeline
        </Text>
      </View>
      <Text style={tw`text-gray-400 text-xs leading-5`}>
        {eventLogs.length} system {eventLogs.length === 1 ? 'event' : 'events'} recorded. 
        Latest event: {eventLogs[0]?.event || 'Unknown'}
      </Text>
    </View>
  );
};

export default EventSummary;