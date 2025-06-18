import React from 'react';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { getUnitsDisplay, getLanguageDisplay } from './utils/settingsHelpers';
import { showLanguageAlert } from './utils/alerts';

const VehicleSettings = ({ settings, updateSetting }) => {
  return (
    <SettingsSection title="Vehicle">
      <SettingItem
        icon="speedometer"
        label="Units"
        value={getUnitsDisplay(settings.units)}
        onPress={() => {
          const newUnit = settings.units === 'imperial' ? 'metric' : 'imperial';
          updateSetting('units', newUnit);
        }}
      />
      
      <SettingItem
        icon="translate"
        label="Language"
        value={getLanguageDisplay(settings.language)}
        onPress={() => showLanguageAlert((lang) => updateSetting('language', lang))}
      />
    </SettingsSection>
  );
};

export default VehicleSettings;