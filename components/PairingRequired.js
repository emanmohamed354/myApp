// components/PairingRequired.js
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';

const PairingRequired = ({ feature = 'this feature' }) => {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.1)', 'transparent']}
        style={tw`flex-1 justify-center items-center p-6`}
      >
        <View style={tw`bg-gray-800 rounded-3xl p-8 items-center max-w-sm w-full`}>
          <View style={tw`w-20 h-20 bg-blue-500/20 rounded-full items-center justify-center mb-6`}>
            <MaterialCommunityIcons name="car-connected" size={40} color="#60A5FA" />
          </View>
          
          <Text style={tw`text-white text-2xl font-bold text-center mb-3`}>
            Vehicle Pairing Required
          </Text>
          
          <Text style={tw`text-gray-400 text-center mb-6`}>
            To access {feature}, you need to pair your vehicle with the app first.
          </Text>
          
          <TouchableOpacity
            style={tw`bg-blue-600 rounded-xl px-6 py-3 mb-4 w-full`}
            onPress={() => navigation.navigate('CarPairing')}
          >
            <Text style={tw`text-white text-center font-semibold`}>
              Pair Vehicle Now
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={tw`text-gray-500 text-sm`}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default PairingRequired;