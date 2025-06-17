// components/appointment/MapView/CenterMarker.js
import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function CenterMarker({ center, isSelected, onPress }) {
  return (
    <Marker
      coordinate={center.coordinate}
      onPress={onPress}
      title={center.name}
      description={center.address}
    >
      <View style={tw`${isSelected ? 'bg-blue-500' : 'bg-red-500'} p-2 rounded-full shadow-lg`}>
        <MaterialIcons name="car-repair" size={20} color="white" />
      </View>
    </Marker>
  );
}