import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { getNotificationIcon } from './utils/helpers';
import { formatFullDate } from './utils/formatters';

const NotificationModal = ({ 
  visible, 
  notification, 
  onClose, 
  insets 
}) => {
  if (!notification) return null;

  const icon = getNotificationIcon(notification.type);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-end bg-black/50`}>
        <TouchableOpacity 
          style={tw`flex-1`} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={tw`bg-gray-800 rounded-t-3xl`}>
          {/* Modal Handle */}
          <View style={tw`items-center py-2`}>
            <View style={tw`w-12 h-1 bg-gray-600 rounded-full`} />
          </View>
          
          <View style={tw`p-6 pb-${insets.bottom / 4 + 6}`}>
            {/* Modal Header */}
            <View style={tw`flex-row items-start mb-4`}>
              <View 
                style={[
                  tw`rounded-full p-3 mr-4`,
                  { backgroundColor: `${icon.color}20` }
                ]}
              >
                <Ionicons 
                  name={icon.name} 
                  size={28} 
                  color={icon.color} 
                />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-lg font-bold mb-1`}>
                  {notification.title}
                </Text>
                <Text style={tw`text-gray-400 text-sm`}>
                  {formatFullDate(notification.timestamp)}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            {/* Modal Content */}
            <View style={tw`bg-gray-900 rounded-xl p-4 mb-4`}>
              <Text style={tw`text-gray-300 text-base leading-6`}>
                {notification.message}
              </Text>
            </View>
            
            {/* Notification Type Badge */}
            <View style={tw`flex-row items-center`}>
              <View style={tw`bg-gray-700 rounded-full px-3 py-1`}>
                <Text style={tw`text-gray-300 text-sm capitalize`}>
                  {notification.type} Notification
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;