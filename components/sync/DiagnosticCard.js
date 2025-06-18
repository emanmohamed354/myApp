// components/sync/DiagnosticCard.js
import React from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { getSeverityColor, getSeverityIcon } from '../logs/utils/helpers';

const DiagnosticCard = ({ diagnostic, index, fadeAnim }) => {
  const animStyle = {
    opacity: fadeAnim,
    transform: [{
      translateY: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    }],
  };

  const severityColor = getSeverityColor(diagnostic.severity);

  return (
    <Animated.View style={[tw`mb-3`, animStyle]}>
      <TouchableOpacity
        style={tw`bg-gray-800 rounded-xl overflow-hidden`}
        activeOpacity={0.8}
      >
        <View style={tw`p-4`}>
          <View style={tw`flex-row items-start`}>
            <View style={[tw`p-2 rounded-lg mr-3`, { backgroundColor: `${severityColor}20` }]}>
              <MaterialCommunityIcons 
                name={getSeverityIcon(diagnostic.severity)} 
                size={24} 
                color={severityColor} 
              />
            </View>
            
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center justify-between mb-1`}>
                <Text style={tw`text-white font-bold text-lg`}>{diagnostic.code}</Text>
                <View style={[tw`px-2 py-1 rounded-full`, { backgroundColor: `${severityColor}20` }]}>
                  <Text style={[tw`text-xs font-semibold`, { color: severityColor }]}>
                    {diagnostic.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={tw`text-gray-300 text-sm mb-2`}>{diagnostic.description}</Text>
              
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center`}>
                  <MaterialCommunityIcons name="counter" size={14} color="#6B7280" />
                  <Text style={tw`text-gray-400 text-xs ml-1`}>
                    {diagnostic.occurrenceCount} occurrences
                  </Text>
                </View>
                
                <View style={tw`flex-row items-center`}>
                  <View style={[tw`w-2 h-2 rounded-full mr-1`, { backgroundColor: severityColor }]} />
                  <Text style={tw`text-gray-400 text-xs capitalize`}>
                    {diagnostic.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Side accent */}
        <View style={[tw`absolute left-0 top-0 bottom-0 w-1`, { backgroundColor: severityColor }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DiagnosticCard;