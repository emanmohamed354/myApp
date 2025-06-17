import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from 'twrnc';
import { authApi } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import AuthContainer from '../components/auth/AuthContainer';
import AnimatedInput from '../components/auth/AnimatedInput';
import LoadingOverlay from '../components/auth/LoadingOverlay';

export default function RegistrationScreen({ navigation }) {
  const { saveToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const stepIndicatorAnims = useRef(
    Array(5).fill(0).map(() => new Animated.Value(0))
  ).current;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  const steps = [
    { title: 'Account', icon: 'account-key' },
    { title: 'Personal', icon: 'account' },
    { title: 'Contact', icon: 'phone' },
    { title: 'License', icon: 'card-account-details' },
    { title: 'Emergency', icon: 'account-heart' }
  ];

  useEffect(() => {
    animateStepIndicator(0);
  }, []);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      tension: 20,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const animateStepIndicator = (stepIndex) => {
    Animated.spring(stepIndicatorAnims[stepIndex], {
      toValue: 1,
      tension: 20,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const animateError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.username || !formData.password || !formData.confirmPassword) {
          animateError();
          Alert.alert('Missing Information', 'Please fill in all fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          animateError();
          Alert.alert('Password Mismatch', 'Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          animateError();
          Alert.alert('Weak Password', 'Password must be at least 8 characters');
          return false;
        }
        break;
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email) {
          animateError();
          Alert.alert('Missing Information', 'Please fill in all fields');
          return false;
        }
        break;
      case 2:
        if (!formData.phone || !formData.address.city || !formData.address.country) {
          animateError();
          Alert.alert('Missing Information', 'Please fill in required fields');
          return false;
        }
        break;
      case 3:
        if (!formData.licenseNumber) {
          animateError();
          Alert.alert('Missing Information', 'Please enter your license number');
          return false;
        }
        break;
      case 4:
        if (!formData.emergencyContact.name || !formData.emergencyContact.phone) {
          animateError();
          Alert.alert('Missing Information', 'Please provide emergency contact details');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        animateStepIndicator(currentStep + 1);
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const finalFormData = {
        ...formData,
        licenseExpiry: formData.licenseExpiry.toISOString().split('T')[0],
        role: 'DRIVER',
      };

      delete finalFormData.confirmPassword;

      const response = await authApi.registerUser(finalFormData);
      
      if (response.accessToken) {
        await saveToken(response.accessToken);
      }
    } catch (error) {
      Alert.alert('Registration Failed', 'Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <AnimatedInput
              icon="account"
              placeholder="Choose a username"
              value={formData.username}
              onChangeText={(text) => updateFormData('username', text)}
              autoCapitalize="none"
              delay={0}
            />
            <AnimatedInput
              icon="lock"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry={!showPassword}
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              delay={100}
            />
            <AnimatedInput
              icon="lock-check"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              secureTextEntry={!showConfirmPassword}
              showPasswordToggle
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              delay={200}
            />
          </>
        );

      case 1:
        return (
          <>
            <AnimatedInput
              icon="account"
              placeholder="Your first name"
              value={formData.firstName}
              onChangeText={(text) => updateFormData('firstName', text)}
              delay={0}
            />
            <AnimatedInput
              icon="account"
              placeholder="Your last name"
              value={formData.lastName}
              onChangeText={(text) => updateFormData('lastName', text)}
              delay={100}
            />
            <AnimatedInput
              icon="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              delay={200}
            />
          </>
        );

      case 2:
        return (
          <>
            <AnimatedInput
              icon="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              keyboardType="phone-pad"
              delay={0}
            />
            <AnimatedInput
              icon="home"
              placeholder="123 Main Street"
              value={formData.address.street}
              onChangeText={(text) => updateFormData('address.street', text)}
              delay={100}
            />
            <AnimatedInput
              icon="city"
              placeholder="San Francisco"
              value={formData.address.city}
              onChangeText={(text) => updateFormData('address.city', text)}
              delay={200}
            />
            <View style={tw`flex-row`}>
              <View style={tw`flex-1 mr-2`}>
                <AnimatedInput
                  icon="map-marker"
                  placeholder="CA"
                  value={formData.address.state}
                  onChangeText={(text) => updateFormData('address.state', text)}
                  delay={300}
                />
              </View>
              <View style={tw`flex-1 ml-2`}>
                <AnimatedInput
                  icon="mailbox"
                  placeholder="94105"
                  value={formData.address.zipCode}
                  onChangeText={(text) => updateFormData('address.zipCode', text)}
                  keyboardType="numeric"
                  delay={300}
                />
              </View>
            </View>
            <AnimatedInput
              icon="earth"
              placeholder="United States"
              value={formData.address.country}
              onChangeText={(text) => updateFormData('address.country', text)}
              delay={400}
            />
          </>
        );

      case 3:
        return (
          <>
            <AnimatedInput
              icon="card-account-details"
              placeholder="D1234567890"
              value={formData.licenseNumber}
              onChangeText={(text) => updateFormData('licenseNumber', text)}
              delay={0}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={tw`mb-4`}
            >
              <Text style={tw`text-gray-400 text-sm mb-2`}>License Expiry Date</Text>
              <View style={tw`bg-gray-800/50 rounded-2xl p-4 flex-row items-center border-2 border-gray-600`}>
                <MaterialCommunityIcons name="calendar" size={20} color="#60A5FA" style={tw`mr-3`} />
                <Text style={tw`text-white flex-1`}>
                  {formData.licenseExpiry.toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.licenseExpiry}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    updateFormData('licenseExpiry', selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
          </>
        );

      case 4:
        return (
          <>
            <AnimatedInput
              icon="account-heart"
              placeholder="Contact person name"
              value={formData.emergencyContact.name}
              onChangeText={(text) => updateFormData('emergencyContact.name', text)}
              delay={0}
            />
            <AnimatedInput
              icon="account-group"
              placeholder="Spouse, Parent, etc."
              value={formData.emergencyContact.relationship}
              onChangeText={(text) => updateFormData('emergencyContact.relationship', text)}
              delay={100}
            />
            <AnimatedInput
              icon="phone-alert"
              placeholder="+1 (555) 987-6543"
              value={formData.emergencyContact.phone}
              onChangeText={(text) => updateFormData('emergencyContact.phone', text)}
              keyboardType="phone-pad"
              delay={200}
            />
          </>
        );
    }
  };

  return (
    <>
      <AuthContainer 
        title="Create Account" 
        subtitle={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].title}`}
      >
        {/* Progress Bar */}
        <View style={tw`mb-6`}>
          <View style={tw`h-1 bg-gray-800 rounded-full overflow-hidden`}>
            <Animated.View
              style={[
                tw`h-full bg-blue-600 rounded-full`,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          
          {/* Step Indicators */}
          <View style={tw`flex-row justify-between mt-4`}>
            {steps.map((step, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => index < currentStep && setCurrentStep(index)}
                disabled={index >= currentStep}
                style={tw`items-center`}
              >
                <Animated.View
                  style={[
                    tw`w-10 h-10 rounded-full items-center justify-center ${
                      index <= currentStep ? 'bg-blue-600' : 'bg-gray-800'
                    }`,
                    {
                      transform: [{ scale: stepIndicatorAnims[index] }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={step.icon}
                    size={20}
                    color={index <= currentStep ? 'white' : '#6B7280'}
                  />
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form Content */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          {renderStepContent()}
        </Animated.View>

        {/* Navigation Buttons */}
        <View style={tw`flex-row justify-between mt-6`}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={tw`bg-gray-800 rounded-2xl px-6 py-3`}
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={tw`text-white font-semibold`}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={tw`bg-blue-600 rounded-2xl px-8 py-3 ${currentStep === 0 ? 'flex-1' : ''} ${
              loading ? 'opacity-70' : ''
            }`}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={tw`text-white font-bold text-center`}>
              {loading ? 'Processing...' : currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        {currentStep === 0 && (
          <>
            <View style={tw`flex-row items-center my-4`}>
              <View style={tw`flex-1 h-px bg-gray-700`} />
              <Text style={tw`text-gray-500 px-4`}>or</Text>
              <View style={tw`flex-1 h-px bg-gray-700`} />
            </View>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              style={tw`py-2`}
            >
              <Text style={tw`text-gray-400 text-center`}>
                Already have an account? <Text style={tw`text-blue-400 font-semibold`}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </>
        )}
      </AuthContainer>
      {loading && <LoadingOverlay />}
    </>
  );
}