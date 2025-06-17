import React, { forwardRef } from 'react';
import { TextInput } from 'react-native';
import tw from 'twrnc';

const FormInput = forwardRef(({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
  returnKeyType = 'default',
  onSubmitEditing,
  ...props
}, ref) => {
  return (
    <TextInput
      ref={ref}
      style={[tw`border border-black px-4 py-2 rounded text-center m-3 h-10 w-80`, style]}
      placeholder={placeholder}
      placeholderTextColor="black"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      blurOnSubmit={false}
      {...props}
    />
  );
});

export default FormInput;