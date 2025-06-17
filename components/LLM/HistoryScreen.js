// components/LLM/HistoryScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  ActivityIndicator, 
  TextInput, 
  Modal 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function HistoryScreen({ 
  insets, 
  chatHistory, 
  loadChat, 
  startNewChat,
  isLoading,
  renameChat 
}) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);

  const handleRename = async () => {
    if (editingChatId && newTitle.trim()) {
      try {
        await renameChat(editingChatId, newTitle.trim());
        setShowRenameModal(false);
        setEditingChatId(null);
        setNewTitle('');
      } catch (error) {
        // Handle error (show toast, alert, etc.)
        console.error('Failed to rename chat:', error);
      }
    }
  };

  const openRenameModal = (chat) => {
    setEditingChatId(chat.id);
    setNewTitle(chat.title);
    setShowRenameModal(true);
  };

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
        style={{ paddingTop: insets.top }}
      >
        <View style={tw`px-4 py-4 flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <MaterialCommunityIcons name="robot-outline" size={28} color="#60A5FA" />
            <Text style={tw`text-white text-xl font-bold ml-2`}>AI Assistant</Text>
          </View>
          <TouchableOpacity
            onPress={startNewChat}
            style={tw`bg-blue-600 rounded-lg px-3 py-2 flex-row items-center`}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={tw`text-white ml-1`}>New Chat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={tw`flex-1 px-4 py-4`}>
        <Text style={tw`text-gray-400 text-sm uppercase tracking-wider mb-3`}>
          Recent Conversations
        </Text>
        
        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center py-8`}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={tw`text-gray-400 mt-2`}>Loading chats...</Text>
          </View>
        ) : chatHistory.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center py-8`}>
            <MaterialCommunityIcons name="chat-outline" size={48} color="#4B5563" />
            <Text style={tw`text-gray-400 mt-4`}>No conversations yet</Text>
            <Text style={tw`text-gray-500 text-sm mt-2`}>Start a new chat to get assistance</Text>
          </View>
        ) : (
          chatHistory.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              onPress={() => loadChat(chat)}
              style={tw`mb-3`}
            >
              <View style={tw`bg-gray-800 rounded-xl p-4`}>
                <View style={tw`flex-row items-start`}>
                  <View style={tw`bg-blue-600 rounded-full p-2 mr-3`}>
                    <FontAwesome5 name="comment-alt" size={16} color="white" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-semibold mb-1`}>{chat.title}</Text>
                    <Text style={tw`text-gray-400 text-sm mb-1`} numberOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                    <Text style={tw`text-gray-500 text-xs`}>{chat.timestamp}</Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent triggering loadChat
                        openRenameModal(chat);
                      }}
                      style={tw`p-2 mr-1`}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#4B5563" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <TouchableOpacity 
          style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center px-4`}
          activeOpacity={1}
          onPress={() => setShowRenameModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={tw`bg-gray-800 rounded-xl p-4 w-full max-w-sm`}>
              <View style={tw`flex-row items-center mb-4`}>
                <MaterialCommunityIcons name="pencil" size={20} color="#60A5FA" />
                <Text style={tw`text-white text-lg font-bold ml-2`}>Rename Chat</Text>
              </View>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                style={tw`bg-gray-700 text-white px-4 py-3 rounded-lg mb-4`}
                placeholder="Enter chat title"
                placeholderTextColor="#6B7280"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleRename}
              />
              <View style={tw`flex-row justify-end`}>
                <TouchableOpacity
                  onPress={() => {
                    setShowRenameModal(false);
                    setEditingChatId(null);
                    setNewTitle('');
                  }}
                  style={tw`px-4 py-2 mr-2`}
                >
                  <Text style={tw`text-gray-400`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRename}
                  style={tw`bg-blue-600 px-4 py-2 rounded-lg`}
                  disabled={!newTitle.trim()}
                >
                  <Text style={tw`text-white ${!newTitle.trim() ? 'opacity-50' : ''}`}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}