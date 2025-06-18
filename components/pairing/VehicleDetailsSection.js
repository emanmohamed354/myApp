import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import InfoRow from './InfoRow';

const VehicleDetailsSection = ({ carData, onEdit }) => {
  return (
    <View style={tw`bg-gray-800 rounded-2xl p-6 mb-6`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-white text-xl font-bold`}>Vehicle Details</Text>
        <TouchableOpacity onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={24} color="#60A5FA" />
        </TouchableOpacity>
      </View>
      
      <View style={tw`ml-3`}>
        <InfoRow label="Make" value={carData.make} />
        <InfoRow label="Model" value={carData.model} />
        <InfoRow label="Year" value={carData.year.toString()} />
        <InfoRow label="Trim" value={carData.trim} />
        <InfoRow label="Color" value={carData.color} />
        <InfoRow label="Engine" value={carData.engineSize} />
        <InfoRow label="Transmission" value={carData.transmission} />
        <InfoRow label="Fuel Type" value={carData.fuelType} />
      </View>
    </View>
  );
};

export default VehicleDetailsSection;