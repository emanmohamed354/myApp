import React from 'react';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { getThemeDisplay } from './utils/settingsHelpers';

const AppearanceSettings = ({ settings, updateSetting }) => {
  return (
    <SettingsSection title="Appearance">
      <SettingItem
        icon="theme-light-dark"
        label="Theme"
        value={getThemeDisplay(settings.theme)}
        onPress={() => {
          const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
          updateSetting('theme', newTheme);
        }}
      />
    </SettingsSection>
  );
};

export default AppearanceSettings;