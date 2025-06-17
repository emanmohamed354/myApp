// components/appointment/Modals/BookingModal.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { SERVICE_TYPES } from '../../../utils/constants';
import { handleBookAppointment } from '../../../utils/appointmentUtils';

export default function BookingModal({
  visible,
  onClose,
  selectedCenter,
  selectedDate,
  selectedTime,
  serviceType,
  additionalNotes,
  routeDetails,
  onDateChange,
  onTimeChange,
  onServiceTypeChange,
  onNotesChange,
  onConfirm
}) {
  const handleConfirmBooking = () => {
    handleBookAppointment({
      center: selectedCenter,
      serviceType,
      date: selectedDate,
      time: selectedTime,
      notes: additionalNotes,
      onSuccess: () => {
        onConfirm();
        onClose();
      }
    });
  };

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
          style={tw`rounded-t-3xl p-6 max-h-[90%]`}
        >
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-xl font-bold text-white`}>
              Book Appointment
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Center Info */}
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.1)', 'rgba(17, 24, 39, 0.1)']}
              style={tw`p-3 rounded-lg mb-4`}
            >
              <Text style={tw`font-semibold text-white`}>{selectedCenter?.name}</Text>
              <Text style={tw`text-sm text-gray-400 mt-1`}>{selectedCenter?.address}</Text>
            </LinearGradient>

            {/* Service Type */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-300 font-medium mb-2`}>Service Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SERVICE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={tw`mr-2 px-4 py-2 rounded-full ${
                      serviceType === type ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                    onPress={() => onServiceTypeChange(type)}
                  >
                    <Text style={tw`${
                      serviceType === type ? 'text-white' : 'text-gray-300'
                    }`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Date Selection */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-300 font-medium mb-2`}>Date *</Text>
              <TouchableOpacity
                style={tw`bg-gray-800 p-3 rounded-lg flex-row justify-between items-center`}
                onPress={() => {/* Show date picker */}}
              >
                <Text style={tw`text-white`}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                <Ionicons name="calendar" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Time Selection */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-300 font-medium mb-2`}>Preferred Time *</Text>
              
              {/* Available Slots */}
              {selectedCenter?.availableSlots && selectedCenter.availableSlots.length > 0 && (
                <View style={tw`flex-row flex-wrap mb-2`}>
                  {selectedCenter.availableSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={tw`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                        selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === slot 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-gray-800 border-gray-600'
                      }`}
                      onPress={() => {
                        const [time, period] = slot.split(' ');
                        const [hours, minutes] = time.split(':');
                        let hour = parseInt(hours);
                        if (period === 'PM' && hour !== 12) hour += 12;
                        if (period === 'AM' && hour === 12) hour = 0;
                        const newTime = new Date();
                        newTime.setHours(hour, parseInt(minutes || 0));
                        onTimeChange(newTime);
                      }}
                    >
                      <Text style={tw`${
                        selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === slot 
                          ? 'text-white' 
                          : 'text-gray-300'
                      }`}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <TouchableOpacity
                style={tw`bg-gray-800 p-3 rounded-lg flex-row justify-between items-center`}
                onPress={() => {/* Show time picker */}}
              >
                <Text style={tw`text-white`}>
                  Custom time: {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Ionicons name="time" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Additional Notes */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-300 font-medium mb-2`}>
                Additional Notes (Optional)
              </Text>
              <TextInput
                style={tw`bg-gray-800 p-3 rounded-lg h-24 text-white`}
                placeholder="Describe your issue or special requirements..."
                placeholderTextColor="#6B7280"
                multiline
                value={additionalNotes}
                onChangeText={onNotesChange}
                textAlignVertical="top"
              />
            </View>

            {/* Summary */}
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.1)', 'rgba(17, 24, 39, 0.1)']}
              style={tw`p-4 rounded-lg mb-4`}
            >
              <Text style={tw`font-semibold text-white mb-2`}>Appointment Summary</Text>
              <View style={tw`flex-row justify-between mb-1`}>
                <Text style={tw`text-gray-400`}>Service:</Text>
                <Text style={tw`text-white font-medium`}>{serviceType || 'Not selected'}</Text>
              </View>
              <View style={tw`flex-row justify-between mb-1`}>
                <Text style={tw`text-gray-400`}>Date:</Text>
                <Text style={tw`text-white font-medium`}>
                  {selectedDate.toLocaleDateString()}
                </Text>
              </View>
              <View style={tw`flex-row justify-between mb-1`}>
                <Text style={tw`text-gray-400`}>Time:</Text>
                <Text style={tw`text-white font-medium`}>
                  {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {routeDetails && (
                <View style={tw`flex-row justify-between mt-2 pt-2 border-t border-gray-700`}>
                  <Text style={tw`text-gray-400`}>Distance:</Text>
                  <Text style={tw`text-white font-medium`}>{routeDetails.distance} km</Text>
                </View>
              )}
            </LinearGradient>

            {/* Confirm Button */}
            <TouchableOpacity
              style={tw`bg-blue-500 py-4 rounded-lg mb-4 ${!serviceType ? 'opacity-50' : ''}`}
              onPress={handleConfirmBooking}
              disabled={!serviceType}
            >
              <Text style={tw`text-white text-center font-semibold text-lg`}>
                Confirm Appointment
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}