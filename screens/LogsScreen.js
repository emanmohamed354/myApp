import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Alert,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { logsApi } from '../services/logsApi';
import { syncService } from '../services/syncService';
import { useAuth } from '../contexts/AuthContext';

// Import components
import AnimatedHeader from '../components/logs/AnimatedHeader';
import TabSelector from '../components/logs/TabSelector';
import DiagnosticLog from '../components/logs/DiagnosticLog';
import EventLog from '../components/logs/EventLog';
import SyncData from '../components/logs/SyncData';
import EmptyState from '../components/logs/EmptyState';
import LoadingState from '../components/logs/LoadingState';
import ErrorState from '../components/logs/ErrorState';
import DiagnosticSummary from '../components/logs/DiagnosticSummary';
import EventSummary from '../components/logs/EventSummary';
import { useItemAnimation } from '../components/logs/utils/animations';

export default function LogsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isCarPaired } = useAuth();
  const [activeTab, setActiveTab] = useState('diagnostic');
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [syncData, setSyncData] = useState({ readings: [], diagnostics: [], events: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [error, setError] = useState(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const { itemAnimations, animateItems } = useItemAnimation();

  useEffect(() => {
    // Initial animations
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

    // Start rotating animation for sync icon
    Animated.loop(
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    if (isCarPaired) {
      loadLogs();
      loadSyncData();
      updateLastSyncTime();
    }
  }, [isCarPaired]);

  const updateLastSyncTime = async () => {
    const time = await syncService.getLastSyncTime();
    setLastSyncTime(time);
  };
  const handleSync = async () => {
    if (isSyncing || !isCarPaired) return;
    
    setIsSyncing(true);
    setError(null);
    
    try {
      // Get fresh data from local API when paired
      const syncData = await syncService.getLocalSyncDataFromAPI();
      
      if (syncData) {
        // Update the sync data state
        setSyncData(syncData);
        
        // Process and store the synced data
        if (syncData.readings && syncData.readings.length > 0) {
          const criticalReadings = syncData.readings.filter(reading => 
            Object.values(reading.readings).some(sensor => sensor.severity === 'critical')
          );
          
          console.log(`Found ${criticalReadings.length} critical readings`);
        }
        
        if (syncData.diagnostics && syncData.diagnostics.length > 0) {
          // Update diagnostic logs with new data
          const newDiagnosticLogs = syncData.diagnostics.map(diagnostic => ({
            id: diagnostic.id,
            timestamp: diagnostic.timestamp,
            code: diagnostic.code,
            description: diagnostic.description,
            status: diagnostic.status,
            severity: diagnostic.severity,
            occurrenceCount: diagnostic.occurrenceCount,
            lastOccurrence: diagnostic.lastOccurrence,
            clearedAt: diagnostic.clearedAt,
            synced: true
          }));
          
          setDiagnosticLogs(prevLogs => {
            // Merge new logs with existing ones, avoiding duplicates
            const existingIds = new Set(prevLogs.map(log => log.id));
            const uniqueNewLogs = newDiagnosticLogs.filter(log => !existingIds.has(log.id));
            return [...uniqueNewLogs, ...prevLogs];
          });
        }
        
        if (syncData.events && syncData.events.length > 0) {
          // Update event logs with new data
          const newEventLogs = syncData.events.map(event => ({
            id: event.id,
            timestamp: event.timestamp,
            type: event.type,
            description: event.description,
            severity: event.severity,
            data: event.data,
            synced: true
          }));
          
          setEventLogs(prevLogs => {
            const existingIds = new Set(prevLogs.map(log => log.id));
            const uniqueNewLogs = newEventLogs.filter(log => !existingIds.has(log.id));
            return [...uniqueNewLogs, ...prevLogs];
          });
        }
        
        // Update last sync time
        await updateLastSyncTime();
        
        // Animate new items
        animateItems(syncData.diagnostics || syncData.events || []);
        
        Alert.alert(
          'Sync Complete',
          `Synced ${syncData.readings?.length || 0} sensor readings, ${syncData.diagnostics?.length || 0} diagnostics, and ${syncData.events?.length || 0} events.`
        );
      }
    } catch (err) {
      setError('Failed to sync data');
      Alert.alert('Sync Error', 'Failed to sync data. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };
  const performSync = async () => {
    if (isCarPaired) {
      // If paired, use local API sync
      await handleSync();
    } else {
      // If not paired, this shouldn't happen as the screen requires pairing
      Alert.alert('Error', 'Vehicle must be paired to sync data');
    }
  };

  const loadSyncData = async () => {
    try {
      const localData = await syncService.getLocalSyncData();
      setSyncData(localData || { readings: [], diagnostics: [], events: [] });
    } catch (error) {
      setSyncData({ readings: [], diagnostics: [], events: [] });
    }
  };

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [diagnosticResponse, eventsResponse] = await Promise.all([
        logsApi.getDiagnosticLogs(),
        logsApi.getEventLogs()
      ]);
      
      // Ensure we're working with arrays
      const diagnosticData = Array.isArray(diagnosticResponse) ? diagnosticResponse : [];
      const eventsData = Array.isArray(eventsResponse) ? eventsResponse : [];
      
      setDiagnosticLogs(diagnosticData);
      setEventLogs(eventsData);
      
      // Animate items in
      animateItems(activeTab === 'diagnostic' ? diagnosticData : activeTab === 'events' ? eventsData : []);
    } catch (err) {
      setError('Failed to load logs');
      setDiagnosticLogs([]);
      setEventLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCode = async (log) => {
    try {
      await logsApi.clearDiagnosticCode(log.id);
      await loadLogs();
      Alert.alert('Success', 'Diagnostic code cleared successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear diagnostic code');
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'sync') {
      handleSync(); // Use handleSync instead of performSync
    } else {
      loadLogs();
    }
  };

  if (!isCarPaired) {
    return (
      <View style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
          style={{ paddingTop: insets.top }}
        >
          <View style={tw`px-4 py-4`}>
            <Text style={tw`text-white text-xl font-bold`}>Vehicle Logs</Text>
          </View>
        </LinearGradient>
        
        <View style={tw`flex-1 items-center justify-center`}>
          <MaterialCommunityIcons name="car-off" size={60} color="#4B5563" />
          <Text style={tw`text-gray-400 text-lg mt-4`}>No vehicle paired</Text>
          <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>
            Pair your vehicle to view diagnostic logs and events
          </Text>
        </View>
      </View>
    );
  }

  const renderContent = () => {
    if (isLoading && diagnosticLogs.length === 0 && eventLogs.length === 0) {
      return <LoadingState activeTab={activeTab} />;
    }

    if (error && activeTab !== 'sync') {
      return <ErrorState error={error} activeTab={activeTab} onRetry={loadLogs} />;
    }

    switch (activeTab) {
      case 'diagnostic':
        const safeDiagnosticLogs = Array.isArray(diagnosticLogs) ? diagnosticLogs : [];
        if (safeDiagnosticLogs.length === 0) {
          return <EmptyState type="diagnostic" />;
        }
        return (
          <>
            {safeDiagnosticLogs.map((log, index) => (
              <DiagnosticLog
                key={log.id}
                log={log}
                index={index}
                itemAnimation={itemAnimations[index]}
                fadeAnim={fadeAnim}
                onClearCode={handleClearCode}
              />
            ))}
            <DiagnosticSummary diagnosticLogs={safeDiagnosticLogs} />
          </>
        );

      case 'events':
        const safeEventLogs = Array.isArray(eventLogs) ? eventLogs : [];
        if (safeEventLogs.length === 0) {
          return <EmptyState type="events" />;
        }
        return (
          <>
            <EventSummary eventLogs={safeEventLogs} />
            {safeEventLogs.map((log, index) => (
              <EventLog
                key={log.id}
                log={log}
                index={index}
                itemAnimation={itemAnimations[index]}
                fadeAnim={fadeAnim}
              />
            ))}
          </>
        );

      case 'sync':
        return (
          <SyncData
            syncData={syncData}
            lastSyncTime={lastSyncTime}
            isSyncing={isSyncing}
            onSync={handleSync}
            iconRotateAnim={iconRotateAnim}
            itemAnimations={itemAnimations}
            fadeAnim={fadeAnim}
            onClearCode={handleClearCode}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <AnimatedHeader
        insets={insets}
        activeTab={activeTab}
        diagnosticLogs={diagnosticLogs}
        lastSyncTime={lastSyncTime}
        isLoading={isLoading}
        isSyncing={isSyncing}
        onRefresh={handleRefresh}
        fadeAnim={fadeAnim}
      />

      <TabSelector
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />

      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            tw`px-4 pb-4`,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {renderContent()}
        </Animated.View>
      </ScrollView>
    </View>
  );
}