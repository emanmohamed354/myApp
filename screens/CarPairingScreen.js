// screens/CarPairingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Config from '../config/config';
import errorManager from '../services/errorManager';
import QrScanner from '../components/QrScanner';
import axios from 'axios';

const CarPairingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setCarPaired } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('display'); // 'display' or 'edit'
  const [localIp, setLocalIp] = useState('');
  const [showIpInput, setShowIpInput] = useState(true);
  const [ipError, setIpError] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
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
  const [showScanner, setShowScanner] = useState(false);

  const handleQrScan = async (data) => {
    setShowScanner(false);
    try {
      const qrData = JSON.parse(data);
      if (qrData.ip && validateIp(qrData.ip)) {
        setLocalIp(qrData.ip);
        Alert.alert(
          'QR Code Scanned',
          `Successfully scanned IP: ${qrData.ip}\n\nWould you like to pair now?`,
          [
            { text: 'Cancel' },
            { 
              text: 'Pair Now', 
              onPress: async () => {
                setLoading(true);
                const connectionValid = await testConnection(qrData.ip);
                if (connectionValid) {
                  await handlePairCar();
                }
              }
            }
          ]
        );
        
        // If WiFi info exists, prompt to connect
        if (qrData.ssid) {
          promptWifiConnection(qrData.ssid, qrData.password);
        }
        
        // Automatically test connection and pair
        const connectionValid = await testConnection(qrData.ip);
        if (connectionValid) {
          await AsyncStorage.setItem('localIpAddress', qrData.ip);
          await handlePairCar(); // This will trigger the full pairing flow
        }
        
      } else {
        Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid IP address.');
      }
    } catch (error) {
      console.error('QR Scan Error:', error);
      Alert.alert('Error', 'Failed to process QR code data.');
    }
  };

  const promptWifiConnection = (ssid, password) => {
    Alert.alert(
      'Connect to Car WiFi',
      `Your car's WiFi network is ${ssid}. Please connect to it in your device settings.`,
      [
        { text: 'Cancel' },
        { text: 'Open WiFi Settings', onPress: () => openWifiSettings() }
      ]
    );
  };

  const openWifiSettings = () => {
    Alert.alert('Info', 'Please manually connect to the WiFi in your device settings.');
  };

  const renderScannerOption = () => (
    <View style={tw`bg-gray-800 rounded-2xl p-6 mb-4`}>
      <Text style={tw`text-white text-xl font-bold mb-4`}>QR Code Pairing</Text>
      
      <TouchableOpacity
        style={tw`bg-blue-600 rounded-lg py-4 flex-row items-center justify-center`}
        onPress={() => setShowScanner(true)}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
        <Text style={tw`text-white text-lg ml-2`}>Scan QR Code</Text>
      </TouchableOpacity>

      <View style={tw`bg-blue-900/20 rounded-lg p-3 mt-4`}>
        <View style={tw`flex-row items-start`}>
          <MaterialCommunityIcons name="information" size={16} color="#60A5FA" style={tw`mt-0.5 mr-2`} />
          <View style={tw`flex-1`}>
            <Text style={tw`text-blue-400 text-xs font-semibold mb-1`}>How to pair with QR:</Text>
            <Text style={tw`text-gray-500 text-xs leading-5`}>
              1. Go to your car's dashboard{'\n'}
              2. Select "Pair Device"{'\n'}
              3. Choose "Generate QR Code"{'\n'}
              4. Scan the displayed QR code
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

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
      errorManager.handleError(error, 'loadSavedIp');
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

  const testConnection = async (ip) => {
    setIsTestingConnection(true);
    setIpError('');
    
    try {
      await Config.updateLocalIp(ip);
      
      const testApi = axios.create({
        baseURL: `http://${ip}:3000`,
        timeout: 2000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      await testApi.get('/api/auth/pairing-token');
      
      setIpError('');
      
      const api = require('../services/api').default;
      api.updateBaseUrl(`http://${ip}:3000`);
      
      return true;
    } catch (error) {
      console.log('Connection test failed:', error.message);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setIpError('Connection timeout. Please check the IP address.');
      } else if (error.code === 'ECONNREFUSED') {
        setIpError('Connection refused. Make sure your car is on.');
      } else {
        setIpError('Cannot connect. Please verify the IP address.');
      }
      
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handlePairCar = async () => {
    setIpError('');

    if (!localIp || !validateIp(localIp)) {
      setIpError('Please enter a valid IP address (e.g., 192.168.1.5)');
      return;
    }

    setLoading(true);
    
    try {
      const connectionValid = await testConnection(localIp);
      
      if (!connectionValid) {
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('localIpAddress', localIp);
      
      const result = await authApi.completePairingFlow(carData);
      
      if (result.success) {
        await setCarPaired(true);
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        throw new Error('Pairing failed');
      }
      
    } catch (error) {
      const handledError = errorManager.handleError(error, 'handlePairCar');
      
      if (handledError.type === 'network') {
        setIpError('Network error. Please check your connection and try again.');
      } else if (handledError.type === 'auth') {
        setIpError('Authentication failed. Please login again.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        setIpError('Pairing failed. Please try again.');
      }
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
      onPress={() => {
        setLocalIp(ip);
        setIpError('');
      }}
    >
      <Text style={tw`text-gray-300 text-sm`}>{ip}</Text>
    </TouchableOpacity>
  );

  const renderDisplayView = () => (
    <>
      {renderScannerOption()}

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
            <View style={tw`bg-gray-700 rounded-xl px-4 py-3 flex-row items-center ${ipError ? 'border border-red-500' : ''}`}>
              <MaterialCommunityIcons name="ip-network" size={20} color="#60A5FA" style={tw`mr-3`} />
              <TextInput
                style={tw`flex-1 text-white`}
                value={localIp}
                onChangeText={(text) => {
                  setLocalIp(text);
                  setIpError('');
                }}
                placeholder="192.168.1.5"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                autoCapitalize="none"
              />
              {localIp && validateIp(localIp) && !ipError && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
              )}
              {isTestingConnection && (
                <ActivityIndicator size="small" color="#60A5FA" />
              )}
            </View>
            
            {ipError && (
              <View style={tw`mt-2 bg-red-900/20 rounded-lg p-3`}>
                <Text style={tw`text-red-400 text-sm`}>{ipError}</Text>
              </View>
            )}
            
            {localIp && !validateIp(localIp) && !ipError && (
              <Text style={tw`text-red-400 text-xs mt-2`}>
                Please enter a valid IP address format
              </Text>
            )}
            
            <View style={tw`mt-4`}>
              <Text style={tw`text-gray-500 text-xs mb-2`}>Common local IPs:</Text>
              <View style={tw`flex-row flex-wrap`}>
                <CommonIpButton ip="192.168.1.5" />
                <CommonIpButton ip="192.168.0.5" />
                <CommonIpButton ip="10.0.0.5" />
                <CommonIpButton ip="172.16.0.5" />
              </View>
            </View>
            
            {localIp && validateIp(localIp) && (
              <TouchableOpacity
                style={tw`bg-gray-700 rounded-lg px-4 py-2 mt-3 flex-row items-center justify-center`}
                onPress={() => testConnection(localIp)}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <ActivityIndicator size="small" color="#60A5FA" />
                    <Text style={tw`text-blue-400 text-sm ml-2`}>Testing...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="connection" size={16} color="#60A5FA" />
                    <Text style={tw`text-blue-400 text-sm ml-2`}>Test Connection</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
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
        style={tw`bg-blue-600 rounded-2xl py-4 px-6 shadow-lg ${(!localIp || loading || ipError) ? 'opacity-60' : ''}`}
        onPress={handlePairCar}
        disabled={loading || !localIp || !!ipError}
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
        <View style={tw`items-center mb-8`}>
          <View style={tw`bg-blue-600/20 rounded-full p-6`}>
            <MaterialCommunityIcons name="car-connected" size={80} color="#60A5FA" />
          </View>
        </View>

        {step === 'display' ? renderDisplayView() : renderEditView()}

        <Modal
          visible={showScanner}
          animationType="slide"
          onRequestClose={() => setShowScanner(false)}
        >
          <QrScanner 
            onScan={handleQrScan} 
            onClose={() => setShowScanner(false)} 
          />
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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