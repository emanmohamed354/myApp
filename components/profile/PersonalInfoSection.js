import React from 'react';
import ProfileSection from './ProfileSection';
import ProfileField from './ProfileField';

const PersonalInfoSection = ({ editedData, editing, onUpdate }) => {
  return (
    <ProfileSection title="Personal Information">
      <ProfileField
        icon="account"
        label="First Name"
        value={editedData.firstName}
        editable={editing}
        onChangeText={(text) => onUpdate({...editedData, firstName: text})}
      />
      <ProfileField
        icon="account"
        label="Last Name"
        value={editedData.lastName}
        editable={editing}
        onChangeText={(text) => onUpdate({...editedData, lastName: text})}
      />
      <ProfileField
        icon="account-circle"
        label="Username"
        value={editedData.username}
        editable={false}
      />
      <ProfileField
        icon="email"
        label="Email"
        value={editedData.email}
        editable={editing}
        onChangeText={(text) => onUpdate({...editedData, email: text})}
        keyboardType="email-address"
      />
      <ProfileField
        icon="phone"
        label="Phone"
        value={editedData.phone}
        editable={editing}
        onChangeText={(text) => onUpdate({...editedData, phone: text})}
        keyboardType="phone-pad"
      />
    </ProfileSection>
  );
};

export default PersonalInfoSection;