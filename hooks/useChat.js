// hooks/useChat.js - Complete updated version
import { useState, useRef, useEffect } from 'react';
import { chatApi } from '../services/chatApi';
import { useUserSettings } from '../contexts/UserSettingsContext';

export const useChat = (initialChatId = null) => {
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const { userSettings } = useUserSettings();

  // Load messages when chat ID changes
  useEffect(() => {
    if (currentChatId) {
      loadMessages();
    }
  }, [currentChatId]);

  const loadMessages = async () => {
    if (!currentChatId) return;
    
    try {
      setIsLoading(true);
      const messagesData = await chatApi.getChatMessages(currentChatId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const timestamp = new Date().toLocaleString();
      const title = `Chat - ${timestamp}`;
      const newChat = await chatApi.createChat(title);
      setCurrentChatId(newChat.id);
      setMessages([]);
      return newChat;
    } catch (error) {
      console.error('Error creating new chat:', error);
      throw error;
    }
  };

const handleSubmit = async (capturedImage, audioUri, recordingDuration, resetMedia) => {
    if (!query.trim() && !capturedImage && !audioUri) return;

    try {
      // Create new chat if none exists
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = await createNewChat();
        chatId = newChat.id;
      }

      // Create temporary user message object for immediate UI update
      const now = new Date();
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        text: query || (audioUri ? "🎤 Voice message" : ""),
        isUser: true,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: now.toISOString(),
        image: capturedImage,
        audio: audioUri,
        audioDuration: recordingDuration,
      };

      // Add user message to UI immediately
      setMessages(prev => [...prev, tempUserMessage]);
      setQuery('');
      resetMedia();
      setIsTyping(true);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Send message to API with user settings
      const response = await chatApi.sendMessage(
        chatId, 
        query || "Voice message", 
        audioUri,
        userSettings // Pass user settings
      );
      
      // Update the temporary user message with the actual ID from server
      setMessages(prev => {
        const updated = [...prev];
        const tempIndex = updated.findIndex(msg => msg.id === tempUserMessage.id);
        if (tempIndex !== -1 && response.userMessage) {
          updated[tempIndex] = {
            ...tempUserMessage,
            id: response.userMessage.id,
            text: response.userMessage.content,
            timestamp: new Date(response.userMessage.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            fullTimestamp: response.userMessage.timestamp,
          };
        }
        return updated;
      });

      // Add AI response
      if (response.assistantMessage) {
        const aiMessage = {
          id: response.assistantMessage.id,
          text: response.assistantMessage.content,
          isUser: false,
          timestamp: new Date(response.assistantMessage.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          fullTimestamp: response.assistantMessage.timestamp,
        };

        setMessages(prev => [...prev, aiMessage]);
      }

      setIsTyping(false);

      // Scroll to bottom after AI response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      
      // Show error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: error.response?.data?.message || "Sorry, I couldn't send your message. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTimestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setQuery('');
  };

  const loadChat = async (chatId) => {
    setCurrentChatId(chatId);
  };

  return {
    scrollViewRef,
    query,
    setQuery,
    messages,
    isTyping,
    isLoading,
    currentChatId,
    handleSubmit,
    startNewChat,
    loadChat,
    createNewChat,
  };
};