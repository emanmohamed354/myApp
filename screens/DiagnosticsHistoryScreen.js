// screens/DiagnosticsHistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from 'twrnc';
import { DiagnosticsHistory } from '../utils/diagnosticsHistory';
import { DataExportManager } from '../utils/dataExport';

export default function DiagnosticsHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await DiagnosticsHistory.getHistory();
      setHistory(data);
      
      const reportData = await DiagnosticsHistory.generateReport(
        dateRange.start,
        dateRange.end
      );
      setReport(reportData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    await DataExportManager.generateReport(
      { /* car data */ },
      history
    );
  };

  const renderIssueIcon = (type) => {
    switch (type) {
      case 'warning':
        return <MaterialCommunityIcons name="alert" size={20} color="#F59E0B" />;
      case 'alert':
        return <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />;
      default:
        return <MaterialCommunityIcons name="information" size={20} color="#60A5FA" />;
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-900 justify-center items-center`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']}
        style={tw`pt-12 pb-4 px-4`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-xl font-bold`}>Diagnostics History</Text>
          <TouchableOpacity onPress={exportReport}>
            <MaterialCommunityIcons name="download" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView>
        {/* Date Range Selector */}
        <View style={tw`bg-gray-800 m-4 rounded-xl p-4`}>
          <Text style={tw`text-white font-bold mb-3`}>Date Range</Text>
          <View style={tw`flex-row justify-between`}>
            <TouchableOpacity
              onPress={() => setShowDatePicker('start')}
              style={tw`flex-1 bg-gray-700 rounded-lg p-3 mr-2`}
            >
              <Text style={tw`text-gray-400 text-xs`}>From</Text>
              <Text style={tw`text-white`}>
                {dateRange.start.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowDatePicker('end')}
              style={tw`flex-1 bg-gray-700 rounded-lg p-3 ml-2`}
            >
              <Text style={tw`text-gray-400 text-xs`}>To</Text>
              <Text style={tw`text-white`}>
                {dateRange.end.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Report */}
        {report && (
          <View style={tw`bg-gray-800 mx-4 mb-4 rounded-xl p-4`}>
            <Text style={tw`text-white font-bold mb-3`}>Summary Report</Text>
            
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Average Health Score</Text>
              <Text style={[
                tw`font-bold`,
                { color: report.averageHealth >= 80 ? '#10B981' : 
                         report.averageHealth >= 60 ? '#F59E0B' : '#EF4444' }
              ]}>
                {report.averageHealth.toFixed(1)}%
              </Text>
            </View>
            
            <View style={tw`flex-row justify-between mb-2`}>
              <Text style={tw`text-gray-400`}>Total Readings</Text>
              <Text style={tw`text-white`}>{report.totalRecords}</Text>
            </View>
            
            {Object.keys(report.issues).length > 0 && (
              <View style={tw`mt-3 pt-3 border-t border-gray-700`}>
                <Text style={tw`text-yellow-400 font-medium mb-2`}>
                  Issues Detected
                </Text>
                {Object.entries(report.issues).map(([sensor, data]) => (
                  <View key={sensor} style={tw`mb-2`}>
                    <Text style={tw`text-gray-300 text-sm`}>
                      {sensor}: {data.count} occurrences
                    </Text>
                    <Text style={tw`text-gray-500 text-xs`}>
                      Avg: {data.avgValue.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* History List */}
        <View style={tw`px-4`}>
          <Text style={tw`text-white font-bold mb-3`}>Recent Readings</Text>
          
          {history.map((record) => (
            <TouchableOpacity
              key={record.id}
              onPress={() => navigation.navigate('DiagnosticsDetail', { record })}
              style={tw`bg-gray-800 rounded-xl p-4 mb-3`}
            >
              <View style={tw`flex-row justify-between items-start`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white font-medium`}>
                    Health Score: {record.carHealth}%
                  </Text>
                  <Text style={tw`text-gray-400 text-sm mt-1`}>
                    {new Date(record.timestamp).toLocaleString()}
                  </Text>
                  
                  {record.issues.length > 0 && (
                    <View style={tw`flex-row items-center mt-2`}>
                      {renderIssueIcon(record.issues[0].type)}
                      <Text style={tw`text-gray-300 text-sm ml-1`}>
                        {record.issues.length} issue{record.issues.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>
                
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color="#6B7280" 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dateRange[showDatePicker]}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(null);
            if (selectedDate) {
              setDateRange(prev => ({
                ...prev,
                [showDatePicker]: selectedDate,
              }));
              loadHistory();
            }
          }}
        />
      )}
    </View>
  );
}