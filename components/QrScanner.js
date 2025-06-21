// components/QrScanner.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import tw from 'twrnc';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Import Haptics at the top of the file
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

const QrScanner = ({ onScan, onClose }) => {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const lastScanTime = useRef(0);
  const hasFiredScan = useRef(false);

  useEffect(() => {
    if (permission?.granted) {
      startScanAnimation();
    }
    return () => {
      scanLineAnim.stopAnimation();
      hasFiredScan.current = false;
    };
  }, [permission]);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBarCodeScanned = ({ type, data }) => {
    // Prevent multiple scans
    const currentTime = Date.now();
    if (scanned || hasFiredScan.current || currentTime - lastScanTime.current < 2000) {
      return;
    }
    
    lastScanTime.current = currentTime;
    setScanned(true);
    hasFiredScan.current = true;
    
    // Vibration feedback - use the imported Haptics
    try {
      if (Haptics && Haptics.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.log('Haptics not available:', e);
    }
    
    // Close scanner immediately before calling onScan
    onClose();
    
    // Small delay to ensure modal is closed
    setTimeout(() => {
      onScan(data);
    }, 100);
  };

  if (!permission) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-black`}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-black px-6`}>
        <View style={tw`bg-gray-800 rounded-2xl p-6 items-center`}>
          <MaterialCommunityIcons 
            name="camera-off" 
            size={48} 
            color="#60A5FA" 
            style={tw`mb-4`} 
          />
          <Text style={tw`text-white text-lg font-bold text-center mb-2`}>
            Camera Permission Required
          </Text>
          <Text style={tw`text-gray-400 text-center mb-6`}>
            We need camera access to scan QR codes from your car's display
          </Text>
          <TouchableOpacity
            style={tw`bg-blue-600 px-6 py-3 rounded-lg`}
            onPress={requestPermission}
          >
            <Text style={tw`text-white font-bold`}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  return (
    <View style={tw`flex-1 bg-black`}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
        enableTorch={flashEnabled}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dark overlay with cutout */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={tw`flex-1 bg-black/60`} />
        <View style={tw`flex-row`}>
          <View style={tw`flex-1 bg-black/60`} />
          <View style={tw`w-64 h-64`} />
          <View style={tw`flex-1 bg-black/60`} />
        </View>
        <View style={tw`flex-1 bg-black/60`} />
      </View>

      {/* Header */}
      <View style={[tw`absolute top-0 left-0 right-0 px-4`, { paddingTop: insets.top + 10 }]}>
        <View style={tw`flex-row justify-between items-center`}>
          <TouchableOpacity
            onPress={onClose}
            style={tw`bg-gray-800/80 p-3 rounded-full`}
          >
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setFlashEnabled(!flashEnabled)}
            style={tw`bg-gray-800/80 p-3 rounded-full`}
          >
            <MaterialCommunityIcons 
              name={flashEnabled ? "flash" : "flash-off"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scanner frame */}
      <View style={tw`absolute top-1/2 left-1/2`} pointerEvents="none">
        <View style={[tw`w-64 h-64`, { marginLeft: -128, marginTop: -128 }]}>
          {/* Corner brackets */}
          <View style={tw`absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg`} />
          <View style={tw`absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-lg`} />
          <View style={tw`absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-lg`} />
          <View style={tw`absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg`} />
          
          {/* Scanning line */}
          <Animated.View 
            style={[
              tw`absolute left-2 right-2 h-0.5 bg-blue-500`,
              {
                top: '50%',
                transform: [{ translateY: scanLineTranslateY }],
                opacity: 0.8,
              }
            ]}
          />
        </View>
      </View>

      {/* Instructions */}
      <View style={tw`absolute bottom-20 left-0 right-0 items-center px-6`}>
        <View style={tw`bg-gray-800/80 rounded-2xl px-6 py-4`}>
          <Text style={tw`text-white text-lg text-center font-bold mb-1`}>
            Position QR code within frame
          </Text>
          <Text style={tw`text-gray-400 text-sm text-center`}>
            Scanning will happen automatically
          </Text>
        </View>
        
        {scanned && (
          <View style={tw`mt-4 bg-green-600/80 rounded-full px-4 py-2 flex-row items-center`}>
            <MaterialCommunityIcons name="check-circle" size={20} color="white" />
            <Text style={tw`text-white text-sm ml-2`}>QR Code Detected!</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default QrScanner;