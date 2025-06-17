// components/ErrorBoundary/AsyncErrorBoundary.js
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import tw from 'twrnc';

export const AsyncErrorBoundary = ({ children, fallback, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return fallback || <DefaultAsyncError onRetry={() => setHasError(false)} />;
  }

  return (
    <ErrorHandler onError={(error) => {
      setHasError(true);
      onError?.(error);
    }}>
      {children}
    </ErrorHandler>
  );
};

const DefaultAsyncError = ({ onRetry }) => (
  <View style={tw`flex-1 justify-center items-center p-6 bg-gray-900`}>
    <Text style={tw`text-white text-lg mb-4`}>Failed to load data</Text>
    <TouchableOpacity
      onPress={onRetry}
      style={tw`bg-blue-600 px-4 py-2 rounded-lg`}
    >
      <Text style={tw`text-white`}>Retry</Text>
    </TouchableOpacity>
  </View>
);

const ErrorHandler = ({ children, onError }) => {
  useEffect(() => {
    const errorHandler = (error, isFatal) => {
      if (isFatal) {
        onError(error);
      }
    };

    // Global error handler
    const previousHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(errorHandler);

    return () => {
      ErrorUtils.setGlobalHandler(previousHandler);
    };
  }, [onError]);

  return children;
};