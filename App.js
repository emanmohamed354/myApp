// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { View, Text, LogBox, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import tw from 'twrnc';

// Components
import LoadingCarIcon from './components/LoadingCarIcon';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { NetworkErrorBoundary } from './components/ErrorBoundary/NetworkErrorBoundary';
import { ScreenErrorBoundary } from './components/ErrorBoundary/ScreenErrorBoundary';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import InfoScreen from './screens/InfoScreen';
import LLMScreen from './screens/LLMScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationScreen from './screens/NotificationScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import ProfileScreen from './screens/ProfileScreen';
import CarPairingScreen from './screens/CarPairingScreen';
import PairingSyncScreen from './screens/PairingSyncScreen';
import LogsScreen from './screens/LogsScreen';

// Providers
import { SensorDataProvider } from './contexts/SensorDataContext';
import { UserSettingsProvider } from './contexts/UserSettingsContext';
import { NotificationStateProvider } from './contexts/NotificationStateContext';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

// HOC to wrap screens with error boundary
const withScreenErrorBoundary = (Component, screenName) => {
  return (props) => (
    <ScreenErrorBoundary 
      screenName={screenName}
      fallbackMessage={`Error loading ${screenName}. Please try again.`}
      onReset={() => props.navigation.navigate('Home')}
    >
      <Component {...props} />
    </ScreenErrorBoundary>
  );
};

// Custom Tab Bar Component that handles visibility
const CustomTabBar = (props) => {
  const { isCarPaired } = useAuth();
  
  // Add null/undefined checks
  if (!props.state || !props.state.routes) {
    return null;
  }
  
  // Hide tabs based on pairing status
  const filteredRoutes = props.state.routes.filter(route => {
    // Check if route exists and has a name
    if (!route || !route.name) {
      return false;
    }
    
    if (!isCarPaired) {
      // Only show Home, Profile, Appointment, and PairingSync when not paired
      return ['Home', 'Profile', 'Appointment', 'PairingSync'].includes(route.name);
    } else {
      // When paired, exclude Profile, Appointment, and PairingSync
      return !['Profile', 'Appointment', 'PairingSync'].includes(route.name);
    }
  });

  // Make sure we have valid routes before proceeding
  if (filteredRoutes.length === 0) {
    return null;
  }

  // Find the current route in filtered routes
  const currentRoute = props.state.routes[props.state.index];
  const newIndex = filteredRoutes.findIndex(route => route.name === currentRoute?.name);

  const filteredProps = {
    ...props,
    state: {
      ...props.state,
      routes: filteredRoutes,
      // Ensure index is within bounds and points to correct route
      index: newIndex >= 0 ? newIndex : 0
    }
  };

  // Get the active screen name safely
  const activeScreenName = currentRoute?.name || 'Home';

  return <Footer {...filteredProps} activeScreen={activeScreenName} />;
};

// Main tab navigator for authenticated users
function MainTabs() {
  const { isCarPaired } = useAuth();
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animationEnabled: false,
      }}
    >
      <Tab.Screen name="Home" component={withScreenErrorBoundary(HomeScreen, 'Home')} />
      <Tab.Screen name="Profile" component={withScreenErrorBoundary(ProfileScreen, 'Profile')} />
      <Tab.Screen name="Appointment" component={withScreenErrorBoundary(AppointmentScreen, 'Appointments')} />
      <Tab.Screen name="PairingSync" component={withScreenErrorBoundary(PairingSyncScreen, 'Pairing Sync')} />
      <Tab.Screen name="Info" component={withScreenErrorBoundary(InfoScreen, 'Vehicle Info')} />
      <Tab.Screen name="LLM" component={withScreenErrorBoundary(LLMScreen, 'AI Assistant')} />
      <Tab.Screen name="Logs" component={withScreenErrorBoundary(LogsScreen, 'Logs')} />
      <Tab.Screen name="Notifications" component={withScreenErrorBoundary(NotificationScreen, 'Notifications')} />
      <Tab.Screen name="Settings" component={withScreenErrorBoundary(SettingsScreen, 'Settings')} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { loading, isAuthenticated, isCarPaired } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
        <LoadingCarIcon size={60} />
        <Text style={tw`mt-4 text-gray-400 text-lg`}>Initializing...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          ...Platform.select({
            ios: {
              animation: 'slide_from_right',
              presentation: 'card',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            },
            android: {
              animation: 'slide_from_right',
              animationDuration: 250,
            },
          }),
          cardStyle: {
            backgroundColor: 'transparent',
          },
          cardOverlayEnabled: true,
          cardShadowEnabled: true,
          animationEnabled: true,
          animationTypeForReplace: 'push',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={withScreenErrorBoundary(LoginScreen, 'Login')}
              options={{
                animationTypeForReplace: !isAuthenticated ? 'pop' : 'push',
              }}
            />
            <Stack.Screen 
              name="Registration" 
              component={withScreenErrorBoundary(RegistrationScreen, 'Registration')} 
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
              options={{
                animation: 'fade',
                animationDuration: 200,
              }}
            />
            <Stack.Screen 
              name="CarPairing" 
              component={withScreenErrorBoundary(CarPairingScreen, 'Car Pairing')}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="PairingSync" 
              component={withScreenErrorBoundary(PairingSyncScreen, 'Pairing Sync')}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={tw`flex-1`}>
        <NetworkProvider>
          <NetworkErrorBoundary>
            <AuthProvider>
              <UserSettingsProvider>
                <NotificationStateProvider>
                  <SensorDataProvider>
                    <AppNavigator />
                  </SensorDataProvider>
                </NotificationStateProvider>
              </UserSettingsProvider>
            </AuthProvider>
          </NetworkErrorBoundary>
        </NetworkProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}