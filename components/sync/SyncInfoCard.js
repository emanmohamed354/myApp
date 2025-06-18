// components/sync/SyncInfoCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const SyncInfoCard = () => {
  return (
    <View style={tw`bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-800/30`}>
      <View style={tw`flex-row items-start`}>
        <MaterialCommunityIcons name="information" size={20} color="#60A5FA" style={tw`mt-0.5 mr-3`} />
        <View style={tw`flex-1`}>
          <Text style={tw`text-blue-400 font-semibold mb-1`}>Before You Pair</Text>
          <Text style={tw`text-gray-400 text-sm leading-5`}>
            Review any critical sensor readings or diagnostic codes from your vehicle. 
            This helps ensure your car is in good condition before pairing.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SyncInfoCard;