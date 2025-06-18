import React from 'react';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { showComingSoonAlert } from './utils/alerts';

const AboutSettings = () => {
  return (
    <SettingsSection title="About">
      <SettingItem
        icon="information-outline"
        label="App Version"
        value="1.0.0"
      />
      
      <SettingItem
        icon="file-document-outline"
        label="Terms of Service"
        onPress={() => showComingSoonAlert('Terms of Service')}
      />
      
      <SettingItem
        icon="shield-outline"
        label="Privacy Policy"
        onPress={() => showComingSoonAlert('Privacy Policy')}
      />
      
      <SettingItem
        icon="help-circle-outline"
        label="Help & Support"
        onPress={() => showComingSoonAlert('Support features')}
      />
    </SettingsSection>
  );
};

export default AboutSettings;