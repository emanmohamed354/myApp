// screens/SettingsScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings } from '../contexts/UserSettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isCarPaired, userInfo, remoteToken, logout, clearLocalToken } = useAuth();
  const { settings, updateSetting, syncing, loading } = useUserSettings();
  
  useEffect(() => {
    console.log('SettingsScreen - UserInfo:', userInfo);
    console.log('SettingsScreen - RemoteToken exists:', !!remoteToken);
  }, [userInfo, remoteToken]);

  // Navigate away from Settings when car is unpaired
  useEffect(() => {
    if (!isCarPaired) {
      navigation.navigate('Home');
    }
  }, [isCarPaired, navigation]);

  const handlePairVehicle = () => {
    navigation.navigate('CarPairing');
  };

  const handleUnpairVehicle = () => {
    Alert.alert(
      'Unpair Vehicle',
      'Are you sure you want to unpair your vehicle? You will need to pair again to access vehicle features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unpair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearLocalToken();
              Alert.alert('Success', 'Vehicle unpaired successfully');
              // Navigation will happen automatically due to useEffect
            } catch (error) {
              console.error('Unpair error:', error);
              Alert.alert('Error', 'Failed to unpair vehicle. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export all your vehicle data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            // Implement data export
            Alert.alert('Success', 'Data exported successfully');
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear specific keys instead of all AsyncStorage
              const keysToKeep = ['authToken', 'localAuthToken', 'isCarPaired', 'userSettings'];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
              await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by App.js automatically
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-900 justify-center items-center`}>
        <ActivityIndicator size="large" color="#60A5FA" />
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
        <View style={tw`px-4 py-4 flex-row justify-between items-center`}>
          <Text style={tw`text-white text-xl font-bold`}>Settings</Text>
          {syncing && (
            <View style={tw`flex-row items-center`}>
              <ActivityIndicator size="small" color="#60A5FA" />
              <Text style={tw`text-blue-400 ml-2 text-sm`}>Syncing...</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Vehicle Settings */}
        <SettingsSection title="Vehicle">
          <SettingItem
            icon="speedometer"
            label="Units"
            value={settings.units === 'imperial' ? 'Imperial' : 'Metric'}
            onPress={() => {
              const newUnit = settings.units === 'imperial' ? 'metric' : 'imperial';
              updateSetting('units', newUnit);
            }}
          />
          
          <SettingItem
            icon="translate"
            label="Language"
            value={settings.language === 'en' ? 'English' : settings.language}
            onPress={() => {
              Alert.alert(
                'Language',
                'Select app language',
                [
                  { text: 'English', onPress: () => updateSetting('language', 'en') },
                  { text: 'Spanish', onPress: () => updateSetting('language', 'es') },
                  { text: 'French', onPress: () => updateSetting('language', 'fr') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          />
        </SettingsSection>

        {/* Dashboard Settings */}
        <SettingsSection title="Dashboard">
          <SettingItem
            icon="refresh"
            label="Refresh Rate"
            value={`${settings.dashboard.refreshRate}ms`}
            onPress={() => {
              Alert.alert(
                'Refresh Rate',
                'Select dashboard refresh rate',
                [
                  { text: '250ms (Fast)', onPress: () => updateSetting('dashboard.refreshRate', 250) },
                  { text: '500ms (Normal)', onPress: () => updateSetting('dashboard.refreshRate', 500) },
                  { text: '1000ms (Slow)', onPress: () => updateSetting('dashboard.refreshRate', 1000) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          />
          
          <SettingItem
            icon="gauge"
            label="Gauge Size"
            value={`${settings.dashboard.gaugeSize}px`}
            onPress={() => {
              Alert.alert(
                'Gauge Size',
                'Select gauge size',
                [
                  { text: 'Small (160px)', onPress: () => updateSetting('dashboard.gaugeSize', 160) },
                  { text: 'Medium (180px)', onPress: () => updateSetting('dashboard.gaugeSize', 180) },
                  { text: 'Large (200px)', onPress: () => updateSetting('dashboard.gaugeSize', 200) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          />
          
          <SettingItem
            icon="alert-decagram"
            label="Show Warnings"
            value={settings.dashboard.showWarnings}
            onValueChange={(value) => updateSetting('dashboard.showWarnings', value)}
            isSwitch
          />
          
          <SettingItem
            icon="chart-line"
            label="Auto Scale"
            value={settings.dashboard.autoScale}
            onValueChange={(value) => updateSetting('dashboard.autoScale', value)}
            isSwitch
          />
        </SettingsSection>

        {/* Data Logging Settings */}
        <SettingsSection title="Data Logging">
          <SettingItem
            icon="database"
            label="Enable Logging"
            value={settings.dataLogging.enabled}
            onValueChange={(value) => updateSetting('dataLogging.enabled', value)}
            isSwitch
          />
          
          {settings.dataLogging.enabled && (
            <>
              <SettingItem
                icon="timer"
                label="Logging Interval"
                value={`${settings.dataLogging.interval}ms`}
                onPress={() => {
                  Alert.alert(
                    'Logging Interval',
                    'Select data logging interval',
                    [
                      { text: '500ms', onPress: () => updateSetting('dataLogging.interval', 500) },
                      { text: '1000ms', onPress: () => updateSetting('dataLogging.interval', 1000) },
                      { text: '2000ms', onPress: () => updateSetting('dataLogging.interval', 2000) },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              />
              
              <SettingItem
                icon="database-export"
                label="Max File Size"
                value={`${settings.dataLogging.maxFileSize}MB`}
                onPress={() => {
                  Alert.alert(
                    'Max File Size',
                    'Select maximum log file size',
                    [
                      { text: '50MB', onPress: () => updateSetting('dataLogging.maxFileSize', 50) },
                      { text: '100MB', onPress: () => updateSetting('dataLogging.maxFileSize', 100) },
                      { text: '200MB', onPress: () => updateSetting('dataLogging.maxFileSize', 200) },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              />
            </>
          )}
        </SettingsSection>

        {/* AI Assistant Settings */}
        <SettingsSection title="AI Assistant">
          <SettingItem
            icon="robot"
            label="AI Language"
            value={settings.aiChat.language === 'en' ? 'English' : settings.aiChat.language}
            onPress={() => {
              Alert.alert(
                'AI Language',
                'Select AI assistant language',
                [
                  { text: 'English', onPress: () => updateSetting('aiChat.language', 'en') },
                  { text: 'Spanish', onPress: () => updateSetting('aiChat.language', 'es') },
                  { text: 'French', onPress: () => updateSetting('aiChat.language', 'fr') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          />
          
          <SettingItem
            icon="microphone"
            label="Voice Type"
            value={settings.aiChat.voice.split('-').slice(-1)[0]}
            onPress={() => {
              Alert.alert(
                'AI Voice',
                'Select AI assistant voice',
                [
                  { text: 'Standard A', onPress: () => updateSetting('aiChat.voice', 'en-US-Standard-A') },
                  { text: 'Standard B', onPress: () => updateSetting('aiChat.voice', 'en-US-Standard-B') },
                  { text: 'Standard C', onPress: () => updateSetting('aiChat.voice', 'en-US-Standard-C') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          />
        </SettingsSection>

        {/* Theme Settings */}
        <SettingsSection title="Appearance">
          <SettingItem
            icon="theme-light-dark"
            label="Theme"
            value={settings.theme === 'dark' ? 'Dark' : 'Light'}
            onPress={() => {
              const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
              updateSetting('theme', newTheme);
            }}
          />
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data Management">
          <SettingItem
            icon="download"
            label="Export Data"
            onPress={handleExportData}
          />
          
          <SettingItem
            icon="cached"
            label="Clear Cache"
            onPress={handleClearCache}
          />
          
          <SettingItem
            icon="history"
            label="Diagnostics History"
            onPress={() => {
              Alert.alert('Coming Soon', 'Diagnostics history will be available in the next update');
            }}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingItem
            icon="information-outline"
            label="App Version"
            value="1.0.0"
          />
          
          <SettingItem
            icon="file-document-outline"
            label="Terms of Service"
            onPress={() => {
              Alert.alert('Terms of Service', 'Terms of Service will open in the next update');
            }}
          />
          
          <SettingItem
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => {
              Alert.alert('Privacy Policy', 'Privacy Policy will open in the next update');
            }}
          />
          
          <SettingItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => {
              Alert.alert('Help & Support', 'Support features coming soon');
            }}
          />
        </SettingsSection>

        <View style={tw`px-4 pb-8 mt-4`}>
          {/* Unpair Vehicle Button - Above Logout */}
          {isCarPaired && (
            <TouchableOpacity
              style={tw`bg-orange-900/20 rounded-xl p-4 items-center mb-3`}
              onPress={handleUnpairVehicle}
            >
              <View style={tw`flex-row items-center`}>
                <MaterialCommunityIcons name="car-off" size={20} color="#FB923C" />
                <Text style={tw`text-orange-400 ml-2 font-medium`}>Unpair Vehicle</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            style={tw`bg-red-900/20 rounded-xl p-4 items-center`}
            onPress={handleLogout}
          >
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
              <Text style={tw`text-red-400 ml-2 font-medium`}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Settings Section Component
const SettingsSection = ({ title, children }) => (
  <View style={tw`mb-6`}>
    <Text style={tw`text-gray-400 text-sm uppercase tracking-wider px-4 mb-3`}>
      {title}
    </Text>
    <View style={tw`bg-gray-800 mx-4 rounded-xl overflow-hidden`}>
      {children}
    </View>
  </View>
);

// Settings Item Component
const SettingItem = ({ icon, label, value, onPress, onValueChange, isSwitch, disabled }) => {
  const content = (
    <View style={tw`flex-row items-center justify-between p-4 ${disabled ? 'opacity-50' : ''}`}>
      <View style={tw`flex-row items-center flex-1`}>
        <MaterialCommunityIcons name={icon} size={20} color="#60A5FA" style={tw`mr-3`} />
        <Text style={tw`text-white ${disabled ? 'text-gray-500' : ''}`}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#374151', true: '#3B82F6' }}
          thumbColor={value ? '#fff' : '#9CA3AF'}
          disabled={disabled}
        />
      ) : value !== undefined ? (
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-gray-400 mr-2`}>{value}</Text>
          {onPress && <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />}
        </View>
      ) : onPress ? (
        <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
      ) : null}
    </View>
  );

  if (!isSwitch && onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} style={tw`border-b border-gray-700 last:border-b-0`}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={tw`border-b border-gray-700 last:border-b-0`}>{content}</View>;
};