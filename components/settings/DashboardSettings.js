import React from 'react';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { formatRefreshRate, formatGaugeSize } from './utils/settingsHelpers';
import { showRefreshRateAlert, showGaugeSizeAlert } from './utils/alerts';

const DashboardSettings = ({ settings, updateSetting }) => {
  return (
    <SettingsSection title="Dashboard">
      <SettingItem
        icon="refresh"
        label="Refresh Rate"
        value={formatRefreshRate(settings.dashboard.refreshRate)}
        onPress={() => showRefreshRateAlert((rate) => updateSetting('dashboard.refreshRate', rate))}
      />
      
      <SettingItem
        icon="gauge"
        label="Gauge Size"
        value={formatGaugeSize(settings.dashboard.gaugeSize)}
        onPress={() => showGaugeSizeAlert((size) => updateSetting('dashboard.gaugeSize', size))}
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
  );
};

export default DashboardSettings;