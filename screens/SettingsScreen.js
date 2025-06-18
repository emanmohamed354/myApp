import React from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useSettings } from '../hooks/useSettings';

import {
  SettingsHeader,
  VehicleSettings,
  DashboardSettings,
  DataLoggingSettings,
  AIAssistantSettings,
  AppearanceSettings,
  DataManagementSettings,
  AboutSettings,
  SettingsActions,
  LoadingState
} from '../components/settings';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    isCarPaired,
    settings,
    updateSetting,
    syncing,
    loading,
    logout,
    clearLocalToken
  } = useSettings(navigation);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <SettingsHeader insets={insets} syncing={syncing} />

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        <VehicleSettings settings={settings} updateSetting={updateSetting} />
        <DashboardSettings settings={settings} updateSetting={updateSetting} />
        <DataLoggingSettings settings={settings} updateSetting={updateSetting} />
        <AIAssistantSettings settings={settings} updateSetting={updateSetting} />
        <AppearanceSettings settings={settings} updateSetting={updateSetting} />
        <DataManagementSettings />
        <AboutSettings />
        <SettingsActions 
          isCarPaired={isCarPaired}
          onUnpair={clearLocalToken}
          onLogout={logout}
        />
      </ScrollView>
    </View>
  );
}