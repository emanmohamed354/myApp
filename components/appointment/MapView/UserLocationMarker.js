// components/appointment/MapView/UserLocationMarker.js
import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function UserLocationMarker({ coordinate }) {
  return (
    <Marker
      coordinate={coordinate}
      title="Your Location"
    >
      <View style={tw`bg-blue-500 p-2 rounded-full border-2 border-white shadow-lg`}>
        <Ionicons name="person" size={20} color="white" />
      </View>
    </Marker>
  );
}