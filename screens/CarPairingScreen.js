// screens/CarPairingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Config from '../config/config';

const CarPairingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setCarPaired } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('display'); // 'display' or 'edit'
  const [localIp, setLocalIp] = useState('');
  const [showIpInput, setShowIpInput] = useState(true);
  const [carData, setCarData] = useState({
    make: "Honda",
    model: "Accord",
    year: 2021,
    trim: "EX-L",
    color: "Metallic Blue",
    engineSize: "2.0L",
    transmission: "CVT",
    fuelType: "Gasoline"
  });

  useEffect(() => {
    loadSavedIp();
  }, []);

  const loadSavedIp = async () => {
    try {
      const savedIp = await AsyncStorage.getItem('localIpAddress');
      if (savedIp) {
        setLocalIp(savedIp);
      }
    } catch (error) {
      console.error('Error loading saved IP:', error);
    }
  };

  const validateIp = (ip) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return false;
    }
    const parts = ip.split('.');
    return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
  };

  const handlePairCar = async () => {
    // Validate IP address
    if (!localIp || !validateIp(localIp)) {
      Alert.alert('Invalid IP', 'Please enter a valid IP address (e.g., 192.168.1.5)');
      return;
    }

    setLoading(true);
    try {
      // Save IP address and update config
      await Config.updateLocalIp(localIp);
      
      // Update the API service with new IP
      const api = require('../services/api').default;
      api.updateBaseUrl(await Config.getLocalApiUrl());
      
      // Complete pairing flow
      const result = await authApi.completePairingFlow(carData);
      
      // Set car as paired
      await setCarPaired(true);
      
      // Navigate to the main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      
    } catch (error) {
      console.error('Pairing failed:', error);
      Alert.alert('Error', `Pairing failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCar = () => {
    setStep('edit');
  };

  const handleSaveEdit = () => {
    setStep('display');
  };

  const CommonIpButton = ({ ip }) => (
    <TouchableOpacity
      style={tw`bg-gray-700 px-3 py-2 rounded-lg mr-2 mb-2`}
      onPress={() => setLocalIp(ip)}
    >
      <Text style={tw`text-gray-300 text-sm`}>{ip}</Text>
    </TouchableOpacity>
  );

  const renderDisplayView = () => (
    <>
      {/* IP Address Input Section */}
      <View style={tw`bg-gray-800 rounded-2xl p-6 mb-4`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-white text-xl font-bold`}>Local Connection</Text>
          <TouchableOpacity onPress={() => setShowIpInput(!showIpInput)}>
            <MaterialCommunityIcons
              name={showIpInput ? "chevron-up" : "chevron-down"}
              size={24}
              color="#60A5FA"
            />
          </TouchableOpacity>
        </View>
        
        {showIpInput && (
          <View>
            <Text style={tw`text-gray-400 text-sm mb-2`}>
              Enter your car's local IP address
            </Text>
            <View style={tw`bg-gray-700 rounded-xl px-4 py-3 flex-row items-center`}>
              <MaterialCommunityIcons name="ip-network" size={20} color="#60A5FA" style={tw`mr-3`} />
              <TextInput
                style={tw`flex-1 text-white`}
                value={localIp}
                onChangeText={setLocalIp}
                placeholder="192.168.1.5"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                autoCapitalize="none"
              />
              {localIp && validateIp(localIp) && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              )}
            </View>
            
            {/* IP Format Helper */}
            {localIp && !validateIp(localIp) && (
              <Text style={tw`text-red-400 text-xs mt-2`}>
                Please enter a valid IP address format
              </Text>
            )}
            
            {/* Common IPs */}
            <View style={tw`mt-4`}>
              <Text style={tw`text-gray-500 text-xs mb-2`}>Common local IPs:</Text>
              <View style={tw`flex-row flex-wrap`}>
                <CommonIpButton ip="192.168.1.5" />
                <CommonIpButton ip="192.168.0.5" />
                <CommonIpButton ip="10.0.0.5" />
                <CommonIpButton ip="172.16.0.5" />
              </View>
            </View>
            
            {/* Instructions */}
            <View style={tw`bg-blue-900/20 rounded-lg p-3 mt-4`}>
              <View style={tw`flex-row items-start`}>
                <MaterialCommunityIcons name="information" size={16} color="#60A5FA" style={tw`mt-0.5 mr-2`} />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-blue-400 text-xs font-semibold mb-1`}>How to find your car's IP:</Text>
                  <Text style={tw`text-gray-500 text-xs leading-5`}>
                    1. Turn on your car's display{'\n'}
                    2. Go to Settings → Network{'\n'}
                    3. Look for "Local IP Address"{'\n'}
                    4. Enter the IP shown above
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Vehicle Details */}
      <View style={tw`bg-gray-800 rounded-2xl p-6 mb-6`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-white text-xl font-bold`}>Vehicle Details</Text>
          <TouchableOpacity onPress={handleEditCar}>
            <MaterialCommunityIcons name="pencil" size={24} color="#60A5FA" />
          </TouchableOpacity>
        </View>
        
        <View style={tw`ml-3`}>
          <InfoRow label="Make" value={carData.make} />
          <InfoRow label="Model" value={carData.model} />
          <InfoRow label="Year" value={carData.year.toString()} />
          <InfoRow label="Trim" value={carData.trim} />
          <InfoRow label="Color" value={carData.color} />
          <InfoRow label="Engine" value={carData.engineSize} />
          <InfoRow label="Transmission" value={carData.transmission} />
          <InfoRow label="Fuel Type" value={carData.fuelType} />
        </View>
      </View>

      <TouchableOpacity
        style={tw`bg-blue-600 rounded-2xl py-4 px-6 shadow-lg ${(!localIp || loading) ? 'opacity-60' : ''}`}
        onPress={handlePairCar}
        disabled={loading || !localIp}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={tw`flex-row items-center justify-center`}>
            <MaterialCommunityIcons name="link-variant" size={24} color="white" />
            <Text style={tw`text-white text-center font-bold text-lg ml-2`}>
              Pair This Vehicle
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {/* Additional Info */}
      <View style={tw`mt-4 mb-8`}>
        <Text style={tw`text-gray-500 text-xs text-center`}>
          Make sure your phone and car are on the same network
        </Text>
      </View>
    </>
  );

  const renderEditView = () => (
    <>
      <View style={tw`bg-gray-800 rounded-2xl p-6 mb-6`}>
        <Text style={tw`text-white text-xl font-bold mb-4`}>Edit Vehicle Details</Text>
        
        <View style={tw`space-y-4`}>
          <EditInput label="Make" value={carData.make} onChangeText={(text) => setCarData({...carData, make: text})} />
          <EditInput label="Model" value={carData.model} onChangeText={(text) => setCarData({...carData, model: text})} />
          <EditInput label="Year" value={carData.year.toString()} onChangeText={(text) => setCarData({...carData, year: parseInt(text) || 0})} keyboardType="numeric" />
          <EditInput label="Trim" value={carData.trim} onChangeText={(text) => setCarData({...carData, trim: text})} />
          <EditInput label="Color" value={carData.color} onChangeText={(text) => setCarData({...carData, color: text})} />
          <EditInput label="Engine Size" value={carData.engineSize} onChangeText={(text) => setCarData({...carData, engineSize: text})} />
          <EditInput label="Transmission" value={carData.transmission} onChangeText={(text) => setCarData({...carData, transmission: text})} />
          <EditInput label="Fuel Type" value={carData.fuelType} onChangeText={(text) => setCarData({...carData, fuelType: text})} />
        </View>
      </View>

      <View style={tw`flex-row gap-3`}>
        <TouchableOpacity
          style={tw`flex-1 bg-gray-700 rounded-2xl py-4 px-6`}
          onPress={() => setStep('display')}
        >
          <Text style={tw`text-white text-center font-semibold`}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={tw`flex-1 bg-blue-600 rounded-2xl py-4 px-6`}
          onPress={handleSaveEdit}
        >
          <Text style={tw`text-white text-center font-semibold`}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-gray-900`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
        style={{ paddingTop: insets.top }}
      >
        <View style={tw`px-6 py-6`}>
          <Text style={tw`text-white text-3xl font-bold`}>Pair Your Vehicle</Text>
          <Text style={tw`text-gray-300 mt-2`}>Connect your car to unlock all features</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={tw`flex-1 px-6 pt-6`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon */}
        <View style={tw`items-center mb-8`}>
          <View style={tw`bg-blue-600/20 rounded-full p-6`}>
            <MaterialCommunityIcons name="car-connected" size={80} color="#60A5FA" />
          </View>
        </View>

        {/* Content */}
        {step === 'display' ? renderDisplayView() : renderEditView()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Helper Components
const InfoRow = ({ label, value }) => (
  <View style={tw`flex-row justify-between py-2`}>
    <Text style={tw`text-gray-400`}>{label}</Text>
    <Text style={tw`text-white font-medium`}>{value}</Text>
  </View>
);

const EditInput = ({ label, value, onChangeText, keyboardType = 'default' }) => (
  <View style={tw`mb-4`}>
    <Text style={tw`text-gray-400 text-sm mb-1`}>{label}</Text>
    <TextInput
      style={tw`bg-gray-700 rounded-xl px-4 py-3 text-white`}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#6B7280"
    />
  </View>
);

export default CarPairingScreen;