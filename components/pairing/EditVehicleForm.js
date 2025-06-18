import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import EditInput from './EditInput';

const EditVehicleForm = ({ carData, setCarData, onCancel, onSave }) => {
  return (
    <>
      <View style={tw`bg-gray-800 rounded-2xl p-6 mb-6`}>
        <Text style={tw`text-white text-xl font-bold mb-4`}>Edit Vehicle Details</Text>
        
        <View style={tw`space-y-4`}>
          <EditInput 
            label="Make" 
            value={carData.make} 
            onChangeText={(text) => setCarData({...carData, make: text})} 
          />
          <EditInput 
            label="Model" 
            value={carData.model} 
            onChangeText={(text) => setCarData({...carData, model: text})} 
          />
          <EditInput 
            label="Year" 
            value={carData.year.toString()} 
            onChangeText={(text) => setCarData({...carData, year: parseInt(text) || 0})} 
            keyboardType="numeric" 
          />
          <EditInput 
            label="Trim" 
            value={carData.trim} 
            onChangeText={(text) => setCarData({...carData, trim: text})} 
          />
          <EditInput 
            label="Color" 
            value={carData.color} 
            onChangeText={(text) => setCarData({...carData, color: text})} 
          />
          <EditInput 
            label="Engine Size" 
            value={carData.engineSize} 
            onChangeText={(text) => setCarData({...carData, engineSize: text})} 
          />
          <EditInput 
            label="Transmission" 
            value={carData.transmission} 
            onChangeText={(text) => setCarData({...carData, transmission: text})} 
          />
          <EditInput 
            label="Fuel Type" 
            value={carData.fuelType} 
            onChangeText={(text) => setCarData({...carData, fuelType: text})} 
          />
        </View>
      </View>

      <View style={tw`flex-row gap-3`}>
        <TouchableOpacity
          style={tw`flex-1 bg-gray-700 rounded-2xl py-4 px-6`}
          onPress={onCancel}
        >
          <Text style={tw`text-white text-center font-semibold`}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={tw`flex-1 bg-blue-600 rounded-2xl py-4 px-6`}
          onPress={onSave}
        >
          <Text style={tw`text-white text-center font-semibold`}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default EditVehicleForm;