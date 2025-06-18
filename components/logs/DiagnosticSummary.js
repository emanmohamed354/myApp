import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const DiagnosticSummary = ({ diagnosticLogs }) => {
  const activeCount = diagnosticLogs.filter(log => log.status === 'active').length;
  
  return (
    <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
      <View style={tw`flex-row items-center mb-2`}>
        <MaterialCommunityIcons name="information" size={16} color="#60A5FA" />
        <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
          Diagnostic Summary
        </Text>
      </View>
      <Text style={tw`text-gray-400 text-xs leading-5`}>
        Your vehicle has {diagnosticLogs.length} diagnostic {diagnosticLogs.length === 1 ? 'code' : 'codes'} recorded. 
        {activeCount > 0 && 
          ` ${activeCount} require attention.`
        }
      </Text>
    </View>
  );
};

export default DiagnosticSummary;