// components/appointment/Modals/DirectionsModal.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function DirectionsModal({ visible, onClose, routeDetails, onBookPress }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
        <LinearGradient
          colors={['rgba(31, 41, 55, 0.98)', 'rgba(17, 24, 39, 0.98)']}
          style={tw`rounded-t-3xl p-6 max-h-[80%]`}
        >
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-xl font-bold text-white`}>
              Directions to {routeDetails?.destination}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={['rgba(59, 130, 246, 0.1)', 'rgba(17, 24, 39, 0.1)']}
            style={tw`p-3 rounded-lg mb-4`}
          >
            <View style={tw`flex-row justify-between`}>
              <Text style={tw`text-gray-400`}>Total Distance:</Text>
              <Text style={tw`font-semibold text-white`}>{routeDetails?.distance} km</Text>
            </View>
            <View style={tw`flex-row justify-between mt-1`}>
              <Text style={tw`text-gray-400`}>Estimated Time:</Text>
              <Text style={tw`font-semibold text-white`}>~{routeDetails?.duration} minutes</Text>
            </View>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false}>
            {routeDetails?.directions?.map((step, index) => (
              <View key={index} style={tw`flex-row items-start mb-4`}>
                <View style={tw`bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3`}>
                  <Text style={tw`text-white font-semibold`}>{index + 1}</Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white font-medium`}>{step.instruction}</Text>
                  <Text style={tw`text-gray-400 text-sm mt-1`}>
                    {step.distance} • ~{step.duration}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={tw`bg-blue-500 py-3 rounded-lg mt-4`}
            onPress={onBookPress}
          >
            <Text style={tw`text-white text-center font-semibold`}>
              Book Appointment at Destination
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
}