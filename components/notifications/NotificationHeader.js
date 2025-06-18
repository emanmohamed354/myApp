import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const NotificationHeader = ({ 
  insets, 
  navigation, 
  unreadCount, 
  onMarkAllRead 
}) => {
  return (
    <LinearGradient
      colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
      style={{ paddingTop: insets.top }}
    >
      <View style={tw`px-4 py-4`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={tw`mr-3`}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={tw`text-white text-xl font-bold`}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={tw`ml-2 bg-red-500 rounded-full px-2 py-0.5`}>
                <Text style={tw`text-white text-xs font-bold`}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={onMarkAllRead}
              style={tw`bg-blue-600 rounded-lg px-3 py-2`}
            >
              <Text style={tw`text-white text-sm`}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

export default NotificationHeader;