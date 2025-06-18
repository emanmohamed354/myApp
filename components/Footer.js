// components/Footer.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNotificationState } from '../contexts/NotificationStateContext';
import { useAuth } from '../contexts/AuthContext';

const Footer = ({ state, descriptors, navigation }) => {
  const { unreadCount } = useNotificationState();
  const { isCarPaired } = useAuth();
  
  // Get the current route name
  const currentRoute = state.routes[state.index].name;

  const menuItems = [
    { name: 'Home', icon: 'home', iconSet: 'Ionicons', screen: 'Home', showWhenNotPaired: true, showWhenPaired: true },
    { name: 'Sync', icon: 'sync', iconSet: 'Ionicons', screen: 'PairingSync', showWhenNotPaired: true, showWhenPaired: false },
    { name: 'Logs', icon: 'text-box-multiple', iconSet: 'MaterialCommunityIcons', screen: 'Logs', showWhenNotPaired: false, showWhenPaired: true },
    { name: 'Info', icon: 'info-circle', iconSet: 'FontAwesome5', screen: 'Info', showWhenNotPaired: false, showWhenPaired: true },
    { name: 'AI', icon: 'psychology', iconSet: 'MaterialIcons', screen: 'LLM', showWhenNotPaired: false, showWhenPaired: true },
    { name: 'Service', icon: 'car-repair', iconSet: 'MaterialIcons', screen: 'Appointment', showWhenNotPaired: true, showWhenPaired: false },
    { name: 'Alerts', icon: 'notifications', iconSet: 'Ionicons', screen: 'Notifications', showWhenNotPaired: false, showWhenPaired: true },
    { name: 'Setting', icon: 'settings', iconSet: 'Ionicons', screen: 'Settings', showWhenNotPaired: false, showWhenPaired: true },
    { name: 'Profile', icon: 'person', iconSet: 'Ionicons', screen: 'Profile', showWhenNotPaired: true, showWhenPaired: false },
  ];

  // Filter menu items based on pairing status
  const visibleMenuItems = menuItems.filter(item => {
    if (!isCarPaired) {
      return item.showWhenNotPaired;
    } else {
      return item.showWhenPaired;
    }
  });

  const renderIcon = (item) => {
    const isActive = currentRoute === item.screen;
    const color = isActive ? '#3B82F6' : '#6B7280';
    const size = 24;

    const IconComponent = () => {
      switch (item.iconSet) {
        case 'Ionicons':
          return <Ionicons name={item.icon} size={size} color={color} />;
        case 'FontAwesome5':
          return <FontAwesome5 name={item.icon} size={size} color={color} />;
        case 'MaterialIcons':
          return <MaterialIcons name={item.icon} size={size} color={color} />;
        case 'MaterialCommunityIcons':
          return <MaterialCommunityIcons name={item.icon} size={size} color={color} />;
        default:
          return null;
      }
    };

    return (
      <View style={tw`relative`}>
        <IconComponent />
        {item.screen === 'Notifications' && unreadCount > 0 && (
          <View style={tw`absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center px-1`}>
            <Text style={tw`text-white text-[10px] font-bold`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={tw`bg-gray-800 border-t border-gray-700`}>
      <View style={tw`flex-row justify-around items-center py-2 pb-4`}>
        {visibleMenuItems.map((item) => {
          const isActive = currentRoute === item.screen;
          return (
            <TouchableOpacity
              key={item.screen}
              style={tw`flex-1 items-center py-2`}
              onPress={() => navigation.navigate(item.screen)}
            >
              {renderIcon(item)}
              <Text 
                style={[
                  tw`text-xs mt-1`,
                  isActive ? tw`text-blue-500 font-semibold` : tw`text-gray-400`
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default Footer;