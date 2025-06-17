// components/appointment/MapView/SelectedCenterInfo.js
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { callCenter } from '../../../utils/phoneUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SelectedCenterInfo({ center, onBookPress, onDirectionsPress, onDismiss }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  useEffect(() => {
    // Animate entry
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
  }, [center]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward swipes
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          // Dismiss if swiped down more than 50 pixels
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true
          }).start(() => {
            if (onDismiss) onDismiss();
          });
        } else {
          // Spring back to position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11
          }).start();
        }
        lastGestureDy.current = 0;
      }
    })
  ).current;

  if (!center) return null;

  return (
    <Animated.View 
      style={[
        tw`absolute bottom-0 left-0 right-0`,
        {
          transform: [{ translateY }]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={['rgba(31, 41, 55, 0.98)', 'rgba(17, 24, 39, 0.98)']}
        style={tw`rounded-t-3xl shadow-lg p-4`}
      >
        {/* Swipe Indicator */}
        <View style={tw`w-16 h-1 bg-gray-600 rounded-full self-center mb-3`} />
        
        {/* Center Header with Icons */}
        <View style={tw`flex-row items-start mb-3`}>
          <View style={tw`w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center mr-3`}>
            <MaterialCommunityIcons name="car-wrench" size={24} color="#60A5FA" />
          </View>
          
          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold text-white`}>
              {center.name}
            </Text>
            <Text style={tw`text-gray-400 text-sm mt-1`}>{center.address}</Text>
          </View>

          {/* Status Badge */}
          <View style={tw`${center.isOpen ? 'bg-green-500/20' : 'bg-red-500/20'} px-3 py-1 rounded-full`}>
            <Text style={tw`${center.isOpen ? 'text-green-400' : 'text-red-400'} text-xs font-medium`}>
              {center.isOpen ? 'Open Now' : 'Closed'}
            </Text>
          </View>
        </View>
        
        {/* Info Grid */}
        <View style={tw`flex-row flex-wrap mb-4`}>
          <View style={tw`flex-row items-center mr-4 mb-2`}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={tw`ml-1 text-yellow-400 font-medium`}>{center.rating.toFixed(1)}</Text>
            <Text style={tw`text-gray-500 text-xs ml-1`}>(124)</Text>
          </View>
          
          <View style={tw`flex-row items-center mr-4 mb-2`}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color="#60A5FA" />
            <Text style={tw`ml-1 text-blue-400`}>{center.distance}</Text>
          </View>
          
          <View style={tw`flex-row items-center mb-2`}>
            <MaterialCommunityIcons name="currency-usd" size={16} color="#10B981" />
            <Text style={tw`text-green-400`}>{center.priceRange}</Text>
          </View>
        </View>

       

        {/* Available Time Slots */}
        {center.availableSlots && center.availableSlots.length > 0 && (
          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-400 text-xs font-medium mb-2`}>AVAILABLE TODAY</Text>
            <View style={tw`flex-row`}>
              {center.availableSlots.slice(0, 3).map((slot, index) => (
                <View key={index} style={tw`bg-blue-500/20 px-3 py-1 rounded-full mr-2`}>
                  <Text style={tw`text-blue-400 text-xs`}>{slot}</Text>
                </View>
              ))}
              {center.availableSlots.length > 3 && (
                <Text style={tw`text-gray-500 text-xs self-center`}>+{center.availableSlots.length - 3}</Text>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={tw`flex-row gap-3`}>
          <TouchableOpacity
            style={tw`flex-1 bg-blue-500 py-3 rounded-xl flex-row items-center justify-center`}
            onPress={onBookPress}
          >
            <MaterialCommunityIcons name="calendar-clock" size={20} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white font-semibold`}>
              Book Appointment
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`bg-gray-700 px-4 py-3 rounded-xl`}
            onPress={() => callCenter(center.phone)}
          >
            <Ionicons name="call" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`bg-gray-700 px-4 py-3 rounded-xl`}
            onPress={onDirectionsPress}
          >
            <Ionicons name="navigate" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}