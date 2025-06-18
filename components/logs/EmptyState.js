import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const EmptyState = ({ type }) => {
  const emptyStateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(emptyStateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(emptyStateAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = emptyStateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={tw`flex-1 items-center justify-center py-20`}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialCommunityIcons 
          name={type === 'diagnostic' ? 'car-cog' : 'calendar-check'} 
          size={80} 
          color="#4B5563" 
        />
      </Animated.View>
      <Text style={tw`text-gray-400 text-lg mt-6 font-semibold`}>
        No {type} logs found
      </Text>
      <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>
        {type === 'diagnostic' 
          ? 'Your vehicle has no diagnostic trouble codes'
          : 'No events have been logged yet'}
      </Text>
      <View style={tw`mt-6 px-8`}>
        <View style={tw`bg-gray-800/50 rounded-xl p-4`}>
          <Text style={tw`text-green-400 text-center text-sm`}>
            ✓ All systems operating normally
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EmptyState;