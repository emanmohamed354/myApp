import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function CentersList({ centers, onSelectCenter, onCall, onNavigate }) {
  const renderCenter = ({ item }) => (
    <TouchableOpacity
      style={tw`bg-white rounded-lg shadow-sm mb-3 p-4`}
      onPress={() => onSelectCenter(item)}
    >
      <View style={tw`flex-row`}>
        <View style={tw`bg-blue-100 p-3 rounded-lg mr-3`}>
          <MaterialIcons name="car-repair" size={24} color="#3B82F6" />
        </View>
        
        <View style={tw`flex-1`}>
          <Text style={tw`text-lg font-semibold text-gray-800`}>
            {item.name}
          </Text>
          <Text style={tw`text-gray-600 mt-1`}>{item.address}</Text>
          
          <View style={tw`flex-row items-center mt-2`}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={tw`ml-1 text-sm text-gray-700`}>{item.rating}</Text>
            <Text style={tw`ml-3 text-sm text-gray-700`}>{item.distance}</Text>
          </View>
          
          <View style={tw`flex-row flex-wrap mt-2`}>
            {item.services.slice(0, 2).map((service, index) => (
              <View key={index} style={tw`bg-gray-100 px-2 py-1 rounded mr-2 mb-1`}>
                <Text style={tw`text-xs text-gray-600`}>{service}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={tw`ml-3`}>
          <TouchableOpacity
            style={tw`bg-gray-100 p-2 rounded-lg mb-2`}
            onPress={() => onCall(item.phone)}
          >
            <Ionicons name="call" size={18} color="#374151" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`bg-gray-100 p-2 rounded-lg`}
            onPress={() => onNavigate(item)}
          >
            <Ionicons name="navigate" size={18} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={centers}
      renderItem={renderCenter}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={tw`p-4`}
    />
  );
}