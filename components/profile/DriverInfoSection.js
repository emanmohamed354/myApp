import React from 'react';
import { Alert } from 'react-native';
import ProfileSection from './ProfileSection';
import ProfileField from './ProfileField';
import { formatDate } from './utils/profileHelpers';

const DriverInfoSection = ({ editedData, editing, onUpdate }) => {
  const handleDatePress = () => {
    if (editing) {
      Alert.alert('Coming Soon', 'Date picker will be available soon');
    }
  };

  return (
    <ProfileSection title="Driver Information">
      <ProfileField
        icon="card-account-details"
        label="License Number"
        value={editedData.licenseNumber}
        editable={editing}
        onChangeText={(text) => onUpdate({...editedData, licenseNumber: text})}
      />
      <ProfileField
        icon="calendar-clock"
        label="License Expiry"
        value={formatDate(editedData.licenseExpiry)}
        editable={false}
        onPress={handleDatePress}
      />
      <ProfileField
        icon="shield-car"
        label="Role"
        value={editedData.role}
        editable={false}
      />
    </ProfileSection>
  );
};

export default DriverInfoSection;