// components/info/ServiceHistoryCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import InfoItem from './InfoItem';

const ServiceHistoryCard = ({ carData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysUntilService = () => {
    if (!carData?.nextService) return null;
    const nextService = new Date(carData.nextService);
    if (isNaN(nextService.getTime())) return null;
    const today = new Date();
    const diffTime = nextService - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilService = getDaysUntilService();
  const isUrgent = daysUntilService !== null && daysUntilService < 30;

  return (
    <LinearGradient
      colors={['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)']}
      style={tw`rounded-xl p-6 mb-4`}
    >
      <View style={tw`flex-row items-center mb-4`}>
        <MaterialCommunityIcons 
          name="wrench-clock" 
          size={24} 
          color="#60A5FA" 
          style={tw`mr-2`}
        />
        <Text style={tw`text-lg font-bold text-white`}>Service History</Text>
      </View>
      
      <InfoItem 
        label="Last Service" 
        value={formatDate(carData?.lastService)} 
        icon="clock-outline" 
        iconComponent={MaterialCommunityIcons}
      />
      <InfoItem 
        label="Next Service" 
        value={formatDate(carData?.nextService)} 
        icon="calendar-clock" 
        iconComponent={MaterialCommunityIcons}
      />
      
      {daysUntilService !== null && (
        <View style={[
          tw`mt-4 p-3 rounded-lg`,
          { backgroundColor: isUrgent ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)' }
        ]}>
          <View style={tw`flex-row items-center`}>
            <MaterialCommunityIcons 
              name={isUrgent ? "alert-circle" : "information"} 
              size={20} 
              color={isUrgent ? "#FCD34D" : "#60A5FA"} 
              style={tw`mr-2`}
            />
            <Text style={[
              tw`text-sm`,
              { color: isUrgent ? '#FCD34D' : '#60A5FA' }
            ]}>
              {daysUntilService > 0 
                ? `Service due in ${daysUntilService} days`
                : daysUntilService === 0 
                ? 'Service due today!'
                : `Service overdue by ${Math.abs(daysUntilService)} days`
              }
            </Text>
          </View>
        </View>
      )}
      
      {/* Add creation date info */}
      {carData?.created_at && (
        <View style={tw`mt-4 pt-4 border-t border-gray-700`}>
          <Text style={tw`text-gray-400 text-xs`}>
            Vehicle added: {formatDate(carData.created_at)}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default ServiceHistoryCard;