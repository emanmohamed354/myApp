// components/PerformanceCharts.js
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import tw from 'twrnc';

const { width: screenWidth } = Dimensions.get('window');

export default function PerformanceCharts({ chartData }) {
  const chartConfig = {
    backgroundColor: '#1F2937',
    backgroundGradientFrom: '#1F2937',
    backgroundGradientTo: '#111827',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(147, 197, 253, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(209, 213, 219, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#60A5FA'
    },
    propsForLabels: {
      fontSize: 9
    },
    propsForVerticalLabels: {
      fontSize: 7,
      rotation: 45
    },
    propsForHorizontalLabels: {
      fontSize: 9
    }
  };

  if (!chartData || chartData.labels.length <= 1) {
    return null;
  }

  return (
    <View style={tw`px-4 py-4`}>
      <Text style={tw`text-white text-lg font-semibold mb-3`}>Performance Over Time</Text>
      
      {/* RPM Chart */}
      <View style={tw`mb-4`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-400 text-sm`}>Engine RPM (x100)</Text>
          <Text style={tw`text-gray-500 text-xs`}>Since app launch</Text>
        </View>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [{
              data: chartData.rpm.length > 0 ? chartData.rpm : [0],
            }]
          }}
          width={screenWidth - 32}
          height={180}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          }}
          bezier
          style={tw`rounded-lg`}
          withInnerLines={false}
          withOuterLines={true}
          segments={4}
        />
      </View>

      {/* Speed Chart */}
      <View style={tw`mb-4`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-400 text-sm`}>Vehicle Speed (km/h)</Text>
          <Text style={tw`text-gray-500 text-xs`}>Since app launch</Text>
        </View>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [{
              data: chartData.speed.length > 0 ? chartData.speed : [0],
            }]
          }}
          width={screenWidth - 32}
          height={180}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          }}
          bezier
          style={tw`rounded-lg`}
          withInnerLines={false}
          withOuterLines={true}
          segments={4}
        />
      </View>

      {/* Temperature Chart */}
      <View style={tw`mb-4`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-gray-400 text-sm`}>Engine Temperature (°C)</Text>
          <Text style={tw`text-gray-500 text-xs`}>Since app launch</Text>
        </View>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [{
              data: chartData.temp.length > 0 ? chartData.temp : [0],
            }]
          }}
          width={screenWidth - 32}
          height={180}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(251, 146, 60, ${opacity})`,
          }}
          bezier
          style={tw`rounded-lg`}
          withInnerLines={false}
          withOuterLines={true}
          segments={4}
        />
      </View>
    </View>
  );
}