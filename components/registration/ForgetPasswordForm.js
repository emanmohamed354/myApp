import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import AnimatedFormContainer from './AnimatedFormContainer';
import FormInput from './FormInput';
import FormButton from './FormButton';

const ForgetPasswordForm = ({ setFormType, formType }) => {
  const [email, setEmail] = useState('');

  const handleForgetPassword = () => {
    console.log('Email:', email);
    alert('Password reset link sent to your email!');
    // After success, go back to login
    setFormType('login');
  };

  return (
    <AnimatedFormContainer formType={formType}>
      <View style={tw`mb-6 mt-4`}>
        <Text style={tw`text-black text-2xl font-bold text-center mb-2`}>
          Forget Password?
        </Text>
        <Text style={tw`text-gray-600 text-center`}>
          Enter your email to receive a password reset link
        </Text>
      </View>

      <View style={tw`mb-6 items-center`}>
        <FormInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleForgetPassword}
        />
      </View>

      <View style={tw`items-center mb-4`}>
        <FormButton 
          title="Send Reset Link" 
          onPress={handleForgetPassword}
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

export default ForgetPasswordForm;