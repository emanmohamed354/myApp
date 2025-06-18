import React from 'react';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { formatInterval, formatFileSize } from './utils/settingsHelpers';
import { showLoggingIntervalAlert, showMaxFileSizeAlert } from './utils/alerts';

const DataLoggingSettings = ({ settings, updateSetting }) => {
  return (
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
            value={formatInterval(settings.dataLogging.interval)}
            onPress={() => showLoggingIntervalAlert((interval) => updateSetting('dataLogging.interval', interval))}
          />
          
          <SettingItem
            icon="database-export"
            label="Max File Size"
            value={formatFileSize(settings.dataLogging.maxFileSize)}
            onPress={() => showMaxFileSizeAlert((size) => updateSetting('dataLogging.maxFileSize', size))}
          />
        </>
      )}
    </SettingsSection>
  );
};

export default DataLoggingSettings;