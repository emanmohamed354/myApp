// hooks/useNavigation.js
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { getRouteToDestination } from '../services/routingService';

export const useNavigation = (userLocation, mapRef) => {
  const [showingRoute, setShowingRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [navigationMode, setNavigationMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const locationSubscription = useRef(null);

  const getRoute = async (destination) => {
    if (!userLocation || !destination) return;

    try {
      setLoading(true);
      
      const result = await getRouteToDestination(
        userLocation,
        destination.coordinate
      );

      if (result) {
        setRouteCoordinates(result.coordinates);
        setRouteDetails({
          ...result.details,
          destination: destination.name
        });

        // Fit map to show entire route
        const allCoordinates = [
          userLocation,
          ...result.coordinates
        ];

        mapRef.current?.fitToCoordinates(allCoordinates, {
          edgePadding: { top: 100, right: 50, bottom: 250, left: 50 },
          animated: true
        });

        setShowingRoute(true);
      }
    } catch (error) {
      console.error('Error getting route:', error);
      Alert.alert('Error', 'Unable to get directions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = async () => {
    setNavigationMode(true);
    setCurrentStep(0);

    // Start tracking user location
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (location) => {
        updateNavigationProgress(location);
        
        // Update map camera to follow user
        if (mapRef.current) {
          mapRef.current.animateCamera({
            center: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            pitch: 60,
            heading: location.coords.heading || 0,
            altitude: 500,
            zoom: 18,
          });
        }
      }
    );
  };

  const updateNavigationProgress = (location) => {
    // Calculate which step the user is on based on location
    // This is a simplified version - in production you'd want more sophisticated logic
    if (routeDetails && routeCoordinates.length > 0) {
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
      // Find closest point on route
      const stepSize = Math.floor(routeCoordinates.length / routeDetails.directions.length);
      const currentIndex = findClosestPointIndex(userCoords, routeCoordinates);
      const newStep = Math.floor(currentIndex / stepSize);
      
      if (newStep !== currentStep && newStep < routeDetails.directions.length) {
        setCurrentStep(newStep);
        
        // Check if arrived at destination
        if (newStep === routeDetails.directions.length - 1) {
          const distanceToEnd = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            routeCoordinates[routeCoordinates.length - 1].latitude,
            routeCoordinates[routeCoordinates.length - 1].longitude
          );
          
          if (distanceToEnd < 0.05) { // 50 meters
            Alert.alert('Arrived!', 'You have reached your destination.');
            stopNavigation();
          }
        }
      }
    }
  };

  const findClosestPointIndex = (userCoords, routeCoords) => {
    let closestIndex = 0;
    let minDistance = Infinity;
    
    routeCoords.forEach((coord, index) => {
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        coord.latitude,
        coord.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    return closestIndex;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const stopNavigation = () => {
    setNavigationMode(false);
    setCurrentStep(0);
    
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    // Reset map camera
    if (mapRef.current && userLocation) {
      mapRef.current.animateCamera({
        center: userLocation,
        pitch: 0,
        heading: 0,
        zoom: 15,
      });
    }
  };

  const clearRoute = () => {
    stopNavigation();
    setShowingRoute(false);
    setRouteCoordinates([]);
    setRouteDetails(null);
    
    // Re-center on user location
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  return {
    showingRoute,
    routeCoordinates,
    routeDetails,
    loading,
    navigationMode,
    currentStep,
    getRoute,
    clearRoute,
    startNavigation,
    stopNavigation
  };
};