import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { formatSyncTime } from './utils/formatters';

const SyncStatusCard = ({ lastSyncTime, isSyncing, onSync, iconRotateAnim }) => {
  return (
    <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
      <View style={tw`flex-row items-center justify-between mb-2`}>
        <View style={tw`flex-row items-center`}>
          <MaterialCommunityIcons name="cloud-check" size={16} color="#60A5FA" />
          <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
            Sync Status
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSync}
          disabled={isSyncing}
          style={tw`bg-blue-600/20 px-3 py-2 rounded-lg flex-row items-center`}
        >
          <Animated.View
            style={{
              transform: [{
                rotate: isSyncing
                  ? iconRotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  : '0deg',
              }],
            }}
          >
            <MaterialCommunityIcons 
              name="sync" 
              size={16} 
              color={isSyncing ? "#6B7280" : "#60A5FA"} 
            />
          </Animated.View>
          <Text style={tw`text-blue-400 text-sm ml-2`}>
            {isSyncing ? 'Syncing...' : 'Sync'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={tw`text-gray-400 text-xs leading-5`}>
        {lastSyncTime 
          ? `Last synced ${formatSyncTime(lastSyncTime)}.`
          : 'No sync performed yet.'
        }
      </Text>
    </View>
  );
};

export default SyncStatusCard;