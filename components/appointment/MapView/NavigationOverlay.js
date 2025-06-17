// components/appointment/MapView/NavigationOverlay.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { getNavigationIcon, formatNavigationInstruction } from '../../../utils/navigationUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NavigationOverlay({ 
  routeDetails, 
  currentStep, 
  userLocation, 
  onExitNavigation 
}) {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const currentDirection = routeDetails.directions[currentStep] || routeDetails.directions[0];
  const nextDirection = routeDetails.directions[currentStep + 1];
  const remainingDistance = calculateRemainingDistance(routeDetails.directions, currentStep);
  const remainingTime = calculateRemainingTime(routeDetails.directions, currentStep);

  useEffect(() => {
    // Animate instruction card when step changes
    Animated.sequence([
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [currentStep]);

  return (
    <>
      {/* Top Navigation Bar */}
      <Animated.View 
        style={[
          tw`absolute top-0 left-0 right-0`,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(17, 24, 39, 0.98)', 'rgba(31, 41, 55, 0.95)']}
          style={tw`px-4 pt-12 pb-4`}
        >
          {/* Current Direction */}
          <View style={tw`bg-blue-500 rounded-2xl p-4 mb-3`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-white/20 p-3 rounded-xl mr-4`}>
                <MaterialCommunityIcons 
                  name={getNavigationIcon(currentDirection)} 
                  size={32} 
                  color="white" 
                />
              </View>
              
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-xl font-bold`}>
                  {formatNavigationInstruction(currentDirection.instruction)}
                </Text>
                <View style={tw`flex-row items-center mt-1`}>
                  <Text style={tw`text-white/80 text-lg`}>
                    {currentDirection.distance}
                  </Text>
                  <View style={tw`w-1 h-1 bg-white/60 rounded-full mx-2`} />
                  <Text style={tw`text-white/80`}>
                    {currentDirection.duration}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Next Direction Preview */}
          {nextDirection && (
            <Animated.View 
              style={[
                tw`bg-gray-800 rounded-xl p-3 flex-row items-center`,
                {
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <View style={tw`bg-gray-700 p-2 rounded-lg mr-3`}>
                <MaterialCommunityIcons 
                  name={getNavigationIcon(nextDirection)} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-gray-400 text-xs`}>Then</Text>
                <Text style={tw`text-gray-200 font-medium`} numberOfLines={1}>
                  {formatNavigationInstruction(nextDirection.instruction)}
                </Text>
              </View>
              <Text style={tw`text-gray-400 text-sm`}>
                {nextDirection.distance}
              </Text>
            </Animated.View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Bottom Info Bar */}
      <View style={tw`absolute bottom-0 left-0 right-0`}>
        <LinearGradient
          colors={['rgba(31, 41, 55, 0.95)', 'rgba(17, 24, 39, 0.98)']}
          style={tw`px-4 pt-4 pb-8`}
        >
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View>
              <Text style={tw`text-gray-400 text-xs`}>Remaining</Text>
              <View style={tw`flex-row items-baseline`}>
                <Text style={tw`text-white text-2xl font-bold`}>{remainingTime}</Text>
                <Text style={tw`text-gray-400 ml-1`}>min</Text>
                <Text style={tw`text-gray-400 mx-2`}>•</Text>
                <Text style={tw`text-white text-lg`}>{remainingDistance}</Text>
                <Text style={tw`text-gray-400 ml-1`}>km</Text>
              </View>
            </View>

            <TouchableOpacity
              style={tw`bg-red-500 px-4 py-3 rounded-xl flex-row items-center`}
              onPress={onExitNavigation}
            >
              <Ionicons name="close" size={20} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-medium`}>Exit</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={tw`bg-gray-700 h-1 rounded-full overflow-hidden`}>
            <View 
              style={[
                tw`bg-blue-500 h-full rounded-full`,
                { width: `${calculateProgress(routeDetails.directions, currentStep)}%` }
              ]} 
            />
          </View>
        </LinearGradient>
      </View>

      {/* Lane Guidance (if available) */}
      {currentDirection.lanes && (
        <View style={tw`absolute top-48 self-center`}>
          <LinearGradient
            colors={['rgba(17, 24, 39, 0.9)', 'rgba(31, 41, 55, 0.9)']}
            style={tw`px-4 py-2 rounded-lg flex-row items-center`}
          >
            <MaterialCommunityIcons name="road-variant" size={20} color="#60A5FA" style={tw`mr-2`} />
            <Text style={tw`text-white`}>Keep {currentDirection.lanes}</Text>
          </LinearGradient>
        </View>
      )}
    </>
  );
}

function calculateRemainingDistance(directions, currentStep) {
  let remaining = 0;
  for (let i = currentStep; i < directions.length; i++) {
    const distance = parseFloat(directions[i].distance);
    remaining += distance;
  }
  return remaining.toFixed(1);
}

function calculateRemainingTime(directions, currentStep) {
  let remaining = 0;
  for (let i = currentStep; i < directions.length; i++) {
    const time = parseInt(directions[i].duration);
    remaining += time;
  }
  return remaining;
}

function calculateProgress(directions, currentStep) {
  return Math.round((currentStep / directions.length) * 100);
}