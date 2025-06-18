import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';

export const useProfile = () => {
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

  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing
      setEditedData(profileData);
      setEditing(false);
    } else {
      setEditing(true);
    }
  };

  const updateEditedData = (newData) => {
    setEditedData(newData);
  };

  return {
    loading,
    editing,
    profileData,
    editedData,
    isCarPaired,
    userInfo,
    logout,
    handleSave,
    handleEditToggle,
    updateEditedData
  };
};