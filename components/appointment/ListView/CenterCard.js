// components/appointment/ListView/CenterCard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { callCenter } from '../../../utils/phoneUtils';

export default function CenterCard({ center, onPress, onBookPress, onDirectionsPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
        style={tw`rounded-xl shadow-sm mb-3 p-4`}
      >
        <View style={tw`flex-row justify-between items-start`}>
          <View style={tw`flex-1 pr-3`}>
            <Text style={tw`text-lg font-semibold text-white`}>{center.name}</Text>
            <Text style={tw`text-gray-400 text-sm mt-1`}>{center.address}</Text>
            
            <View style={tw`flex-row items-center mt-2`}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={tw`ml-1 text-sm text-gray-300`}>{center.rating.toFixed(1)}</Text>
              <Text style={tw`ml-3 text-sm text-gray-300`}>
                <Ionicons name="location" size={14} color="#6B7280" /> {center.distance}
              </Text>
              <Text style={tw`ml-3 text-sm text-gray-300`}>{center.priceRange}</Text>
              {center.isOpen ? (
                <Text style={tw`ml-3 text-sm text-green-400 font-medium`}>Open</Text>
              ) : (
                <Text style={tw`ml-3 text-sm text-red-400 font-medium`}>Closed</Text>
              )}
            </View>

            <View style={tw`flex-row flex-wrap mt-2`}>
              {center.services.slice(0, 2).map((service, index) => (
                <View key={index} style={tw`bg-gray-700 px-2 py-1 rounded-full mr-2 mb-1`}>
                  <Text style={tw`text-xs text-gray-300`}>{service}</Text>
                </View>
              ))}
              {center.services.length > 2 && (
                <Text style={tw`text-xs text-gray-400`}>+{center.services.length - 2} more</Text>
              )}
            </View>
          </View>

          <View style={tw`flex-col items-center`}>
            <TouchableOpacity
              style={tw`bg-blue-500 px-4 py-2 rounded-lg mb-2`}
              onPress={onBookPress}
            >
              <Text style={tw`text-white text-sm font-medium`}>Book</Text>
            </TouchableOpacity>
            <View style={tw`flex-row`}>
              <TouchableOpacity
                style={tw`bg-gray-700 p-2 rounded-lg mr-1`}
                onPress={() => callCenter(center.phone)}
              >
                <Ionicons name="call" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`bg-gray-700 p-2 rounded-lg`}
                onPress={onDirectionsPress}
              >
                <Ionicons name="navigate" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}