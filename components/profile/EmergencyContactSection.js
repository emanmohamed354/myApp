import React from 'react';
import ProfileSection from './ProfileSection';
import ProfileField from './ProfileField';

const EmergencyContactSection = ({ editedData, editing, onUpdate }) => {
  const updateEmergencyContact = (field, value) => {
    onUpdate({
      ...editedData,
      emergencyContact: {
        ...editedData.emergencyContact,
        [field]: value
      }
    });
  };

  return (
    <ProfileSection title="Emergency Contact">
      <ProfileField
        icon="account-heart"
        label="Contact Name"
        value={editedData.emergencyContact?.name}
        editable={editing}
        onChangeText={(text) => updateEmergencyContact('name', text)}
      />
      <ProfileField
        icon="phone-alert"
        label="Contact Phone"
        value={editedData.emergencyContact?.phone}
        editable={editing}
        onChangeText={(text) => updateEmergencyContact('phone', text)}
        keyboardType="phone-pad"
      />
      <ProfileField
        icon="account-group"
        label="Relationship"
        value={editedData.emergencyContact?.relationship}
        editable={editing}
        onChangeText={(text) => updateEmergencyContact('relationship', text)}
      />
    </ProfileSection>
  );
};

export default EmergencyContactSection;