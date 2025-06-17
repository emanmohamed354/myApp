// screens/EmergencyScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import tw from 'twrnc';
import * as Location from 'expo-location';

export default function EmergencyScreen({ route, navigation }) {
  const { crashData } = route.params || {};
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (!crashData) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    const location = await Location.getCurrentPositionAsync({});
    setCurrentLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const makeEmergencyCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  const shareLocation = async () => {
    const location = crashData?.location || currentLocation;
    if (!location) return;

    await Share.share({
      message: `Emergency! I need help at: https://maps.google.com/?q=${location.latitude},${location.longitude}`,
    });
  };

  const location = crashData?.location || currentLocation;

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.1)']}
        style={tw`pt-12 pb-4 px-4`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-xl font-bold`}>Emergency</Text>
          <View style={tw`w-6`} />
        </View>
      </LinearGradient>

      <ScrollView>
        {/* Emergency Buttons */}
        <View style={tw`p-4`}>
          <View style={tw`bg-red-600 rounded-2xl p-6 mb-4`}>
            <Text style={tw`text-white text-2xl font-bold text-center mb-4`}>
              Emergency Services
            </Text>
            
            <TouchableOpacity
              onPress={() => makeEmergencyCall('911')}
              style={tw`bg-white rounded-xl p-4 mb-3 flex-row items-center justify-center`}
            >
              <MaterialCommunityIcons name="phone-alert" size={24} color="#DC2626" />
              <Text style={tw`text-red-600 text-lg font-bold ml-2`}>Call 911</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={shareLocation}
              style={tw`bg-red-700 rounded-xl p-4 flex-row items-center justify-center`}
            >
              <MaterialCommunityIcons name="share-variant" size={24} color="white" />
              <Text style={tw`text-white text-lg font-bold ml-2`}>Share Location</Text>
            </TouchableOpacity>
          </View>

          {/* Crash Details */}
          {crashData && (
            <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
              <Text style={tw`text-white text-lg font-bold mb-3`}>Crash Details</Text>
              
              <View style={tw`mb-2`}>
                <Text style={tw`text-gray-400 text-sm`}>Time</Text>
                <Text style={tw`text-white`}>
                  {new Date(crashData.timestamp).toLocaleString()}
                </Text>
              </View>
              
              <View style={tw`mb-2`}>
                <Text style={tw`text-gray-400 text-sm`}>Impact Force</Text>
                <Text style={tw`text-white`}>{crashData.force.toFixed(2)}G</Text>
              </View>
              
              <View style={tw`mb-2`}>
                <Text style={tw`text-gray-400 text-sm`}>Location</Text>
                <Text style={tw`text-white`}>{crashData.location.address}</Text>
              </View>
            </View>
          )}

          {/* Map */}
          {location && (
            <View style={tw`bg-gray-800 rounded-xl overflow-hidden mb-4 h-64`}>
              <MapView
                style={tw`flex-1`}
                initialRegion={{
                  ...location,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={location} title="Emergency Location">
                  <View style={tw`bg-red-600 p-3 rounded-full`}>
                    <MaterialCommunityIcons name="alert" size={24} color="white" />
                  </View>
                </Marker>
              </MapView>
            </View>
          )}

          {/* Emergency Contacts */}
          <View style={tw`bg-gray-800 rounded-xl p-4 mb-4`}>
            <Text style={tw`text-white text-lg font-bold mb-3`}>Emergency Contacts</Text>
            
            <TouchableOpacity
              style={tw`flex-row items-center justify-between py-3 border-b border-gray-700`}
              onPress={() => makeEmergencyCall('1234567890')}
            >
              <View style={tw`flex-row items-center`}>
                <MaterialCommunityIcons name="account-heart" size={24} color="#60A5FA" />
                <View style={tw`ml-3`}>
                  <Text style={tw`text-white font-medium`}>John Doe</Text>
                  <Text style={tw`text-gray-400 text-sm`}>Spouse</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="phone" size={24} color="#10B981" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={tw`flex-row items-center justify-between py-3`}
              onPress={() => navigation.navigate('Profile', { section: 'emergency' })}
            >
              <Text style={tw`text-blue-400`}>Manage Emergency Contacts</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#60A5FA" />
            </TouchableOpacity>
          </View>

          {/* Safety Tips */}
          <View style={tw`bg-gray-800 rounded-xl p-4`}>
            <Text style={tw`text-white text-lg font-bold mb-3`}>Safety Tips</Text>
            
            {[
              'Move to a safe location if possible',
              'Turn on hazard lights',
              'Check for injuries',
              'Document the scene with photos',
              'Exchange information with other parties',
              'Wait for emergency services',
            ].map((tip, index) => (
              <View key={index} style={tw`flex-row items-start mb-2`}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color="#10B981" 
                  style={tw`mt-0.5`}
                />
                <Text style={tw`text-gray-300 ml-2 flex-1`}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}