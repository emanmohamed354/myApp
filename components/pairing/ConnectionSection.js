import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import CommonIpButton from './CommonIpButton';

const ConnectionSection = ({ 
  showIpInput, 
  setShowIpInput, 
  localIp, 
  setLocalIp, 
  validateIp 
}) => {
  const commonIps = ['192.168.1.5', '192.168.0.5', '10.0.0.5', '172.16.0.5'];

  return (
    <View style={tw`bg-gray-800 rounded-2xl p-6 mb-4`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-white text-xl font-bold`}>Local Connection</Text>
        <TouchableOpacity onPress={() => setShowIpInput(!showIpInput)}>
          <MaterialCommunityIcons
            name={showIpInput ? "chevron-up" : "chevron-down"}
            size={24}
            color="#60A5FA"
          />
        </TouchableOpacity>
      </View>
      
      {showIpInput && (
        <View>
          <Text style={tw`text-gray-400 text-sm mb-2`}>
            Enter your car's local IP address
          </Text>
          <View style={tw`bg-gray-700 rounded-xl px-4 py-3 flex-row items-center`}>
            <MaterialCommunityIcons name="ip-network" size={20} color="#60A5FA" style={tw`mr-3`} />
            <TextInput
              style={tw`flex-1 text-white`}
              value={localIp}
              onChangeText={setLocalIp}
              placeholder="192.168.1.5"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              autoCapitalize="none"
            />
            {localIp && validateIp(localIp) && (
              <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
            )}
          </View>
          
          {/* IP Format Helper */}
          {localIp && !validateIp(localIp) && (
            <Text style={tw`text-red-400 text-xs mt-2`}>
              Please enter a valid IP address format
            </Text>
          )}
          
          {/* Common IPs */}
          <View style={tw`mt-4`}>
            <Text style={tw`text-gray-500 text-xs mb-2`}>Common local IPs:</Text>
            <View style={tw`flex-row flex-wrap`}>
              {commonIps.map((ip) => (
                <CommonIpButton 
                  key={ip}
                  ip={ip} 
                  onPress={() => setLocalIp(ip)} 
                />
              ))}
            </View>
          </View>
          
          {/* Instructions */}
          <View style={tw`bg-blue-900/20 rounded-lg p-3 mt-4`}>
            <View style={tw`flex-row items-start`}>
              <MaterialCommunityIcons name="information" size={16} color="#60A5FA" style={tw`mt-0.5 mr-2`} />
              <View style={tw`flex-1`}>
                <Text style={tw`text-blue-400 text-xs font-semibold mb-1`}>How to find your car's IP:</Text>
                <Text style={tw`text-gray-500 text-xs leading-5`}>
                  1. Turn on your car's display{'\n'}
                  2. Go to Settings → Network{'\n'}
                  3. Look for "Local IP Address"{'\n'}
                  4. Enter the IP shown above
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ConnectionSection;