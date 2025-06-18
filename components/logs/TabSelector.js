import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const { width } = Dimensions.get('window');

const TabSelector = ({ activeTab, setActiveTab, fadeAnim, slideAnim }) => {
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const position = activeTab === 'diagnostic' ? 0 : activeTab === 'events' ? width / 3 : (width / 3) * 2;
    Animated.spring(tabIndicatorAnim, {
      toValue: position,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const tabs = [
    { id: 'diagnostic', label: 'Diagnostic', icon: 'car-cog' },
    { id: 'events', label: 'Events', icon: 'calendar-clock' },
    { id: 'sync', label: 'Sync Data', icon: 'cloud-sync' },
  ];

  return (
    <Animated.View 
      style={[
        tw`px-4 mb-4`,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={tw`bg-gray-800 rounded-xl p-1 flex-row mt-2`}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={tw`flex-1 py-3 items-center`}
            onPress={() => setActiveTab(tab.id)}
          >
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.id ? '#fff' : '#9CA3AF'} 
                style={tw`mr-1`}
              />
              <Text style={tw`${activeTab === tab.id ? 'text-white font-semibold' : 'text-gray-400'} text-xs`}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Animated indicator */}
        <Animated.View
          style={[
            tw`absolute bottom-1 h-0.5 bg-blue-500 rounded-full`,
            {
              width: '33.33%',
              transform: [{ translateX: tabIndicatorAnim }],
            }
          ]}
        />
      </View>
    </Animated.View>
  );
};

export default TabSelector;