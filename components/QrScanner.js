// components/QrScanner.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert,ActivityIndicator   } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import tw from 'twrnc';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
const QrScanner = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const insets = useSafeAreaInsets(); // Get safe area insets

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera permissions to scan QR codes',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    onScan(data);
  };

  if (hasPermission === null) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-black`}>
        <ActivityIndicator size="large" color="white" />
        <Text style={tw`text-white mt-4`}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-black`}>
        <MaterialCommunityIcons 
          name="camera-off" 
          size={48} 
          color="white" 
          style={tw`mb-4`} 
        />
        <Text style={tw`text-white text-center mb-6`}>
          Camera access is required to scan QR codes
        </Text>
        <TouchableOpacity
          style={tw`bg-blue-600 px-6 py-3 rounded-lg`}
          onPress={requestCameraPermission}
        >
          <Text style={tw`text-white font-bold`}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-black`}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
        style={StyleSheet.absoluteFillObject}
      />

     <View style={[tw`absolute right-4`, { top: insets.top + 50 }]}>
        <TouchableOpacity
          onPress={onClose}
          style={tw`bg-gray-800 p-3 rounded-full`}
        >
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={tw`absolute top-1/2 left-0 right-0 items-center`}>
        <View style={tw`border-2 border-blue-500 w-64 h-64 rounded-lg`} />
      </View>

      <View style={tw`absolute bottom-8 left-0 right-0 items-center`}>
        <Text style={tw`text-white text-lg mb-4`}>Scan your car's QR code</Text>
      </View>
    </View>
  );
};

export default QrScanner;