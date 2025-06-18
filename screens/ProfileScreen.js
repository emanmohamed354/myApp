import React from 'react';
import { View, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useProfile } from '../hooks/useProfile';

// Import all components
import {
  ProfileHeader,
  ProfileAvatar,
  PersonalInfoSection,
  AddressSection,
  DriverInfoSection,
  EmergencyContactSection,
  SubscriptionSection,
  AccountActions,
  LoadingState
} from '../components/profile';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    loading,
    editing,
    profileData,
    editedData,
    isCarPaired,
    logout,
    handleSave,
    handleEditToggle,
    updateEditedData
  } = useProfile();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ProfileHeader
        insets={insets}
        navigation={navigation}
        isCarPaired={isCarPaired}
        editing={editing}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
      />

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        <ProfileAvatar 
          profileData={profileData} 
          editing={editing} 
        />

        <PersonalInfoSection
          editedData={editedData}
          editing={editing}
          onUpdate={updateEditedData}
        />

        <AddressSection
          editedData={editedData}
          editing={editing}
          onUpdate={updateEditedData}
        />

        <DriverInfoSection
          editedData={editedData}
          editing={editing}
          onUpdate={updateEditedData}
        />

        <EmergencyContactSection
          editedData={editedData}
          editing={editing}
          onUpdate={updateEditedData}
        />

        <SubscriptionSection profileData={profileData} />

        <AccountActions onLogout={logout} />
      </ScrollView>
    </View>
  );
}