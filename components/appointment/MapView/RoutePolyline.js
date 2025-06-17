// components/appointment/MapView/RoutePolyline.js
import React from 'react';
import { Polyline } from 'react-native-maps';

export default function RoutePolyline({ coordinates, navigationMode, currentStep }) {
  if (navigationMode) {
    // Split route into completed and remaining parts
    const stepProgress = currentStep || 0;
    const completedCoords = coordinates.slice(0, Math.floor(coordinates.length * (stepProgress / 10)));
    const remainingCoords = coordinates.slice(Math.floor(coordinates.length * (stepProgress / 10)));

    return (
      <>
        {/* Completed route */}
        {completedCoords.length > 0 && (
          <Polyline
            coordinates={completedCoords}
            strokeColor="#6B7280"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
        {/* Active route */}
        <Polyline
          coordinates={remainingCoords}
          strokeColor="#3B82F6"
          strokeWidth={5}
          lineDashPattern={[0]}
        />
      </>
    );
  }

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor="#3B82F6"
      strokeWidth={4}
      lineDashPattern={[0]}
    />
  );
}