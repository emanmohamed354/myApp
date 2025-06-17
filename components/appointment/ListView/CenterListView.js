// components/appointment/ListView/CenterListView.js
import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import CenterCard from './CenterCard';

export default function CenterListView({ centers, onCenterSelect, onBookPress, onDirectionsPress }) {
  return (
    <FlatList
      data={centers}
      renderItem={({ item }) => (
        <CenterCard
          center={item}
          onPress={() => onCenterSelect(item)}
          onBookPress={() => onBookPress(item)}
          onDirectionsPress={() => onDirectionsPress(item)}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={tw`p-4`}
      ListEmptyComponent={
        <View style={tw`flex-1 justify-center items-center py-20`}>
          <MaterialIcons name="car-repair" size={64} color="#4B5563" />
          <Text style={tw`text-gray-400 mt-4 text-center`}>
            No car maintenance centers found nearby.{'\n'}
            Try refreshing your location.
          </Text>
        </View>
      }
    />
  );
}