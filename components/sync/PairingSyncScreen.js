// screens/PairingSyncScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import { syncService } from '../services/syncService';
import api from '../services/api';

// Import components
import SensorReadingCard from '../components/sync/SensorReadingCard';
import DiagnosticCard from '../components/sync/DiagnosticCard';
import SyncSummaryCard from '../components/sync/SyncSummaryCard';
import EmptySyncState from '../components/sync/EmptySyncState';
import SyncHeader from '../components/sync/SyncHeader';
import SyncInfoCard from '../components/sync/SyncInfoCard';
import SyncActionButtons from '../components/sync/SyncActionButtons';

export default function PairingSyncScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { remoteToken } = useAuth();
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  
  const carPayload = route.params?.carPayload || {};
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    loadSyncData();
  }, []);

  const loadSyncData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const localData = await syncService.getLocalSyncData();
      
      if (localData) {
        setSyncData(localData);
      } else {
        await performSync();
      }
    } catch (err) {
      console.error('Error loading sync data:', err);
      setError('Failed to load sync data');
    } finally {
      setLoading(false);
    }
  };

  const performSync = async () => {
    if (!remoteToken) {
      setError('Not authenticated. Please login first.');
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const response = await api.post('/api/sync', {
        readings: [],
        diagnostics: [],
        events: []
      });
      
      if (response) {
        setSyncData(response);
        await syncService.saveLocalSyncData(response);
        
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${response.readings?.length || 0} sensor readings and ${response.diagnostics?.length || 0} diagnostics.`
        );
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync data. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate('CarPairing', { 
      syncData: syncData,
      carPayload: carPayload 
    });
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Sync?',
      'You can sync your data later from the Logs screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => navigation.navigate('CarPairing', { carPayload })
        }
      ]
    );
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={performSync} />;
    }

    if (!syncData || (!syncData.readings?.length && !syncData.diagnostics?.length)) {
      return <EmptySyncState onSync={performSync} syncing={syncing} />;
    }

    return (
      <>
        <SyncSummaryCard 
          syncData={syncData} 
          fadeAnim={fadeAnim}
          pulseAnim={pulseAnim}
        />

        {syncData.readings && syncData.readings.length > 0 && (
          <SensorReadingsSection readings={syncData.readings} fadeAnim={fadeAnim} />
        )}

        {syncData.diagnostics && syncData.diagnostics.length > 0 && (
          <DiagnosticsSection diagnostics={syncData.diagnostics} fadeAnim={fadeAnim} />
        )}
      </>
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      
      <SyncHeader 
        insets={insets}
        onBack={() => navigation.goBack()}
        onSkip={handleSkip}
      />

      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`px-6 py-6`}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <SyncInfoCard />
          {renderContent()}
        </Animated.View>
      </ScrollView>

      {!loading && !error && syncData && (
        <SyncActionButtons
          onContinue={handleContinue}
          onSync={performSync}
          syncing={syncing}
        />
      )}
    </View>
  );
}