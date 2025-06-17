import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function ChatHistoryView({ conversations, onSelectChat, onNewChat, onQuickAction }) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Header */}
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)', 'rgba(0, 0, 0, 0.9)']}
        style={{ paddingTop: insets.top }}
      >
        <View style={tw`px-4 py-4`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons name="robot-outline" size={28} color="#60A5FA" />
              <Text style={tw`text-white text-xl font-bold ml-2`}>AI Assistant</Text>
            </View>
            <TouchableOpacity
              onPress={onNewChat}
              style={tw`bg-blue-600 rounded-lg px-3 py-2 flex-row items-center`}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={tw`text-white ml-1 text-sm`}>New Chat</Text>
            </TouchableOpacity>
          </View>
          <Text style={tw`text-gray-400 text-sm`}>Your intelligent vehicle companion</Text>
        </View>
      </LinearGradient>

      {/* Recent Conversations */}
      <ScrollView style={tw`flex-1 px-4 py-4`}>
        <Text style={tw`text-gray-400 text-sm uppercase tracking-wider mb-3`}>Recent Conversations</Text>
        
        {conversations.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            onPress={() => onSelectChat(chat)}
            style={tw`mb-3`}
          >
            <LinearGradient
              colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
              style={tw`rounded-xl p-4`}
            >
              <View style={tw`flex-row items-start`}>
                <View style={tw`bg-blue-600 rounded-lg p-2 mr-3`}>
                  <FontAwesome5 name="comment-alt" size={16} color="white" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white font-semibold mb-1`}>{chat.title}</Text>
                  <Text style={tw`text-gray-400 text-sm mb-1`} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  <Text style={tw`text-gray-500 text-xs`}>{chat.timestamp}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#4B5563" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <View style={tw`mt-6`}>
          <Text style={tw`text-gray-400 text-sm uppercase tracking-wider mb-3`}>Quick Actions</Text>
          <View style={tw`flex-row flex-wrap -mx-1`}>
            {[
              { icon: 'engine', label: 'Engine Check', color: '#EF4444' },
              { icon: 'oil-temperature', label: 'Oil Status', color: '#F59E0B' },
              { icon: 'car-brake-alert', label: 'Brake System', color: '#10B981' },
              { icon: 'battery-charging', label: 'Battery Health', color: '#3B82F6' },
            ].map((action, index) => (
              <View key={index} style={tw`w-1/2 p-1`}>
                <TouchableOpacity
                  onPress={() => onQuickAction(action)}
                  style={tw`bg-gray-800 rounded-lg p-3 flex-row items-center`}
                >
                  <MaterialCommunityIcons 
                    name={action.icon} 
                    size={20} 
                    color={action.color}
                    style={tw`mr-2`}
                  />
                  <Text style={tw`text-gray-300 text-sm`}>{action.label}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}