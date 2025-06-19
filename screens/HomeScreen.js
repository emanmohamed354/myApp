// screens/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, Text, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import CriticalSensorsSection from '../components/home/CriticalSensorsSection';
import SecondarySensorsSection from '../components/home/SecondarySensorsSection';
import VehicleHealthSection from '../components/home/VehicleHealthSection';
import PerformanceCharts from '../components/home/PerformanceCharts';
import { useAuth } from '../contexts/AuthContext';
import { useSensorData } from '../contexts/SensorDataContext';
import { calculateCarHealth } from '../utils/healthCalculations';
import { processDataPoint, getChartData } from '../utils/dataProcessing';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    sensorData,
    setSensorData,
    carHealth,
    setCarHealth,
    healthFactors,
    setHealthFactors,
    appStartTime,
    dataPoints
  } = useSensorData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { isAuthenticated, isCarPaired } = useAuth();
  const scrollViewRef = useRef();
  const fetchIntervalRef = useRef(null);
  
  useEffect(() => {
    // Initialize on first load
    if (!hasInitialized) {
      setHasInitialized(true);
      setLoading(true);
    }
    
    // Clear any existing interval
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
      fetchIntervalRef.current = null;
    }
    
    if (isAuthenticated && isCarPaired) {
      // Initial fetch
      fetchSensorData();
      
      // Set up interval
      fetchIntervalRef.current = setInterval(fetchSensorData, 2000);
      
      return () => {
        if (fetchIntervalRef.current) {
          clearInterval(fetchIntervalRef.current);
          fetchIntervalRef.current = null;
        }
      };
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isCarPaired]);

  const fetchSensorData = async () => {
    try {
      const response = await api.get('/api/obd/live');

      // Validate response
      if (response && typeof response === 'object') {
        // Update sensor data
        setSensorData(response);
        
        // Process data point for charts
        if (dataPoints.current && appStartTime.current) {
          processDataPoint(response, dataPoints.current, appStartTime.current);
        }

        // Calculate health
        const healthResult = calculateCarHealth(response);
        if (healthResult) {
          setCarHealth(healthResult.health || 0);
          setHealthFactors(healthResult.factors || {});
        }
      } else {
        console.warn('Invalid sensor response format:', response);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error.message);
      
      // Don't set empty data on error - keep last known good data
      // Only log the error, don't disrupt the UI
    } finally {
      // Only set loading to false on first load
      if (loading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSensorData();
  };

  if (loading && !hasInitialized) {
    return (
      <View style={tw`flex-1 bg-gray-900 justify-center items-center`}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={tw`text-gray-400 mt-4`}>Connecting to vehicle...</Text>
      </View>
    );
  }

  // Show simplified home when car is not paired
  if (!isCarPaired) {
    return (
      <View style={tw`flex-1 bg-gray-900`}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <ScrollView
          contentContainerStyle={tw`flex-grow-1 p-6`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`flex-1 justify-center items-center`}>
            <View style={tw`bg-gray-800 rounded-3xl p-8 items-center max-w-sm w-full`}>
              <View style={tw`w-24 h-24 bg-blue-500/20 rounded-full items-center justify-center mb-6`}>
                <MaterialCommunityIcons name="car-side" size={48} color="#60A5FA" />
              </View>
              
              <Text style={tw`text-white text-2xl font-bold text-center mb-3`}>
                Welcome to CarDiagnostics
              </Text>
              
              <Text style={tw`text-gray-400 text-center mb-6`}>
                Pair your vehicle to start monitoring its health and performance in real-time.
              </Text>
              
              <TouchableOpacity
                style={tw`bg-blue-600 rounded-xl px-6 py-3 w-full mb-4`}
                onPress={() => navigation.navigate('CarPairing')}
              >
                <Text style={tw`text-white text-center font-semibold`}>
                  Pair Your Vehicle
                </Text>
              </TouchableOpacity>
              
              <Text style={tw`text-gray-500 text-sm text-center`}>
                You can explore Settings and Profile without pairing
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Get chart data
  const chartData = getChartData(dataPoints.current, appStartTime.current);

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        <CriticalSensorsSection sensorData={sensorData || {}} />
        <SecondarySensorsSection sensorData={sensorData || {}} />
        <VehicleHealthSection 
          carHealth={carHealth || 0} 
          healthFactors={healthFactors || {}} 
        />
        <PerformanceCharts chartData={chartData || { labels: [], rpm: [], speed: [], temp: [] }} />
      </ScrollView>
    </View>
  );
}