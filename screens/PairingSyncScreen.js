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
import LoadingState from '../components/sync/LoadingState';
import ErrorState from '../components/sync/ErrorState';
import SensorReadingsSection from '../components/sync/SensorReadingsSection';
import DiagnosticsSection from '../components/sync/DiagnosticsSection';

export default function PairingSyncScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { remoteToken, localToken, isCarPaired } = useAuth();
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
      
      // First, try to get locally stored sync data
      const localData = await syncService.getLocalSyncData();
      
      if (localData && (localData.readings?.length > 0 || localData.diagnostics?.length > 0)) {
        setSyncData(localData);
      } else if (isCarPaired && localToken) {
        // If paired and no local data, try to fetch from local API
        try {
          const freshData = await syncService.getLocalSyncDataFromAPI();
          if (freshData) {
            setSyncData(freshData);
          }
        } catch (err) {
          console.log('Could not fetch from local API:', err);
          // Don't set error, just continue without data
        }
      }
      // If not paired, just show empty state instead of trying to sync
    } catch (err) {
      // Don't set error for loading issues
    } finally {
      setLoading(false);
    }
  };

  const performSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      let response;
      
      if (isCarPaired && localToken) {
        // If paired, get sync data from local API
        console.log('Getting sync data from local API...');
        response = await syncService.getLocalSyncDataFromAPI();
      } else if (remoteToken) {
        // If not paired but authenticated, try to sync any stored data to remote
        const storedData = await syncService.getLocalSyncData();
        
        if (storedData && (storedData.readings?.length > 0 || storedData.diagnostics?.length > 0)) {
          console.log('Syncing stored data to remote API...');
          response = await syncService.syncToRemote();
          
          // After successful remote sync, clear local data
          await syncService.clearSyncData();
          
          Alert.alert(
            'Sync Complete',
            'Your stored vehicle data has been synced to the cloud.'
          );
        } else {
          Alert.alert(
            'No Data to Sync',
            'There is no vehicle data to sync. Pair your vehicle first to collect data.'
          );
          return;
        }
      } else {
        setError('Not authenticated. Please login first.');
        return;
      }
      
      if (response) {
        setSyncData(response);
        await syncService.saveLocalSyncData(response);
      }
    } catch (err) {
      setError('Failed to sync data. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleContinue = () => {
    navigation.replace('CarPairing', { 
      syncData: syncData,
      carPayload: carPayload,
      fromSync: true
    });
  };
    const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Navigate to home if can't go back (e.g., opened from footer)
      navigation.navigate('Home');
    }
  };
  const handleSkip = () => {
    if (isCarPaired) {
      // If already paired, just go back
      handleBack();
    } else {
      // If not paired, navigate to car pairing
      navigation.navigate('CarPairing', { carPayload });
    }
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
        onBack={handleBack}
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

      {!loading && !error && (
        <SyncActionButtons
          onContinue={handleContinue}
          onSync={performSync}
          syncing={syncing}
          showContinue={!isCarPaired} // Only show continue when not paired
        />
      )}
    </View>
  );
}