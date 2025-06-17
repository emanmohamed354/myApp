// components/appointment/AppointmentHeader.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import carsBackground from '../../assets/images/carCenter.webp';

export default function AppointmentHeader({ onRefresh, showingRoute }) {
  const insets = useSafeAreaInsets();
  const [iconAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate icons floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(iconAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatingIcons = [

    { icon: 'oil-can', type: 'FontAwesome5', size: 18, top: 40, left: '15%' },
    { icon: 'wrench', type: 'FontAwesome5', size: 16, top: 25, left: '35%' },
    { icon: 'car-battery', type: 'MaterialCommunityIcons', size: 22, top: 50, left: '50%' },
    { icon: 'tire', type: 'MaterialCommunityIcons', size: 20, top: 30, right: '35%' },
    { icon: 'tools', type: 'FontAwesome5', size: 18, top: 45, right: '15%' },
    { icon: 'engine', type: 'MaterialCommunityIcons', size: 24, top: 20, right: 20 },
    { icon: 'car-cog', type: 'MaterialCommunityIcons', size: 20, bottom: 40, left: '10%' },
    { icon: 'speedometer', type: 'MaterialCommunityIcons', size: 22, bottom: 35, left: '30%' },
    { icon: 'shield-check', type: 'MaterialCommunityIcons', size: 20, bottom: 45, right: '30%' },
    { icon: 'certificate', type: 'FontAwesome5', size: 18, bottom: 40, right: '10%' },
  ];

  const renderIcon = (item, index) => {
    const translateY = iconAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, index % 2 === 0 ? -10 : 10],
    });

    const opacity = iconAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.4, 0.8, 0.4],
    });

    const IconComponent = 
      item.type === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
      item.type === 'FontAwesome5' ? FontAwesome5 : Ionicons;

    return (
      <Animated.View
        key={index}
        style={[
          tw`absolute`,
          {
            top: item.top,
            bottom: item.bottom,
            left: item.left,
            right: item.right,
            transform: [{ translateY }],
            opacity,
          }
        ]}
      >
        <IconComponent 
          name={item.icon} 
          size={item.size} 
          color="rgba(96, 165, 250, 0.4)" 
        />
      </Animated.View>
    );
  };

  return (
    <View style={{ height: 160 + insets.top }}>
      <ImageBackground
        source={carsBackground}
        style={tw`w-full h-full`}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.9)', 
            'rgba(0,0,0,0.8)', 
            'rgba(17,24,39,0.95)'
          ]}
          style={[tw`flex-1`, { paddingTop: insets.top }]}
        >
          {/* Floating Icons Background */}
          {floatingIcons.map((item, index) => renderIcon(item, index))}

          <View style={tw`flex-1 px-4 py-4 justify-center items-center`}>
            {/* Main Title Section */}
            <View style={tw`items-center`}>
              <View style={tw`flex-row items-center mb-2`}>
                <MaterialCommunityIcons 
                  name="car-wrench" 
                  size={28} 
                  color="#60A5FA" 
                  style={tw`mr-2`}
                />
                <Text style={tw`text-3xl font-bold text-white`}>
                  {showingRoute ? 'Navigate to Service' : 'Auto Care Hub'}
                </Text>
                <MaterialCommunityIcons 
                  name="car-cog" 
                  size={28} 
                  color="#60A5FA" 
                  style={tw`ml-2`}
                />
              </View>
              
              <Text style={tw`text-gray-300 text-center px-8`}>
                {showingRoute 
                  ? 'Following the best route to your destination' 
                  : 'Find & book trusted car service centers near you'}
              </Text>

              {/* Service Icons Row */}
              <View style={tw`flex-row items-center mt-4`}>
                <View style={tw`bg-blue-500/20 px-3 py-1 rounded-full flex-row items-center mr-2`}>
                  <FontAwesome5 name="oil-can" size={12} color="#60A5FA" />
                  <Text style={tw`text-blue-400 text-xs ml-1`}>Oil Change</Text>
                </View>
                <View style={tw`bg-green-500/20 px-3 py-1 rounded-full flex-row items-center mr-2`}>
                  <MaterialCommunityIcons name="tire" size={12} color="#10B981" />
                  <Text style={tw`text-green-400 text-xs ml-1`}>Tire Service</Text>
                </View>
                <View style={tw`bg-yellow-500/20 px-3 py-1 rounded-full flex-row items-center`}>
                  <MaterialCommunityIcons name="engine" size={12} color="#F59E0B" />
                  <Text style={tw`text-yellow-400 text-xs ml-1`}>Engine Check</Text>
                </View>
              </View>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity 
              onPress={onRefresh}
              style={tw`absolute right-4 top-1 w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center`}
            >
              <Ionicons name="refresh" size={20} color="#60A5FA" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}