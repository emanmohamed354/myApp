// contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('#3B82F6');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedAccent = await AsyncStorage.getItem('accentColor');
      
      if (savedTheme) setTheme(savedTheme);
      if (savedAccent) setAccentColor(savedAccent);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const changeAccentColor = async (newColor) => {
    try {
      await AsyncStorage.setItem('accentColor', newColor);
      setAccentColor(newColor);
    } catch (error) {
      console.error('Error saving accent color:', error);
    }
  };

  const value = {
    theme,
    accentColor,
    changeTheme,
    changeAccentColor,
    isDark: theme === 'dark',
    colors: theme === 'dark' ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

const darkColors = {
  background: '#111827',
  surface: '#1F2937',
  primary: '#3B82F6',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#374151',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

const lightColors = {
  background: '#FFFFFF',
  surface: '#F3F4F6',
  primary: '#3B82F6',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};