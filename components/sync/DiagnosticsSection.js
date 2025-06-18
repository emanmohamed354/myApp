// components/sync/DiagnosticsSection.js
import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import DiagnosticCard from './DiagnosticCard';

const DiagnosticsSection = ({ diagnostics, fadeAnim }) => {
  const activeDiagnostics = diagnostics.filter(d => d.status === 'active');
  const pendingDiagnostics = diagnostics.filter(d => d.status === 'pending');

  return (
    <View style={tw`mb-6`}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-white text-lg font-bold`}>Diagnostic Codes</Text>
        <View style={tw`flex-row`}>
          {activeDiagnostics.length > 0 && (
            <StatusBadge count={activeDiagnostics.length} label="Active" color="#EF4444" />
          )}
          {pendingDiagnostics.length > 0 && (
            <StatusBadge count={pendingDiagnostics.length} label="Pending" color="#F59E0B" />
          )}
        </View>
      </View>
      
      {diagnostics.map((diagnostic, index) => (
        <DiagnosticCard
          key={diagnostic.id}
          diagnostic={diagnostic}
          index={index}
          fadeAnim={fadeAnim}
        />
      ))}
    </View>
  );
};

const StatusBadge = ({ count, label, color }) => (
  <View style={[tw`px-2 py-1 rounded-full ml-2`, { backgroundColor: `${color}20` }]}>
    <Text style={[tw`text-xs font-semibold`, { color }]}>
      {count} {label}
    </Text>
  </View>
);

export default DiagnosticsSection;