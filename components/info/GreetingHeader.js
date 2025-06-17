// components/info/GreetingHeader.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ImageBackground, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useAuth } from '../../contexts/AuthContext';
import carsBackground from '../../assets/images/cars.jpg';
import api from '../../services/api';

const GreetingHeader = () => {
  const insets = useSafeAreaInsets();
  const [greeting, setGreeting] = useState('');
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { localToken, userInfo, isCarPaired, checkPairingStatus } = useAuth();
  
  // Track previous values
  const prevTokenRef = useRef(localToken);
  const prevPairingRef = useRef(isCarPaired);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Good Afternoon';
      return 'Good Evening';
    };
    setGreeting(getGreeting());

    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if values actually changed
    const tokenChanged = prevTokenRef.current !== localToken;
    const pairingChanged = prevPairingRef.current !== isCarPaired;
    
    // Update refs
    prevTokenRef.current = localToken;
    prevPairingRef.current = isCarPaired;

    if (localToken && isCarPaired) {
      // Only fetch if it's the first load or something changed
      if (!hasLoadedRef.current || tokenChanged || pairingChanged) {
        fetchCarData();
        hasLoadedRef.current = true;
      }
    } else {
      setLoading(false);
      setCarData(null);
      hasLoadedRef.current = false;
    }
  }, [localToken, isCarPaired]);

  const fetchCarData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/obd/profile');
      console.log('Car data response in header:', response);

      const data = response.data || response;
      
      if (data) {
        setCarData(data);
      }
    } catch (error) {
      console.error('Error fetching car data in header:', error);
      setCarData(null);
    } finally {
      setLoading(false);
    }
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'weather-night';
    if (hour < 12) return 'weather-sunset-up';
    if (hour < 18) return 'weather-sunny';
    if (hour < 20) return 'weather-sunset-down';
    return 'weather-night';
  };

  const getDisplayName = () => {
    if (userInfo?.firstName && userInfo?.lastName) {
      return `${userInfo.firstName} ${userInfo.lastName}`;
    }
    return userInfo?.username || 'Guest';
  };

  return (
    <View style={{ height: 320 }}>
      <ImageBackground
        source={carsBackground}
        style={tw`w-full h-full`}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.8)',
            'rgba(0,0,0,0.7)',
            'rgba(0,0,0,0.5)',
            'rgba(17,24,39,0.9)'
          ]}
          style={[tw`flex-1`, { paddingTop: insets.top }]}
        >
          <View style={tw`flex-1 px-4 py-6`}>
            {/* Top Section with Time Icon */}
            <View style={tw`flex-row items-center mb-4`}>
              <MaterialCommunityIcons
                name={getTimeIcon()}
                size={24}
                color="#FCD34D"
                style={tw`mr-2`}
              />
              <Text style={tw`text-gray-300 text-sm`}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>

            {/* Greeting Section */}
            <View style={tw`flex-1`}>
              <Text style={tw`text-white text-3xl font-bold mb-1`}>
                {greeting},
              </Text>
              <View style={tw`flex-row items-center mb-4`}>
                <MaterialCommunityIcons 
                  name="account-circle" 
                  size={20} 
                  color="#60A5FA" 
                  style={tw`mr-2`}
                />
                <Text style={tw`text-white text-2xl font-medium`}>
                  {getDisplayName()}
                </Text>
              </View>
              
              {/* Car Info Section */}
              <View style={tw`bg-gray-800/50 rounded-xl p-4 mt-2`}>
                {loading ? (
                  <View style={tw`flex-row items-center`}>
                    <ActivityIndicator size="small" color="#60A5FA" />
                    <Text style={tw`text-gray-400 ml-3`}>Loading vehicle info...</Text>
                  </View>
                ) : isCarPaired && carData && carData.id ? (
                  <View>
                    <View style={tw`flex-row items-center mb-2`}>
                      <MaterialCommunityIcons 
                        name="car-connected" 
                        size={20} 
                        color="#10B981" 
                        style={tw`mr-2`}
                      />
                      <Text style={tw`text-green-400 text-sm font-medium`}>
                        Connected Vehicle
                      </Text>
                    </View>
                    <View style={tw`flex-row items-center justify-between`}>
                      <View style={tw`flex-1`}>
                        <Text style={tw`text-white text-lg font-semibold`}>
                          {carData.year ? `${carData.year} ` : ''}
                          {carData.make || 'Unknown Make'} {carData.model || ''}
                        </Text>
                        {(carData.trim || carData.color) && (
                          <Text style={tw`text-gray-400 text-sm`}>
                            {carData.trim || ''}{carData.trim && carData.color ? ' • ' : ''}{carData.color || ''}
                          </Text>
                        )}
                      </View>
                      {carData.fuelType && (
                        <View style={tw`bg-blue-500/20 rounded-lg px-3 py-1`}>
                          <Text style={tw`text-blue-400 text-xs font-medium`}>
                            {carData.fuelType}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : isCarPaired ? (
                  <View style={tw`flex-row items-center`}>
                    <MaterialCommunityIcons 
                      name="car-off" 
                      size={24} 
                      color="#EF4444" 
                      style={tw`mr-3`}
                    />
                    <View>
                      <Text style={tw`text-gray-300 font-medium`}>
                        OBD-II Not Connected
                      </Text>
                      <Text style={tw`text-gray-500 text-sm`}>
                        Please connect your OBD-II device
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={tw`flex-row items-center`}>
                    <MaterialCommunityIcons 
                      name="car" 
                      size={24} 
                      color="#60A5FA" 
                      style={tw`mr-3`}
                    />
                    <View>
                      <Text style={tw`text-gray-300 font-medium`}>
                        No Vehicle Paired
                      </Text>
                      <Text style={tw`text-gray-500 text-sm`}>
                        Pair a vehicle to get started
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default GreetingHeader;