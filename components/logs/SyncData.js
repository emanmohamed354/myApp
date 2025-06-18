import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import DiagnosticLog from './DiagnosticLog';
import EventLog from './EventLog';
import SyncStatusCard from './SyncStatusCard';

const SyncData = ({ 
  syncData, 
  lastSyncTime, 
  isSyncing, 
  onSync, 
  iconRotateAnim,
  itemAnimations,
  fadeAnim,
  onClearCode 
}) => {
  const hasDiagnostics = syncData.diagnostics && syncData.diagnostics.length > 0;
  const hasEvents = syncData.events && syncData.events.length > 0;
  const hasReadings = Array.isArray(syncData) && syncData.length > 0;
  
  if (!hasReadings && !hasDiagnostics && !hasEvents) {
    return (
      <View style={tw`flex-1 items-center justify-center py-20`}>
        <MaterialCommunityIcons name="cloud-sync" size={80} color="#4B5563" />
        <Text style={tw`text-gray-400 text-lg mt-6 font-semibold`}>
          No sync data available
        </Text>
        <Text style={tw`text-gray-500 text-sm mt-2 text-center px-8`}>
          Tap the sync button to get the latest data
        </Text>
        <TouchableOpacity
          onPress={onSync}
          disabled={isSyncing}
          style={tw`bg-blue-600 rounded-lg px-6 py-3 mt-6 flex-row items-center`}
        >
          <MaterialCommunityIcons 
            name="sync" 
            size={20} 
            color="#fff" 
            style={tw`mr-2`}
          />
          <Text style={tw`text-white font-semibold`}>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <SyncStatusCard
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        onSync={onSync}
        iconRotateAnim={iconRotateAnim}
      />

      {/* Display Diagnostics if available */}
      {hasDiagnostics && (
        <>
          <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
            <View style={tw`flex-row items-center mb-2`}>
              <MaterialCommunityIcons name="car-cog" size={16} color="#F59E0B" />
              <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
                Synced Diagnostics
              </Text>
            </View>
            <Text style={tw`text-gray-400 text-xs`}>
              {syncData.diagnostics.length} diagnostic {syncData.diagnostics.length === 1 ? 'code' : 'codes'} found
            </Text>
          </View>

          {syncData.diagnostics.map((diagnostic, index) => (
            <DiagnosticLog
              key={diagnostic.id}
              log={diagnostic}
              index={index}
              itemAnimation={itemAnimations[index]}
              fadeAnim={fadeAnim}
              onClearCode={onClearCode}
            />
          ))}
        </>
      )}

      {/* Display Events if available */}
      {hasEvents && (
        <>
          <View style={tw`bg-gray-800/30 rounded-xl p-4 mb-4 border border-gray-700`}>
            <View style={tw`flex-row items-center mb-2`}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#3B82F6" />
              <Text style={tw`text-gray-300 text-sm font-semibold ml-2`}>
                Synced Events
              </Text>
            </View>
            <Text style={tw`text-gray-400 text-xs`}>
              {syncData.events.length} event{syncData.events.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {syncData.events.map((event, index) => (
            <EventLog
              key={event.id}
              log={event}
              index={index}
              itemAnimation={itemAnimations[index]}
              fadeAnim={fadeAnim}
            />
          ))}
        </>
      )}

      {/* Empty state for sensor readings */}
      {syncData.readings && syncData.readings.length === 0 && (
        <View style={tw`bg-gray-800/30 rounded-xl p-4 border border-gray-700`}>
          <View style={tw`flex-row items-center`}>
            <MaterialCommunityIcons name="gauge-empty" size={16} color="#6B7280" />
            <Text style={tw`text-gray-400 text-sm ml-2`}>
              No sensor readings available
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

export default SyncData;