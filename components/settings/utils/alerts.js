import { Alert } from 'react-native';

export const showLanguageAlert = (onSelect) => {
  Alert.alert(
    'Language',
    'Select app language',
    [
      { text: 'English', onPress: () => onSelect('en') },
      { text: 'Spanish', onPress: () => onSelect('es') },
      { text: 'French', onPress: () => onSelect('fr') },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
};

export const showRefreshRateAlert = (onSelect) => {
  Alert.alert(
    'Refresh Rate',
    'Select dashboard refresh rate',
    [
      { text: '250ms (Fast)', onPress: () => onSelect(250) },
      { text: '500ms (Normal)', onPress: () => onSelect(500) },
      { text: '1000ms (Slow)', onPress: () => onSelect(1000) },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
};

export const showGaugeSizeAlert = (onSelect) => {
  Alert.alert(
    'Gauge Size',
    'Select gauge size',
    [
      { text: 'Small (160px)', onPress: () => onSelect(160) },
      { text: 'Medium (180px)', onPress: () => onSelect(180) },
      { text: 'Large (200px)', onPress: () => onSelect(200) },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
};

export const showLoggingIntervalAlert = (onSelect) => {
  Alert.alert(
    'Logging Interval',
    'Select data logging interval',
    [
      { text: '500ms', onPress: () => onSelect(500) },
      { text: '1000ms', onPress: () => onSelect(1000) },
      { text: '2000ms', onPress: () => onSelect(2000) },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
};

export const showMaxFileSizeAlert = (onSelect) => {
  Alert.alert(
    'Max File Size',
    'Select maximum log file size',
    [
      { text: '50MB', onPress: () => onSelect(50) },
      { text: '100MB', onPress: () => onSelect(100) },
      { text: '200MB', onPress: () => onSelect(200) },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
};

export const showAIVoiceAlert = (onSelect) => {
  Alert.alert(
    'AI Voice',
    'Select AI assistant voice',
    [
      { text: 'Standard A', onPress: () => onSelect('en-US-Standard-A') },
      { text: 'Standard B', onPress: () => onSelect('en-US-Standard-B') },
      { text: 'Standard C', onPress: () => onSelect('en-US-Standard-C') },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
};

export const showComingSoonAlert = (feature) => {
  Alert.alert('Coming Soon', `${feature} will be available in the next update`);
};

export const showExportDataAlert = (onExport) => {
  Alert.alert(
    'Export Data',
    'Export all your vehicle data?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Export', onPress: onExport }
    ]
  );
};

export const showClearCacheAlert = (onClear) => {
  Alert.alert(
    'Clear Cache',
    'This will clear all cached data. Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: onClear }
    ]
  );
};

export const showUnpairAlert = (onUnpair) => {
  Alert.alert(
    'Unpair Vehicle',
    'Are you sure you want to unpair your vehicle? You will need to pair again to access vehicle features.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unpair', style: 'destructive', onPress: onUnpair }
    ]
  );
};

export const showLogoutAlert = (onLogout) => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout }
    ]
  );
};