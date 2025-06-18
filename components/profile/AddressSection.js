import React from 'react';
import ProfileSection from './ProfileSection';
import ProfileField from './ProfileField';

const AddressSection = ({ editedData, editing, onUpdate }) => {
  const updateAddress = (field, value) => {
    onUpdate({
      ...editedData,
      address: {
        ...editedData.address,
        [field]: value
      }
    });
  };

  return (
    <ProfileSection title="Address">
      <ProfileField
        icon="road"
        label="Street"
        value={editedData.address?.street}
        editable={editing}
        onChangeText={(text) => updateAddress('street', text)}
      />
      <ProfileField
        icon="city"
        label="City"
        value={editedData.address?.city}
        editable={editing}
        onChangeText={(text) => updateAddress('city', text)}
      />
      <ProfileField
        icon="map-marker"
        label="State"
        value={editedData.address?.state}
        editable={editing}
        onChangeText={(text) => updateAddress('state', text)}
      />
      <ProfileField
        icon="earth"
        label="Country"
        value={editedData.address?.country}
        editable={editing}
        onChangeText={(text) => updateAddress('country', text)}
      />
      <ProfileField
        icon="mailbox"
        label="Zip Code"
        value={editedData.address?.zipCode}
        editable={editing}
        onChangeText={(text) => updateAddress('zipCode', text)}
      />
    </ProfileSection>
  );
};

export default AddressSection;