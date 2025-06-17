import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

const FormButton = ({ title, onPress, disabled = false, loading = false, style }) => {
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity 
      style={[
        tw`bg-blue-600 rounded-xl py-4 px-8 min-w-40`,
        isDisabled && tw`bg-gray-600`,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={tw`text-white text-center font-bold text-lg`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default FormButton;