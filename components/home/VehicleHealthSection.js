import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const { width: screenWidth } = Dimensions.get('window');

export default function VehicleHealthSection({ carHealth, healthFactors }) {
  const getHealthColor = (value) => {
    if (value >= 80) return '#10B981';
    if (value >= 60) return '#F59E0B';
    return '#EF4444';
  };

  // Shorten labels for better display
  const shortenLabel = (label) => {
    const labelMap = {
      'Engine Temp': 'Temp',
      'RPM Range': 'RPM',
      'Engine Load': 'Load',
      'Fuel System': 'Fuel',
      'Battery': 'Batt'
    };
    return labelMap[label] || label;
  };

  const healthBarData = {
    labels: Object.keys(healthFactors).map(shortenLabel),
    datasets: [{
      data: Object.values(healthFactors)
    }]
  };

  return (
    <View style={tw`px-4 py-4`}>
      <Text style={tw`text-white text-lg font-semibold mb-3`}>Vehicle Health Analysis</Text>
      
      {/* Overall Health Score Card */}
      <LinearGradient
        colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
        style={tw`rounded-xl p-4 mb-4`}
      >
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <View style={tw`flex-row items-center`}>
            <MaterialCommunityIcons 
              name="car-connected" 
              size={24} 
              color="#60A5FA" 
              style={tw`mr-2`}
            />
            <Text style={tw`text-white text-base font-medium`}>Overall Health Score</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={[
              tw`text-3xl font-bold`,
              { color: getHealthColor(carHealth) }
            ]}>
              {carHealth}%
            </Text>
          </View>
        </View>

        {/* Health Status Text */}
        <Text style={[
          tw`text-center text-sm mb-4`,
          { color: getHealthColor(carHealth) }
        ]}>
          {carHealth >= 80 ? 'Excellent Condition' : 
           carHealth >= 60 ? 'Good Condition - Minor Attention Needed' : 
           'Poor Condition - Service Recommended'}
        </Text>

        {/* Health Factors Bar Chart */}
        {Object.keys(healthFactors).length > 0 && (
          <BarChart
            data={healthBarData}
            width={screenWidth - 64}
            height={220} // Slightly increased height for rotated labels
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#1F2937',
              backgroundGradientFrom: '#1F2937',
              backgroundGradientTo: '#111827',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(147, 197, 253, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(209, 213, 219, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.7, // Slightly reduced to give more space
              fillShadowGradient: '#60A5FA',
              fillShadowGradientOpacity: 1,
              propsForLabels: {
                fontSize: 10, // Smaller font size
              },
              propsForVerticalLabels: {
                fontSize: 9, // Smaller font for y-axis
              },
              propsForHorizontalLabels: {
                fontSize: 9, // Smaller font for x-axis
                
              },
            }}
            style={tw`rounded-lg`}
            showValuesOnTopOfBars={true}
            fromZero={true}
            xLabelsOffset={-10} // Adjust label position
          />
        )}
        {/* Health Factors Legend */}
        <View style={tw`mt-4`}>
          {Object.entries(healthFactors).map(([factor, value]) => (
            <View key={factor} style={tw`flex-row items-center justify-between mb-2`}>
              <Text style={tw`text-gray-300 text-sm`}>{factor}</Text>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-gray-700 rounded-full w-20 h-2 mr-2`}>
                  <View 
                    style={[
                      tw`h-full rounded-full`,
                      { 
                        width: `${value}%`,
                        backgroundColor: getHealthColor(value)
                      }
                    ]} 
                  />
                </View>
                <Text style={[
                  tw`text-sm font-medium w-12 text-right`,
                  { color: getHealthColor(value) }
                ]}>
                  {Math.round(value)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}