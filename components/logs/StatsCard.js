import React from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const StatsCard = ({ 
  count, 
  label, 
  icon, 
  color, 
  gradientColors, 
  animation 
}) => {
  return (
    <Animated.View
      style={[
        tw`w-[31.5%]`,
        animation
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={tw`rounded-xl p-3`}
      >
        <View style={tw`items-center`}>
          <View style={[tw`p-2 rounded-full mb-1`, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons 
              name={icon} 
              size={20} 
              color={color} 
            />
          </View>
          <Text style={tw`text-white text-xl font-bold`}>{count}</Text>
          <Text style={tw`text-gray-400 text-xs`}>{label}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default StatsCard;