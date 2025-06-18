import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { showExportDataAlert, showClearCacheAlert, showComingSoonAlert } from './utils/alerts';

const DataManagementSettings = () => {
  const handleExportData = () => {
    showExportDataAlert(() => {
      // Implement data export
      Alert.alert('Success', 'Data exported successfully');
    });
  };

  const handleClearCache = async () => {
    showClearCacheAlert(async () => {
      try {
        const keysToKeep = ['authToken', 'localAuthToken', 'isCarPaired', 'userSettings'];
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
        await AsyncStorage.multiRemove(keysToRemove);
        Alert.alert('Success', 'Cache cleared successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to clear cache');
      }
    });
  };

  return (
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
        onPress={() => showComingSoonAlert('Diagnostics history')}
      />
    </SettingsSection>
  );
};

export default DataManagementSettings;