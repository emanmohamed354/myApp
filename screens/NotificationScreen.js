// screens/NotificationScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function NotificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isCarPaired } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    error,
    loadNotifications, 
    markAsRead,
    markAllAsRead 
  } = useNotifications();
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isCarPaired) {
      const unreadIds = notifications
        .filter(notif => !notif.isRead)
        .map(notif => notif.id);
      
      if (unreadIds.length > 0) {
        setTimeout(() => {
          markAsRead(unreadIds);
        }, 2000); // Increased delay to 2 seconds
      }
    }
  }, [notifications, isCarPaired]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return { name: 'calendar', color: '#3B82F6' };
      case 'maintenance':
        return { name: 'build', color: '#F59E0B' };
      case 'alert':
      case 'error':
        return { name: 'alert-circle', color: '#EF4444' };
      case 'warning':
        return { name: 'warning', color: '#F59E0B' };
      case 'info':
        return { name: 'information-circle', color: '#10B981' };
      default:
        return { name: 'notifications', color: '#6B7280' };
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes < 1) return 'Just now';
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 2) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
  };

  const NotificationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={tw`flex-1 justify-end bg-black/50`}>
        <TouchableOpacity 
          style={tw`flex-1`} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)} 
        />
        <View style={tw`bg-gray-800 rounded-t-3xl`}>
          {/* Modal Handle */}
          <View style={tw`items-center py-2`}>
            <View style={tw`w-12 h-1 bg-gray-600 rounded-full`} />
          </View>
          
          {selectedNotification && (
            <View style={tw`p-6 pb-${insets.bottom / 4 + 6}`}>
              {/* Modal Header */}
              <View style={tw`flex-row items-start mb-4`}>
                <View 
                  style={[
                    tw`rounded-full p-3 mr-4`,
                    { backgroundColor: `${getNotificationIcon(selectedNotification.type).color}20` }
                  ]}
                >
                  <Ionicons 
                    name={getNotificationIcon(selectedNotification.type).name} 
                    size={28} 
                    color={getNotificationIcon(selectedNotification.type).color} 
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white text-lg font-bold mb-1`}>
                    {selectedNotification.title}
                  </Text>
                  <Text style={tw`text-gray-400 text-sm`}>
                    {new Date(selectedNotification.timestamp).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              
              {/* Modal Content */}
              <View style={tw`bg-gray-900 rounded-xl p-4 mb-4`}>
                <Text style={tw`text-gray-300 text-base leading-6`}>
                  {selectedNotification.message}
                </Text>
              </View>
              
              {/* Notification Type Badge */}
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-gray-700 rounded-full px-3 py-1`}>
                  <Text style={tw`text-gray-300 text-sm capitalize`}>
                    {selectedNotification.type} Notification
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  if (!isCarPaired) {
    return (
      <View style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
          style={{ paddingTop: insets.top }}
        >
          <View style={tw`px-4 py-4`}>
            <Text style={tw`text-white text-xl font-bold`}>Notifications</Text>
          </View>
        </LinearGradient>
        
        <View style={tw`flex-1 items-center justify-center`}>
          <Ionicons name="notifications-off-outline" size={60} color="#4B5563" />
          <Text style={tw`text-gray-400 text-lg mt-4`}>No notifications yet</Text>
          <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>
            Complete vehicle pairing to receive notifications
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
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
                onPress={markAllAsRead}
                style={tw`bg-blue-600 rounded-lg px-3 py-2`}
              >
                <Text style={tw`text-white text-sm`}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Notifications List */}
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadNotifications}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {isLoading && notifications.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center py-20`}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={tw`text-gray-400 mt-2`}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center py-20`}>
            <Ionicons name="notifications-off-outline" size={60} color="#4B5563" />
            <Text style={tw`text-gray-400 text-lg mt-4`}>No notifications yet</Text>
            <Text style={tw`text-gray-500 text-sm mt-2`}>
              You'll see updates about your vehicle here
            </Text>
          </View>
        ) : (
          <View style={tw`px-4 py-2`}>
            {notifications.map((notification) => {
              const icon = getNotificationIcon(notification.type);
              const isUnread = !notification.isRead;
              
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={tw`mb-3`}
                  onPress={() => handleNotificationPress(notification)}
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
                        
                        <Text style={tw`text-gray-400 text-sm mb-2 ${!isUnread ? 'text-gray-500' : ''}`} numberOfLines={2}>
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
            })}
          </View>
        )}
      </ScrollView>
      
      <NotificationModal />
    </View>
  );
}