// screens/InfoScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Import components
import GreetingHeader from '../components/info/GreetingHeader';
import VehicleInfoHeader from '../components/info/VehicleInfoHeader';
import LoadingCard from '../components/info/LoadingCard';
import EmptyCard from '../components/info/EmptyCard';
import BasicInformationCard from '../components/info/BasicInformationCard';
import TechnicalDetailsCard from '../components/info/TechnicalDetailsCard';
import ConnectionStatusCard from '../components/info/ConnectionStatusCard';
import ServiceHistoryCard from '../components/info/ServiceHistoryCard';
import SupportedSensorsCard from '../components/info/SupportedSensorsCard';

export default function InfoScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, isCarPaired, localToken, checkPairingStatus } = useAuth();
  
  // Track previous values to prevent unnecessary fetches
  const prevTokenRef = useRef(localToken);
  const prevPairingRef = useRef(isCarPaired);
  const hasInitialLoadRef = useRef(false);

  // Focus effect - only check pairing status, don't refetch data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only check pairing status, don't fetch data
      checkPairingStatus();
    });

    return unsubscribe;
  }, [navigation]);

  // Main effect to load data when dependencies actually change
  useEffect(() => {
    // Check if token or pairing status actually changed
    const tokenChanged = prevTokenRef.current !== localToken;
    const pairingChanged = prevPairingRef.current !== isCarPaired;
    
    // Update refs
    prevTokenRef.current = localToken;
    prevPairingRef.current = isCarPaired;

    // Only fetch if:
    // 1. First load (hasn't loaded yet)
    // 2. Token changed
    // 3. Pairing status changed
    // 4. AND we're authenticated and paired
    if (isAuthenticated && isCarPaired && localToken) {
      if (!hasInitialLoadRef.current || tokenChanged || pairingChanged) {
        fetchCarData();
        hasInitialLoadRef.current = true;
      }
    } else {
      // If not paired or not authenticated, clear data
      setCarData(null);
      setLoading(false);
      hasInitialLoadRef.current = false;
    }
  }, [isAuthenticated, isCarPaired, localToken]);

  const fetchCarData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/obd/profile');
      console.log('Fetched car data:', response);
      setCarData(response);
    } catch (error) {
      console.error('Error fetching car data:', error);
      setCarData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (isAuthenticated && isCarPaired && localToken) {
      setRefreshing(true);
      checkPairingStatus();
      fetchCarData();
    }
  };

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#60A5FA"
            colors={['#60A5FA']}
          />
        }
      >
        {/* Greeting Header extends to edges */}
        <GreetingHeader />
        
        <View style={tw`px-4 py-6`}>
          {/* Page Title with Icon */}
          <VehicleInfoHeader />
          
          {!isCarPaired ? (
            <View style={tw`bg-gray-800 rounded-xl p-6 items-center`}>
              <MaterialCommunityIcons name="car-connected" size={48} color="#60A5FA" style={tw`mb-4`} />
              <Text style={tw`text-white text-lg font-bold mb-2`}>No Vehicle Paired</Text>
              <Text style={tw`text-gray-400 text-center mb-4`}>
                Pair your vehicle to see detailed information
              </Text>
              <TouchableOpacity
                style={tw`bg-blue-600 rounded-xl px-6 py-3`}
                onPress={() => navigation.navigate('CarPairing')}
              >
                <Text style={tw`text-white font-semibold`}>Pair Vehicle</Text>
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <LoadingCard />
          ) : carData ? (
            <>
              <BasicInformationCard carData={carData} />
              <TechnicalDetailsCard carData={carData} />
              <ServiceHistoryCard carData={carData} />
              <SupportedSensorsCard carData={carData} />
            </>
          ) : (
            <EmptyCard />
          )}

          {/* Additional Info Section */}
          {carData && (
            <View style={tw`mt-1`}>
              <ConnectionStatusCard />
              <Text style={tw`text-gray-400 text-xs text-center mt-2`}>
                Last updated: {new Date().toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}