// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userInfo, logout, isCarPaired } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profile = await authApi.getUserProfile();
      setProfileData(profile);
      setEditedData(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement profile update API call when available
      Alert.alert('Success', 'Profile updated successfully');
      setProfileData(editedData);
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-900 justify-center items-center`}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
        style={{ paddingTop: insets.top }}
      >
        <View style={tw`px-4 py-4 flex-row justify-between items-center`}>
          {/* Only show back arrow if car is paired (coming from stack navigation) */}
          {isCarPaired ? (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={tw`w-6`} />
          )}
          <Text style={tw`text-white text-xl font-bold`}>Profile</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
            <Text style={tw`text-blue-400 font-medium`}>
              {editing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
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
                onPress={() => Alert.alert('Coming Soon', 'Photo upload will be available soon')}
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

        {/* Personal Information */}
        <ProfileSection title="Personal Information">
          <ProfileField
            icon="account"
            label="First Name"
            value={editedData.firstName}
            editable={editing}
            onChangeText={(text) => setEditedData({...editedData, firstName: text})}
          />
          <ProfileField
            icon="account"
            label="Last Name"
            value={editedData.lastName}
            editable={editing}
            onChangeText={(text) => setEditedData({...editedData, lastName: text})}
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
            onChangeText={(text) => setEditedData({...editedData, email: text})}
            keyboardType="email-address"
          />
          <ProfileField
            icon="phone"
            label="Phone"
            value={editedData.phone}
            editable={editing}
            onChangeText={(text) => setEditedData({...editedData, phone: text})}
            keyboardType="phone-pad"
          />
        </ProfileSection>

        {/* Address Information */}
        <ProfileSection title="Address">
          <ProfileField
            icon="road"
            label="Street"
            value={editedData.address?.street}
            editable={editing}
            onChangeText={(text) => setEditedData({
              ...editedData, 
              address: {...editedData.address, street: text}
            })}
          />
          <ProfileField
            icon="city"
            label="City"
            value={editedData.address?.city}
            editable={editing}
            onChangeText={(text) => setEditedData({
              ...editedData, 
              address: {...editedData.address, city: text}
            })}
          />
          <ProfileField
            icon="map-marker"
            label="State"
            value={editedData.address?.state}
            editable={editing}
            onChangeText={(text) => setEditedData({
              ...editedData, 
              address: {...editedData.address, state: text}
            })}
          />
          <ProfileField
            icon="earth"
            label="Country"
            value={editedData.address?.country}
            editable={editing}
            onChangeText={(text) => setEditedData({
              ...editedData, 
              address: {...editedData.address, country: text}
            })}
          />
          <ProfileField
            icon="mailbox"
            label="Zip Code"
            value={editedData.address?.zipCode}
            editable={editing}
            onChangeText={(text) => setEditedData({
              ...editedData, 
              address: {...editedData.address, zipCode: text}
            })}
          />
        </ProfileSection>

        {/* Driver Information */}
        <ProfileSection title="Driver Information">
          <ProfileField
            icon="card-account-details"
            label="License Number"
            value={editedData.licenseNumber}
            editable={editing}
            onChangeText={(text) => setEditedData({...editedData, licenseNumber: text})}
          />
          <ProfileField
            icon="calendar-clock"
            label="License Expiry"
            value={editedData.licenseExpiry ? new Date(editedData.licenseExpiry).toLocaleDateString() : ''}
            editable={false}
            onPress={editing ? () => Alert.alert('Coming Soon', 'Date picker will be available soon') : null}
          />
          <ProfileField
            icon="shield-car"
            label="Role"
            value={editedData.role}
            editable={false}
          />
        </ProfileSection>

        {/* Emergency Contact */}
        <ProfileSection title="Emergency Contact">
          <ProfileField
            icon="account-heart"
            label="Contact Name"
            value={editedData.emergencyContact?.name}
            editable={editing}
            onChangeText={(text) => setEditedData({
              ...editedData, 
              emergencyContact: {...editedData.emergencyContact, name: text}
            })}
          />
          <ProfileField
            icon="phone-alert"
            label="Contact Phone"
            value={editedData.emergencyContact?.phone}
            editable={editing}
            onChangeText={(text) => setEditedData({
              ...editedData, 
              emergencyContact: {...editedData.emergencyContact, phone: text}
            })}
            keyboardType="phone-pad"
          />
          <ProfileField
            icon="account-group"
            label="Relationship"
            value={editedData.emergencyContact?.relationship}
            editable={editing}
            onChangeText={(text) => setEditedData({
              ...editedData, 
              emergencyContact: {...editedData.emergencyContact, relationship: text}
            })}
          />
        </ProfileSection>

        {/* Subscription Info */}
        <ProfileSection title="Subscription">
          <ProfileField
            icon="crown"
            label="Plan"
            value={profileData?.subscriptionPlan || 'Free'}
            editable={false}
          />
          <ProfileField
            icon="calendar-check"
            label="Expires"
            value={profileData?.subscriptionExpiry ? new Date(profileData.subscriptionExpiry).toLocaleDateString() : 'N/A'}
            editable={false}
          />
        </ProfileSection>

        {/* Account Actions */}
        <View style={tw`px-4 pb-8 mt-4`}>
          <TouchableOpacity
            style={tw`bg-red-900/20 rounded-xl p-4 items-center`}
            onPress={handleLogout}
          >
            <View style={tw`flex-row items-center`}>
              <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
              <Text style={tw`text-red-400 ml-2 font-medium`}>Logout</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-gray-800 rounded-xl p-4 items-center mt-3`}
            onPress={() => Alert.alert('Delete Account', 'Please contact support to delete your account')}
          >
            <Text style={tw`text-gray-400 font-medium`}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Profile Section Component
const ProfileSection = ({ title, children }) => (
  <View style={tw`mb-6`}>
    <Text style={tw`text-gray-400 text-sm uppercase tracking-wider px-4 mb-3`}>
      {title}
    </Text>
    <View style={tw`bg-gray-800 mx-4 rounded-xl overflow-hidden`}>
      {children}
    </View>
  </View>
);

// Profile Field Component
const ProfileField = ({ icon, label, value, editable, onChangeText, onPress, keyboardType }) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={!onPress}
    style={tw`flex-row items-center p-4 border-b border-gray-700 last:border-b-0`}
  >
    <MaterialCommunityIcons name={icon} size={20} color="#60A5FA" style={tw`mr-3`} />
    <View style={tw`flex-1`}>
      <Text style={tw`text-gray-400 text-xs mb-1`}>{label}</Text>
      {editable ? (
        <TextInput
          value={value || ''}
          onChangeText={onChangeText}
          style={tw`text-white text-base p-0`}
          placeholderTextColor="#6B7280"
          editable={editable}
          keyboardType={keyboardType || 'default'}
        />
      ) : (
        <Text style={tw`text-white text-base`}>{value || 'Not set'}</Text>
      )}
    </View>
  </TouchableOpacity>
);