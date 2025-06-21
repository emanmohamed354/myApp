// services/chatApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import api from './api';

export const chatApi = {
  getAllChats: async () => {
    return await api.get('/api/llm/chats');
  },

  getChatById: async (chatId) => {
    return await api.get(`/api/llm/chats/${chatId}`);
  },

  createChat: async (title) => {
    return await api.post('/api/llm/chats', { title });
  },

  // Rename chat
  renameChat: async (chatId, newTitle) => {
    return await api.patch(`/api/llm/chats/${chatId}/title`, { title: newTitle });
  },

  // Get messages for a chat
  getChatMessages: async (chatId) => {
    const response = await api.get(`/api/llm/chats/${chatId}/messages`);
    
    // Transform the messages to match the UI format
    const messages = response.map(msg => ({
      id: msg.id,
      text: msg.content,
      isUser: msg.role === 'user',
      timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      fullTimestamp: msg.timestamp,
      image: msg.metadata?.image || null,
      audio: msg.metadata?.audio || null,
      audioDuration: msg.metadata?.audioDuration || 0,
    }));
    
    return messages;
  },

  sendMessage: async (chatId, content, voiceFile = null, userSettings = {}) => {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('content', content || '');
      formData.append('containsSpeech', voiceFile ? 'true' : 'false');
      
      // Fix settings values
      const language = userSettings.aiChat?.language || 'en';
      const voice = userSettings.aiChat?.voice || 'en-US-Standard-A';
      const autoPlay = userSettings.aiChat?.autoPlay || 'never';
      
      formData.append('language', language.toLowerCase() === 'english' ? 'en' : language);
      formData.append('voice', voice === 'Standrad A' ? 'en-US-Standard-A' : voice);
      formData.append('autoPlay', autoPlay);
      
      // Add voice file if present
      if (voiceFile) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(voiceFile);
          
          if (!fileInfo.exists) {
            throw new Error('Voice file not found');
          }
          
          console.log('Voice file info:', {
            uri: fileInfo.uri,
            size: fileInfo.size,
            exists: fileInfo.exists,
          });
          
          const file = {
            uri: Platform.OS === 'android' ? voiceFile : voiceFile.replace('file://', ''),
            type: 'audio/m4a',
            name: `voice-recording-${Date.now()}.m4a`,
          };
          
          formData.append('voiceFile', file);
        } catch (error) {
          throw error;
        }
      }

      console.log('Sending message with data:', {
        chatId,
        content,
        containsSpeech: !!voiceFile,
        language: language.toLowerCase() === 'english' ? 'en' : language,
        voice: voice === 'Standrad A' ? 'en-US-Standard-A' : voice,
        autoPlay,
        hasVoiceFile: !!voiceFile,
        voiceFileUri: voiceFile,
      });

      // Use the api service with special handling for FormData
      const response = await api.post(
        `/api/llm/chats/${chatId}/ask`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: (data) => data,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 60000,
        }
      );
      
      return {
        response: response.response,
        assistantMessage: response.assistant_message,
        userMessage: response.user_message,
        sensorDataUsed: response.sensor_data_used
      };
    } catch (error) {
      throw error;
    }
  },
};