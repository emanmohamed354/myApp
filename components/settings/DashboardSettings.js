// components/settings/DashboardSettings.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import SettingsSection from './SettingsSection';
import SettingItem from './SettingItem';
import { formatRefreshRate, formatGaugeSize } from './utils/settingsHelpers';
import { showRefreshRateAlert, showGaugeSizeAlert } from './utils/alerts';
import { sensorConfig } from '../../utils/sensorConfig';

const DashboardSettings = ({ settings, updateSetting }) => {
  const [showSensorPicker, setShowSensorPicker] = useState(false);

  // Get all available sensors
  const getAllSensors = () => {
    const critical = Object.entries(sensorConfig.critical).map(([key, config]) => ({
      id: key,
      name: config.name,
      type: 'critical'
    }));
    
    const secondary = sensorConfig.secondary.map(sensor => ({
      id: sensor.apiKey,
      name: sensor.name,
      type: 'secondary'
    }));
    
    return [...critical, ...secondary];
  };

  const handleSensorToggle = (sensorId) => {
    const currentSensors = settings?.dashboard?.selectedSensors || [];
    const newSensors = currentSensors.includes(sensorId)
      ? currentSensors.filter(s => s !== sensorId)
      : [...currentSensors, sensorId];
    
    console.log('Toggling sensor:', sensorId, 'New sensors:', newSensors);
    updateSetting('dashboard.selectedSensors', newSensors);
  };

  const selectedSensorsDisplay = () => {
    const selected = settings?.dashboard?.selectedSensors || [];
    if (selected.length === 0) return 'None selected';
    
    const allSensors = getAllSensors();
    const names = selected
      .map(id => allSensors.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    
    return names.length > 30 ? `${names.substring(0, 30)}...` : names;
  };

  return (
    <>
      <SettingsSection title="Dashboard">
        <SettingItem
          icon="view-dashboard"
          label="Selected Sensors"
          value={selectedSensorsDisplay()}
          onPress={() => setShowSensorPicker(true)}
        />
        
        <SettingItem
          icon="refresh"
          label="Refresh Rate"
          value={formatRefreshRate(settings?.dashboard?.refreshRate || 500)}
          onPress={() => showRefreshRateAlert((rate) => updateSetting('dashboard.refreshRate', rate))}
        />
        
        <SettingItem
          icon="gauge"
          label="Gauge Size"
          value={formatGaugeSize(settings?.dashboard?.gaugeSize || 180)}
          onPress={() => showGaugeSizeAlert((size) => updateSetting('dashboard.gaugeSize', size))}
        />
        
        <SettingItem
          icon="alert-decagram"
          label="Show Warnings"
          value={settings?.dashboard?.showWarnings ?? true}
          onValueChange={(value) => updateSetting('dashboard.showWarnings', value)}
          isSwitch
        />
        
        <SettingItem
          icon="chart-line"
          label="Auto Scale"
          value={settings?.dashboard?.autoScale ?? true}
          onValueChange={(value) => updateSetting('dashboard.autoScale', value)}
          isSwitch
        />
      </SettingsSection>

      {/* Sensor Selection Modal */}
      <Modal
        visible={showSensorPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSensorPicker(false)}
      >
        <TouchableOpacity 
          style={tw`flex-1 bg-black/50`}
          activeOpacity={1}
          onPress={() => setShowSensorPicker(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={tw`flex-1 bg-gray-900 mt-20 rounded-t-3xl`}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={tw`p-4 border-b border-gray-800`}>
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-white text-lg font-bold`}>Select Sensors</Text>
                <TouchableOpacity 
                  onPress={() => setShowSensorPicker(false)}
                  style={tw`p-2`}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#60A5FA" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
              <View style={tw`p-4`}>
                <Text style={tw`text-gray-400 text-sm uppercase mb-3`}>Critical Sensors</Text>
                {Object.entries(sensorConfig.critical).map(([key, config]) => (
                  <SensorItem
                    key={key}
                    sensor={{ id: key, name: config.name }}
                    isSelected={(settings?.dashboard?.selectedSensors || []).includes(key)}
                    onToggle={() => handleSensorToggle(key)}
                  />
                ))}
                
                <Text style={tw`text-gray-400 text-sm uppercase mb-3 mt-6`}>Secondary Sensors</Text>
                {sensorConfig.secondary.map(sensor => (
                  <SensorItem
                    key={sensor.apiKey}
                    sensor={{ id: sensor.apiKey, name: sensor.name }}
                    isSelected={(settings?.dashboard?.selectedSensors || []).includes(sensor.apiKey)}
                    onToggle={() => handleSensorToggle(sensor.apiKey)}
                  />
                ))}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const SensorItem = ({ sensor, isSelected, onToggle }) => (
  <TouchableOpacity
    style={tw`flex-row items-center justify-between p-4 bg-gray-800 rounded-lg mb-2`}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <Text style={tw`text-white flex-1 mr-3`}>{sensor.name}</Text>
    <View style={tw`w-6 h-6 rounded-full border-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-600'} items-center justify-center`}>
      {isSelected && <MaterialCommunityIcons name="check" size={16} color="white" />}
    </View>
  </TouchableOpacity>
);

export default DashboardSettings;