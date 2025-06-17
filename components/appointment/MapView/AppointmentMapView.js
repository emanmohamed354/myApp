// components/appointment/MapView/AppointmentMapView.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import tw from 'twrnc';
import UserLocationMarker from './UserLocationMarker';
import CenterMarker from './CenterMarker';
import RoutePolyline from './RoutePolyline';
import RouteInfoBar from './RouteInfoBar';
import SelectedCenterInfo from './SelectedCenterInfo';
import NavigationOverlay from './NavigationOverlay';
import { MAP_CONFIG } from '../../../utils/constants';

export default function AppointmentMapView({
  mapRef,
  userLocation,
  maintenanceCenters,
  selectedCenter,
  showingRoute,
  routeCoordinates,
  routeDetails,
  onMarkerPress,
  onBookPress,
  onDirectionsPress,
  onClearRoute,
  onViewDirections,
  navigationMode,
  currentStep,
  onStartNavigation
}) {
  const [localSelectedCenter, setLocalSelectedCenter] = useState(selectedCenter);

  React.useEffect(() => {
    setLocalSelectedCenter(selectedCenter);
  }, [selectedCenter]);

  const handleDismissCenter = () => {
    setLocalSelectedCenter(null);
  };

  return (
    <View style={tw`flex-1`}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={tw`flex-1`}
        initialRegion={{
          latitude: userLocation?.latitude || 30.0444,
          longitude: userLocation?.longitude || 31.2357,
          ...MAP_CONFIG.DEFAULT_DELTA
        }}
        showsUserLocation={true}
        showsMyLocationButton={!navigationMode}
        showsCompass={!navigationMode}
        customMapStyle={darkMapStyle}
        pitchEnabled={navigationMode}
        rotateEnabled={navigationMode}
        scrollEnabled={!navigationMode}
        zoomEnabled={!navigationMode}
      >
        {/* User Location Marker */}
        {userLocation && !navigationMode && (
          <UserLocationMarker coordinate={userLocation} />
        )}

        {/* Route Polyline */}
        {showingRoute && routeCoordinates.length > 0 && (
          <RoutePolyline 
            coordinates={routeCoordinates} 
            navigationMode={navigationMode}
            currentStep={currentStep}
          />
        )}

        {/* Car Center Markers */}
        {!navigationMode && maintenanceCenters.map((center) => (
          <CenterMarker
            key={center.id}
            center={center}
            isSelected={localSelectedCenter?.id === center.id}
            onPress={() => {
              onMarkerPress(center);
              setLocalSelectedCenter(center);
            }}
          />
        ))}
      </MapView>

      {/* Navigation Overlay */}
      {navigationMode && routeDetails && (
        <NavigationOverlay
          routeDetails={routeDetails}
          currentStep={currentStep}
          userLocation={userLocation}
          onExitNavigation={onClearRoute}
        />
      )}

      {/* Route Info Bar - Show when route is displayed but not in navigation mode */}
      {showingRoute && routeDetails && !navigationMode && (
        <RouteInfoBar
          routeDetails={routeDetails}
          onClearRoute={onClearRoute}
          onViewDirections={onViewDirections}
          onStartNavigation={onStartNavigation}
        />
      )}

      {/* Selected Center Info */}
      {localSelectedCenter && !showingRoute && (
        <SelectedCenterInfo
          center={localSelectedCenter}
          onBookPress={onBookPress}
          onDirectionsPress={() => onDirectionsPress(localSelectedCenter)}
          onDismiss={handleDismissCenter}
        />
      )}
    </View>
  );
}

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  }
];