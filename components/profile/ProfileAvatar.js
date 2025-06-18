import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const ProfileAvatar = ({ profileData, editing }) => {
  const handlePhotoUpload = () => {
    Alert.alert('Coming Soon', 'Photo upload will be available soon');
  };

  return (
    <View style={tw`items-center pt-6 pb-4`}>
      <View style={tw`relative mb-4`}>
        <View style={tw`w-24 h-24 rounded-full bg-gray-700 items-center justify-center overflow-hidden`}>
          {profileData?.userImage ? (
            <Image 
              source={{ uri: profileData.userImage }} 
              style={tw`w-full h-full`}
            />
          ) : (
            <MaterialCommunityIcons name="account" size={50} color="#60A5FA" />
          )}
        </View>
        {editing && (
          <TouchableOpacity 
            style={tw`absolute bottom-0 right-0 bg-blue-600 rounded-full p-2`}
            onPress={handlePhotoUpload}
          >
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={tw`text-white text-2xl font-bold`}>
        {`${profileData?.firstName || ''} ${profileData?.lastName || ''}`}
      </Text>
      <Text style={tw`text-gray-400 text-sm`}>@{profileData?.username}</Text>
    </View>
  );
};

export default ProfileAvatar;