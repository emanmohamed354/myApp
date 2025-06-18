import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { getNotificationIcon } from './utils/helpers';
import { formatTime } from './utils/formatters';

const NotificationItem = ({ notification, onPress }) => {
  const icon = getNotificationIcon(notification.type);
  const isUnread = !notification.isRead;

  return (
    <TouchableOpacity
      style={tw`mb-3`}
      onPress={() => onPress(notification)}
    >
      <View style={tw`
        bg-gray-800 rounded-xl p-4 
        ${isUnread ? 'border-l-4 border-blue-500' : 'opacity-80'}
      `}>
        <View style={tw`flex-row items-start`}>
          <View 
            style={[
              tw`rounded-full p-2 mr-3`,
              { backgroundColor: `${icon.color}20` }
            ]}
          >
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>
          
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center justify-between mb-1`}>
              <Text style={tw`text-white font-semibold flex-1 ${!isUnread ? 'text-gray-300' : ''}`}>
                {notification.title}
              </Text>
              {isUnread && (
                <View style={tw`w-2 h-2 bg-blue-500 rounded-full ml-2`} />
              )}
            </View>
            
            <Text 
              style={tw`text-gray-400 text-sm mb-2 ${!isUnread ? 'text-gray-500' : ''}`} 
              numberOfLines={2}
            >
              {notification.message}
            </Text>
            
            <Text style={tw`text-gray-500 text-xs`}>
              {formatTime(notification.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;