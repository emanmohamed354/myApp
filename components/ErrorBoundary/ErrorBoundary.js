import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import tw from 'twrnc';
//import crashImage from '../../assets/images/crash.png'; // You'll need to add this

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to your error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // Send to error tracking service (Sentry, Bugsnag, etc.)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  handleReset = async () => {
    // Reset the error boundary state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });

    // Optionally reload the app
    if (Updates.isAvailable) {
      await Updates.reloadAsync();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.handleReset}
          errorInfo={this.state.errorInfo}
          errorCount={this.state.errorCount}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError, errorInfo, errorCount }) => {
  const isDevelopment = __DEV__;

  return (
    <LinearGradient
      colors={['#1F2937', '#111827', '#000000']}
      style={tw`flex-1`}
    >
      <ScrollView contentContainerStyle={tw`flex-grow-1 p-6`}>
        <View style={tw`flex-1 justify-center items-center`}>
          {/* Error Icon/Image */}
          <View style={tw`mb-6`}>
            <MaterialCommunityIcons 
              name="car-brake-alert" 
              size={80} 
              color="#EF4444" 
            />
          </View>

          {/* Error Title */}
          <Text style={tw`text-white text-2xl font-bold mb-2 text-center`}>
            Oops! Something went wrong
          </Text>

          {/* Error Message */}
          <Text style={tw`text-gray-400 text-center mb-6 px-4`}>
            Your vehicle diagnostics app encountered an unexpected error. 
            Don't worry, your car is fine! The app just needs a quick restart.
          </Text>

          {/* Error Count Warning */}
          {errorCount > 2 && (
            <View style={tw`bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 mb-4`}>
              <Text style={tw`text-yellow-400 text-sm text-center`}>
                Multiple errors detected. Consider reinstalling the app if issues persist.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={tw`flex-row gap-3 mb-6`}>
            <TouchableOpacity
              onPress={resetError}
              style={tw`bg-blue-600 px-6 py-3 rounded-lg flex-row items-center`}
            >
              <MaterialCommunityIcons name="restart" size={20} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-semibold`}>Restart App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Navigate to home or safe screen
                resetError();
              }}
              style={tw`bg-gray-700 px-6 py-3 rounded-lg`}
            >
              <Text style={tw`text-white font-semibold`}>Go Home</Text>
            </TouchableOpacity>
          </View>

          {/* Developer Error Details */}
          {isDevelopment && error && (
            <View style={tw`bg-gray-800 rounded-lg p-4 w-full mt-4`}>
              <Text style={tw`text-red-400 font-bold mb-2`}>
                Error Details (Development Only)
              </Text>
              <Text style={tw`text-gray-300 text-sm mb-2`}>
                {error.toString()}
              </Text>
              {errorInfo && (
                <Text style={tw`text-gray-400 text-xs`}>
                  {errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}

          {/* Contact Support */}
          <TouchableOpacity
            style={tw`mt-4`}
            onPress={() => {
              // Open support email/chat
            }}
          >
            <Text style={tw`text-blue-400 underline`}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};