import React from 'react';
import { TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const PairButton = ({ onPress, loading, disabled }) => {
  return (
    <>
      <TouchableOpacity
        style={tw`bg-blue-600 rounded-2xl py-4 px-6 shadow-lg ${disabled ? 'opacity-60' : ''}`}
        onPress={onPress}
        disabled={disabled}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={tw`flex-row items-center justify-center`}>
            <MaterialCommunityIcons name="link-variant" size={24} color="white" />
            <Text style={tw`text-white text-center font-bold text-lg ml-2`}>
              Pair This Vehicle
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={tw`mt-4 mb-8`}>
        <Text style={tw`text-gray-500 text-xs text-center`}>
          Make sure your phone and car are on the same network
        </Text>
      </View>
    </>
  );
};

export default PairButton;