// screens/CarPairingScreen.js
import React, { useState, useEffect ,useRef } from 'react';
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
import QrScanner from '../components/QrScanner';
import axios from 'axios';

const CarPairingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setCarPaired } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [step, setStep] = useState('display');
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
  const isScanningRef = useRef(false); 
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
      console.log('Error loading saved IP:', error);
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


  const handleQrScan = async (data) => {
      if (isScanningRef.current) {
        console.log('[QR_SCAN] Scan already in progress, ignoring');
        return;
      }
      
      isScanningRef.current = true;
      console.log('[QR_SCAN] 1. Starting handleQrScan');
      
      try {
        console.log('[QR_SCAN] 2. Parsing QR data');
        let qrData;
        try {
          qrData = JSON.parse(data);
          console.log('[QR_SCAN] 3. Parsed QR data:', qrData);
        } catch (e) {
          Alert.alert('Invalid QR Code', 'The scanned data is not valid JSON.');
          return;
        }
        
        if (!qrData.ip || !validateIp(qrData.ip)) {
          Alert.alert('Invalid QR Code', 'The scanned QR code does not contain a valid IP address.');
          return;
        }
        
        console.log('[QR_SCAN] 4. Setting local IP:', qrData.ip);
        setLocalIp(qrData.ip);
        
        try {
          console.log('[QR_SCAN] 5. Saving IP to AsyncStorage');
          await AsyncStorage.setItem('localIpAddress', qrData.ip);
          console.log('[QR_SCAN] 6. IP saved successfully');
        } catch (e) {
          console.log('[QR_SCAN] Error saving IP to storage:', e);
        }
        
        // Handle WiFi connection if present
        if (qrData.ssid) {
          console.log('[QR_SCAN] 7. Showing WiFi alert');
          Alert.alert(
            'Connect to Car WiFi',
            `Your car's WiFi network is "${qrData.ssid}". Please connect to it in your device settings before pairing.`,
            [
              { 
                text: 'OK', 
                onPress: () => {
                  console.log('[QR_SCAN] 8. WiFi alert OK pressed');
                  showPairingConfirmation(qrData.ip);
                }
              }
            ],
            { cancelable: false }
          );
        } else {
          console.log('[QR_SCAN] 7. No WiFi info, showing pairing confirmation');
          showPairingConfirmation(qrData.ip);
        }
        
      } catch (error) {
        console.log('[QR_SCAN] ERROR in handleQrScan:', error);
        console.log('[QR_SCAN] Error stack:', error.stack);
        Alert.alert('Error', 'Failed to process QR code data.');
      } finally {
        isScanningRef.current = false;
      }
    };

  const showPairingConfirmation = (ip) => {
    console.log('[QR_SCAN] 9. Showing pairing confirmation for IP:', ip);
    
    try {
      Alert.alert(
        'QR Code Scanned',
        `Successfully scanned IP: ${ip}\n\nWould you like to pair now?`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => console.log('[QR_SCAN] Cancel pressed')
          },
          { 
            text: 'Pair Now', 
            onPress: async () => {
              console.log('[QR_SCAN] 10. Pair Now pressed');
              try {
                setLoading(true);
                const connectionValid = await testConnection(ip);
                console.log('[QR_SCAN] 11. Connection test result:', connectionValid);
                
                if (connectionValid) {
                  console.log('[QR_SCAN] 12. Starting handlePairCar');
                  const result = await authApi.completePairingFlow(carData);
                  
                  if (result.success) {
                    await setCarPaired(true);
                    console.log('[QR_SCAN] 13. Pairing successful, closing scanner and screen');
                    setShowScanner(false);
                    navigation.replace('MainTabs');
                  } else {
                    throw new Error('Pairing failed');
                  }
                }
              } catch (error) {
                console.log('[QR_SCAN] ERROR in pairing:', error);
                Alert.alert('Pairing Failed', 'Could not complete pairing. Please try again.');
              } finally {
                setLoading(false);
              }
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.log('[QR_SCAN] Error showing alert:', error);
      console.log('[QR_SCAN] Error stack:', error.stack);
    }
  };
const testConnection = async (ip) => {
  console.log('[TEST_CONN] 1. Starting connection test for IP:', ip);
  setIsTestingConnection(true);
  setIpError('');
  
  try {
    // Only update config if it exists and has the method
    try {
      console.log('[TEST_CONN] 2. Updating config');
      if (Config && typeof Config.updateLocalIp === 'function') {
        await Config.updateLocalIp(ip);
        console.log('[TEST_CONN] 3. Config updated successfully');
      } else {
        console.log('[TEST_CONN] 3. Config.updateLocalIp not available, using fallback');
        await AsyncStorage.setItem('localIpAddress', ip);
      }
    } catch (configError) {
      console.log('[TEST_CONN] Config update error:', configError);
      // Continue anyway
    }
    
    console.log('[TEST_CONN] 4. Creating test axios instance');
    // Create a test axios instance
    const testApi = axios.create({
      baseURL: `http://${ip}:3000`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('[TEST_CONN] 5. Making test request');
    // Try to connect to the pairing endpoint
    const response = await testApi.get('/api/auth/pairing-token');
    
    console.log('[TEST_CONN] 6. Test request successful');
    if (response.status === 200) {
      setIpError('');
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('[TEST_CONN] Connection test failed:', error.message);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      setIpError('Connection timeout. Please check if your car is on and connected to the same network.');
    } else if (error.code === 'ECONNREFUSED') {
      setIpError('Connection refused. Make sure your car system is running.');
    } else if (error.response && error.response.status === 404) {
      setIpError('Invalid endpoint. Please check if this is the correct car system.');
    } else {
      setIpError('Cannot connect. Please verify the IP address and network connection.');
    }
    
    return false;
  } finally {
    console.log('[TEST_CONN] 7. Connection test completed');
    setIsTestingConnection(false);
  }
};

  const handlePairCar = async () => {
    // Prevent multiple simultaneous pairing attempts
    if (isPairing || loading) return;
    
    setIpError('');

    if (!localIp || !validateIp(localIp)) {
      setIpError('Please enter a valid IP address (e.g., 192.168.1.5)');
      return;
    }

    setLoading(true);
    setIsPairing(true);
    
    try {
      const connectionValid = await testConnection(localIp);
      
      if (!connectionValid) {
        return;
      }

      await AsyncStorage.setItem('localIpAddress', localIp);
      
      const result = await authApi.completePairingFlow(carData);
      
      if (result.success) {
        await setCarPaired(true);
        
        // Use requestAnimationFrame for smoother navigation
        requestAnimationFrame(() => {
          navigation.replace('MainTabs');
        });
      } else {
        throw new Error('Pairing failed');
      }
      
    } catch (error) {
      console.log('Pairing error:', error);
      
      if (error.message && error.message.includes('Network')) {
        setIpError('Network error. Please check your connection and try again.');
      } else if (error.message && (error.message.includes('401') || error.message.includes('auth'))) {
        setIpError('Authentication failed. Please login again.');
        setTimeout(() => {
          navigation.replace('Login');
        }, 1000);
      } else {
        setIpError('Pairing failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsPairing(false);
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
      disabled={loading || isPairing}
    >
      <Text style={tw`text-gray-300 text-sm`}>{ip}</Text>
    </TouchableOpacity>
  );

  const renderScannerOption = () => (
    <View style={tw`bg-gray-800 rounded-2xl p-6 mb-4`}>
      <Text style={tw`text-white text-xl font-bold mb-4`}>QR Code Pairing</Text>
      
      <TouchableOpacity
        style={tw`bg-blue-600 rounded-lg py-4 flex-row items-center justify-center ${(loading || isPairing) ? 'opacity-60' : ''}`}
        onPress={() => setShowScanner(true)}
        disabled={loading || isPairing}
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
                editable={!loading && !isPairing}
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
                disabled={isTestingConnection || loading || isPairing}
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
          <TouchableOpacity onPress={handleEditCar} disabled={loading || isPairing}>
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
        style={tw`bg-blue-600 rounded-2xl py-4 px-6 shadow-lg ${(!localIp || loading || isPairing || ipError) ? 'opacity-60' : ''}`}
        onPress={handlePairCar}
        disabled={loading || isPairing || !localIp || !!ipError}
      >
        {loading || isPairing ? (
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
          onClose={() => {
            console.log('[QR_SCAN] Scanner closed');
            setShowScanner(false);
          }} 
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