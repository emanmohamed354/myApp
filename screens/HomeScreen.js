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
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isCarPaired } = useAuth();
  const scrollViewRef = useRef();
  
  useEffect(() => {
    if (!sensorData || Object.keys(sensorData).length === 0) {
      setLoading(true);
    }
    
    if (isAuthenticated && isCarPaired) {
      fetchSensorData();
      const interval = setInterval(fetchSensorData, 2000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isCarPaired]);

  const fetchSensorData = async () => {
    try {
      const response = await api.get('/api/obd/live');

      if (response && typeof response === 'object') {
        setSensorData(response);
        processDataPoint(response, dataPoints.current, appStartTime.current);

        const healthResult = calculateCarHealth(response);
        setCarHealth(healthResult.health);
        setHealthFactors(healthResult.factors);
      } else {
        console.warn('Invalid sensor response format:', response);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error.message);

      // Optional: Silent handling of specific expected errors
      if (error.response?.status === 404 || error.response?.status === 401) {
        return;
      }

      // You can choose to suppress all errors silently for UX
      // return;

      // Or keep throwing for logging tools
      // throw error;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const onRefresh = () => {
    setRefreshing(true);
    fetchSensorData();
  };

  if (loading) {
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
        <CriticalSensorsSection sensorData={sensorData} />
        <SecondarySensorsSection sensorData={sensorData} />
        <VehicleHealthSection 
          carHealth={carHealth} 
          healthFactors={healthFactors} 
        />
        <PerformanceCharts chartData={chartData} />
      </ScrollView>
    </View>
  );
}