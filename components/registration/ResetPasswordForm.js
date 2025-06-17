import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import AnimatedFormContainer from './AnimatedFormContainer';
import FormInput from './FormInput';
import FormButton from './FormButton';

const ResetPasswordForm = ({ setFormType, formType }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Refs for input focusing
  const newPasswordRef = useRef(null);

  const handleResetPassword = () => {

    
    alert('Password successfully reset!');
    // After success, go back to login
    setFormType('login');
  };

  return (
    <AnimatedFormContainer formType={formType}>
      <View style={tw`mb-6 mt-4`}>
        <Text style={tw`text-black text-2xl font-bold text-center mb-2`}>
          Reset Password
        </Text>
        <Text style={tw`text-gray-600 text-center`}>
          Create a new password for your account
        </Text>
      </View>

      <View style={tw`mb-4 items-center`}>
        <FormInput
          placeholder="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          returnKeyType="next"
          onSubmitEditing={() => newPasswordRef.current?.focus()}
        />

        <FormInput
          ref={newPasswordRef}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        />


      </View>

      <View style={tw`items-center mb-4`}>
        <FormButton 
          title="Reset Password" 
          onPress={handleResetPassword}
        />
      </View>

      <TouchableOpacity
        onPress={() => setFormType('login')}
        style={tw`py-2`}
      >
        <Text style={tw`text-gray-600 text-center`}>
          Back to Login
        </Text>
      </TouchableOpacity>
    </AnimatedFormContainer>
  );
};

export default ResetPasswordForm;