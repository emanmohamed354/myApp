// components/ErrorBoundary/ScreenErrorBoundary.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

export class ScreenErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Screen Error in ${this.props.screenName}:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={tw`flex-1 bg-gray-900 justify-center items-center p-6`}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={60} 
            color="#EF4444" 
          />
          <Text style={tw`text-white text-lg font-bold mt-4 text-center`}>
            Error in {this.props.screenName}
          </Text>
          <Text style={tw`text-gray-400 text-center mt-2`}>
            {this.props.fallbackMessage || 'Something went wrong in this screen'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              this.setState({ hasError: false });
              this.props.onReset?.();
            }}
            style={tw`bg-blue-600 px-4 py-2 rounded-lg mt-4`}
          >
            <Text style={tw`text-white`}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}