import React from 'react';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { getLanguageDisplay, getVoiceDisplay } from './utils/settingsHelpers';
import { showLanguageAlert, showAIVoiceAlert } from './utils/alerts';

const AIAssistantSettings = ({ settings, updateSetting }) => {
  return (
    <SettingsSection title="AI Assistant">
      <SettingItem
        icon="robot"
        label="AI Language"
        value={getLanguageDisplay(settings.aiChat.language)}
        onPress={() => showLanguageAlert((lang) => updateSetting('aiChat.language', lang))}
      />
      
      <SettingItem
        icon="microphone"
        label="Voice Type"
        value={getVoiceDisplay(settings.aiChat.voice)}
        onPress={() => showAIVoiceAlert((voice) => updateSetting('aiChat.voice', voice))}
      />
    </SettingsSection>
  );
};

export default AIAssistantSettings;