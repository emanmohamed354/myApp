import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import tw from 'twrnc';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  // Enhanced buffering system for Android
  const scanDataBuffer = useRef(new Set()); // Use Set to avoid duplicates
  const scanTimeout = useRef(null);
  const scanAttempts = useRef(0);
  const maxScanAttempts = 10;
  const isAndroid = Platform.OS === 'android';

  // Detection patterns for valid QR data
  const validPatterns = [
    /^\{.*"ip".*\}$/,  // JSON with ip field
    /^\{.*"ssid".*\}$/, // JSON with ssid field
    /^\{.*"port".*\}$/, // JSON with port field
  ];

  useEffect(() => {
    if (permission?.granted) {
      startScanAnimation();
    }
    return () => {
      scanLineAnim.stopAnimation();
      hasFiredScan.current = false;
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
      scanDataBuffer.current.clear();
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

  const isValidCompleteData = (data) => {
    if (!data || typeof data !== 'string') return false;

    // Check if it matches any valid pattern
    return validPatterns.some(pattern => pattern.test(data.trim()));
  };

  const isPartialJsonData = (data) => {
    if (!data || typeof data !== 'string') return false;

    const trimmed = data.trim();

    // Check for partial JSON indicators
    return (
      trimmed.includes('{') ||
      trimmed.includes('}') ||
      trimmed.includes('"ip"') ||
      trimmed.includes('"ssid"') ||
      trimmed.includes('"port"') ||
      trimmed.includes('192.168') ||
      trimmed.includes('10.0.') ||
      trimmed.includes('172.16')
    );
  };

  const attemptDataReconstruction = () => {
    console.log('[QR_SCANNER] Attempting data reconstruction from buffer:', Array.from(scanDataBuffer.current));

    // Try different combination strategies
    const bufferArray = Array.from(scanDataBuffer.current);

    // Strategy 1: Simple concatenation
    const concatenated = bufferArray.join('');
    if (isValidCompleteData(concatenated)) {
      console.log('[QR_SCANNER] Reconstruction successful via concatenation:', concatenated);
      return concatenated;
    }

    // Strategy 2: Look for JSON-like structure
    let jsonStart = -1;
    let jsonEnd = -1;

    for (let i = 0; i < bufferArray.length; i++) {
      const item = bufferArray[i];
      if (item.includes('{') && jsonStart === -1) {
        jsonStart = i;
      }
      if (item.includes('}')) {
        jsonEnd = i;
      }
    }

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
      const reconstructed = bufferArray.slice(jsonStart, jsonEnd + 1).join('');
      if (isValidCompleteData(reconstructed)) {
        console.log('[QR_SCANNER] Reconstruction successful via JSON detection:', reconstructed);
        return reconstructed;
      }
    }

    // Strategy 3: Try to find the longest meaningful piece
    const longest = bufferArray.reduce((a, b) => a.length > b.length ? a : b, '');
    if (longest.length > 10 && isPartialJsonData(longest)) {
      // Try to clean and validate the longest piece
      try {
        let cleaned = longest.trim();

        // Try to fix common issues
        if (!cleaned.startsWith('{') && cleaned.includes('{')) {
          cleaned = cleaned.substring(cleaned.indexOf('{'));
        }
        if (!cleaned.endsWith('}') && cleaned.includes('}')) {
          cleaned = cleaned.substring(0, cleaned.lastIndexOf('}') + 1);
        }

        if (isValidCompleteData(cleaned)) {
          console.log('[QR_SCANNER] Reconstruction successful via cleanup:', cleaned);
          return cleaned;
        }
      } catch (e) {
        console.log('[QR_SCANNER] Cleanup failed:', e);
      }
    }

    return null;
  };

  const handleBarCodeScanned = ({ type, data }) => {
    console.log('[QR_SCANNER] Scanned type:', type);
    console.log('[QR_SCANNER] Scanned data:', data);
    console.log('[QR_SCANNER] Data length:', data?.length);
    console.log('[QR_SCANNER] Scan attempts:', scanAttempts.current);

    // Prevent multiple scans
    const currentTime = Date.now();
    if (scanned || hasFiredScan.current || currentTime - lastScanTime.current < 200) {
      console.log('[QR_SCANNER] Scan blocked - too recent or already processed');
      return;
    }

    scanAttempts.current++;

    // Check if we have complete valid data immediately
    if (isValidCompleteData(data)) {
      console.log('[QR_SCANNER] Complete valid data detected immediately');
      processScannedData(data);
      return;
    }

    // For Android or partial data, use buffering approach
    if (isAndroid || isPartialJsonData(data) || data.length < 50) {
      console.log('[QR_SCANNER] Adding to buffer for reconstruction:', data);

      // Add to buffer (Set automatically handles duplicates)
      scanDataBuffer.current.add(data.trim());

      // Clear existing timeout
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }

      // Try reconstruction after collecting some data
      if (scanDataBuffer.current.size >= 2 || scanAttempts.current >= 3) {
        const reconstructed = attemptDataReconstruction();
        if (reconstructed) {
          processScannedData(reconstructed);
          return;
        }
      }

      // Set timeout for final attempt
      const timeoutDuration = scanAttempts.current < 5 ? 800 : 1500;
      scanTimeout.current = setTimeout(() => {
        console.log('[QR_SCANNER] Timeout reached, attempting final reconstruction');
        const finalResult = attemptDataReconstruction();

        if (finalResult) {
          processScannedData(finalResult);
        } else if (scanAttempts.current >= maxScanAttempts) {
          // Show help message for failed scans
          console.log('[QR_SCANNER] Max attempts reached, showing help');
          const bufferContent = Array.from(scanDataBuffer.current).join(', ');
          showScanHelpDialog(bufferContent);
        }
      }, timeoutDuration);

      return;
    }

    // Fallback for any other case
    console.log('[QR_SCANNER] Processing as-is (fallback)');
    processScannedData(data);
  };

  const showScanHelpDialog = (partialData) => {
    Alert.alert(
      'QR Scan Issues',
      `Having trouble reading the QR code completely.\n\nPartial data detected: "${partialData}"\n\nTips for better scanning:\n\n• Hold phone steady and closer to QR code\n• Ensure good lighting\n• Clean camera lens\n• Try portrait orientation\n• Make sure QR code fills most of the frame\n\nWould you like to try again?`,
      [
        {
          text: 'Try Again',
          onPress: () => {
            // Reset for new attempt
            scanDataBuffer.current.clear();
            scanAttempts.current = 0;
            setScanned(false);
            hasFiredScan.current = false;
          }
        },
        { text: 'Cancel', onPress: onClose, style: 'cancel' }
      ]
    );
  };

  const processScannedData = (data) => {
    if (!data || hasFiredScan.current) {
      return;
    }

    lastScanTime.current = Date.now();

    lastScanTime.current = Date.now();
    setScanned(true);
    hasFiredScan.current = true;

    console.log('[QR_SCANNER] Processing final data:', data);

    // Vibration feedback

    console.log('[QR_SCANNER] Processing final data:', data);

    // Vibration feedback
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
          barcodeTypes: ['qr'],
          barcodeTypes: ['qr'],
        }}
        enableTorch={flashEnabled}
        style={StyleSheet.absoluteFillObject}
        autoFocus="on"
        ratio="16:9"
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
            {isAndroid ? 'Hold steady - Android scanning...' : 'Position QR code within frame'}
          </Text>
          <Text style={tw`text-gray-400 text-sm text-center`}>
            Hold steady for complete scan
          </Text>
        </View>

        {scanned && (
          <View style={tw`mt-4 bg-green-600/80 rounded-full px-4 py-2 flex-row items-center`}>
            <MaterialCommunityIcons name="check-circle" size={20} color="white" />
            <Text style={tw`text-white text-sm ml-2`}>QR Code Detected!</Text>
          </View>
        )}

        {scanDataBuffer.current.size > 0 && !scanned && (
          <View style={tw`mt-4 bg-yellow-600/80 rounded-full px-4 py-2 flex-row items-center`}>
            <MaterialCommunityIcons name="progress-clock" size={20} color="white" />
            <Text style={tw`text-white text-sm ml-2`}>Reading QR code...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default QrScanner;