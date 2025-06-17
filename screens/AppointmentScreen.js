// screens/AppointmentScreen.js
import React, { useState, useRef } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from 'twrnc';
import { useNetwork } from '../contexts/NetworkContext';
import NoInternet from '../components/NoInternet';
import { ErrorToast } from '../components/ErrorToast';

// Components
import AppointmentHeader from '../components/appointment/AppointmentHeader';
import ViewModeToggle from '../components/appointment/ViewModeToggle';
import AppointmentMapView from '../components/appointment/MapView/AppointmentMapView';
import CenterListView from '../components/appointment/ListView/CenterListView';
import LoadingView from '../components/appointment/common/LoadingView';
import BookingModal from '../components/appointment/Modals/BookingModal';
import DirectionsModal from '../components/appointment/Modals/DirectionsModal';

// Hooks
import { useLocation } from '../hooks/useLocation';
import { useCarCenters } from '../hooks/useCarCenters';
import { useNavigation } from '../hooks/useNavigation';

export default function AppointmentScreen({ navigation }) {
  const { isInternetReachable } = useNetwork();
  const mapRef = useRef(null);
  const [viewMode, setViewMode] = useState('map');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  
  // Error handling states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('error');
  
  // Date/Time states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Custom hooks with navigation mode support
  const { userLocation, loading: locationLoading, getCurrentLocation } = useLocation();
  const { maintenanceCenters, loading: centersLoading, refreshCenters } = useCarCenters(userLocation);
  const { 
    showingRoute, 
    routeCoordinates, 
    routeDetails, 
    loading: routeLoading,
    navigationMode,
    currentStep,
    getRoute, 
    clearRoute,
    startNavigation,
    stopNavigation
  } = useNavigation(userLocation, mapRef);

  const loading = locationLoading || centersLoading || routeLoading;

  // Show error toast helper
  const showErrorToast = (message, type = 'error') => {
    setErrorMessage(message);
    setErrorType(type);
    setShowError(true);
  };

  // Check internet connection
  if (!isInternetReachable) {
    return (
      <NoInternet 
        message="You need an internet connection to book appointments and find service centers"
        onRetry={() => {
          if (isInternetReachable) {
            refreshCenters();
          }
        }}
      />
    );
  }

  const handleMarkerPress = (center) => {
    setSelectedCenter(center);
    if (!showingRoute && !navigationMode) {
      mapRef.current?.animateToRegion({
        ...center.coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
    if (viewMode === 'list') {
      setViewMode('map');
      setTimeout(() => {
        handleMarkerPress(center);
      }, 300);
    }
  };

  const handleDirections = async (center) => {
    try {
      if (viewMode === 'list') {
        setViewMode('map');
        setTimeout(() => {
          getRoute(center);
        }, 500);
      } else {
        await getRoute(center);
      }
    } catch (error) {
      showErrorToast('Unable to get directions. Please check your connection and try again.');
    }
  };

  const resetBookingForm = () => {
    setServiceType('');
    setAdditionalNotes('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const handleStartNavigation = () => {
    setShowDirectionsModal(false);
    startNavigation();
    showErrorToast('Navigation started. Drive safely!', 'success');
  };

  const handleExitNavigation = () => {
    if (navigationMode) {
      stopNavigation();
    }
    clearRoute();
  };

  const handleBookingConfirm = async () => {
    try {
      // Here you would normally make an API call to book the appointment
      resetBookingForm();
      setShowBookingModal(false);
      
      // Show success message
      showErrorToast('Appointment booked successfully!', 'success');
      
      // If we're in navigation mode, exit it after booking
      if (navigationMode) {
        handleExitNavigation();
      }
    } catch (error) {
      showErrorToast('Failed to book appointment. Please try again.');
    }
  };

  const handleRefresh = async () => {
    try {
      await getCurrentLocation();
      await refreshCenters();
      showErrorToast('Location updated', 'success');
    } catch (error) {
      showErrorToast('Failed to update location. Please check your location settings.');
    }
  };

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={tw`flex-1`} edges={['left', 'right', 'bottom']}>
        {/* Hide header in navigation mode */}
        {!navigationMode && (
          <AppointmentHeader 
            onRefresh={handleRefresh}
            showingRoute={showingRoute}
          />
        )}

        {/* Hide view toggle when showing route or in navigation mode */}
        {!showingRoute && !navigationMode && (
          <ViewModeToggle 
            viewMode={viewMode}
            setViewMode={setViewMode}
            centersCount={maintenanceCenters.length}
          />
        )}

        {loading ? (
          <LoadingView 
            message={
              navigationMode 
                ? 'Navigating...' 
                : showingRoute 
                  ? 'Getting directions...' 
                  : 'Finding nearby car maintenance centers...'
            } 
          />
        ) : (
          <>
            {viewMode === 'map' ? (
              <AppointmentMapView
                mapRef={mapRef}
                userLocation={userLocation}
                maintenanceCenters={maintenanceCenters}
                selectedCenter={selectedCenter}
                showingRoute={showingRoute}
                routeCoordinates={routeCoordinates}
                routeDetails={routeDetails}
                navigationMode={navigationMode}
                currentStep={currentStep}
                onMarkerPress={handleMarkerPress}
                onBookPress={() => {
                  if (!selectedCenter) {
                    showErrorToast('Please select a service center first', 'warning');
                    return;
                  }
                  setShowBookingModal(true);
                }}
                onDirectionsPress={handleDirections}
                onClearRoute={handleExitNavigation}
                onViewDirections={() => setShowDirectionsModal(true)}
                onStartNavigation={handleStartNavigation}
              />
            ) : (
              <CenterListView
                centers={maintenanceCenters}
                onCenterSelect={handleCenterSelect}
                onBookPress={(center) => {
                  setSelectedCenter(center);
                  setShowBookingModal(true);
                }}
                onDirectionsPress={handleDirections}
              />
            )}
          </>
        )}

        {/* Booking Modal */}
        <BookingModal
          visible={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          selectedCenter={selectedCenter}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          serviceType={serviceType}
          additionalNotes={additionalNotes}
          routeDetails={routeDetails}
          showDatePicker={showDatePicker}
          showTimePicker={showTimePicker}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          onServiceTypeChange={setServiceType}
          onNotesChange={setAdditionalNotes}
          onShowDatePicker={() => setShowDatePicker(true)}
          onShowTimePicker={() => setShowTimePicker(true)}
          onConfirm={handleBookingConfirm}
        />

        {/* Directions Modal with Navigation Start */}
        <DirectionsModal
          visible={showDirectionsModal}
          onClose={() => setShowDirectionsModal(false)}
          routeDetails={routeDetails}
          onBookPress={() => {
            setShowDirectionsModal(false);
            setShowBookingModal(true);
          }}
          onStartNavigation={handleStartNavigation}
        />

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={(event, time) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
          />
        )}

        {/* Error Toast */}
        {showError && (
          <ErrorToast
            message={errorMessage}
            type={errorType}
            duration={errorType === 'success' ? 2000 : 3000}
            onDismiss={() => setShowError(false)}
          />
        )}
      </View>
    </View>
  );
}