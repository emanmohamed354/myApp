// hooks/useChatHistory.js
import { useState, useEffect } from 'react';
import { chatApi } from '../services/chatApi';

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Just now';
    
    // Parse the ISO date string
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Just now';
    }
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    console.log('Date formatting:', {
      dateString,
      date: date.toISOString(),
      now: now.toISOString(),
      diffInMs,
      diffInMins,
      diffInHours,
      diffInDays
    });

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    // Format as date for older chats
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: diffInDays > 365 ? 'numeric' : undefined
    });
  };

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getAllChats();
      
      console.log('Raw chats from API:', response);
      
      // Ensure we have an array
      const chatsArray = Array.isArray(response) ? response : [];
      
      // Transform the data to ensure proper formatting
      const formattedChats = chatsArray.map(chat => {
        // Use lastMessageDate if available, otherwise use startedAt
        const dateToUse = chat.lastMessageDate || chat.startedAt;
        
        console.log('Processing chat:', {
          id: chat.id,
          title: chat.title,
          lastMessageDate: chat.lastMessageDate,
          startedAt: chat.startedAt,
          dateToUse
        });
        
        return {
          id: chat.id,
          title: chat.title || 'New Chat',
          lastMessage: chat.lastMessage || 'No messages yet',
          timestamp: formatTimestamp(dateToUse),
          rawDate: dateToUse // Keep raw date for sorting
        };
      });
      
      // Sort by most recent first
      formattedChats.sort((a, b) => {
        const dateA = new Date(a.rawDate);
        const dateB = new Date(b.rawDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      setChatHistory(formattedChats);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renameChat = async (chatId, newTitle) => {
    try {
      const updatedChat = await chatApi.renameChat(chatId, newTitle);
      
      // Update local state
      setChatHistory(prevHistory => 
        prevHistory.map(chat => 
          chat.id === chatId 
            ? { ...chat, title: newTitle } 
            : chat
        )
      );
      
      return updatedChat;
    } catch (error) {
      console.error('Failed to rename chat:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Refresh timestamps periodically (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setChatHistory(prevHistory => 
        prevHistory.map(chat => ({
          ...chat,
          timestamp: formatTimestamp(chat.rawDate)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return {
    chatHistory,
    isLoading,
    loadChatHistory,
    renameChat
  };
};