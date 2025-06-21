// services/locationService.js
import { 
  calculateDistance, 
  formatAddress, 
  formatNominatimAddress,
  extractServices,
  getPriceRange,
  isCurrentlyOpen,
  generateTimeSlots,
  removeDuplicates
} from '../utils/locationUtils';

export const searchNearbyCarCenters = async (latitude, longitude) => {
  try {
    const radius = 10000; // 10km radius
    
    const overpassQuery = `
      [out:json][timeout:30];
      (
        node["shop"="car_repair"](around:${radius},${latitude},${longitude});
        node["amenity"="car_repair"](around:${radius},${latitude},${longitude});
        node["shop"="car"](around:${radius},${latitude},${longitude});
        node["shop"="car_parts"](around:${radius},${latitude},${longitude});
        way["shop"="car_repair"](around:${radius},${latitude},${longitude});
        way["amenity"="car_repair"](around:${radius},${latitude},${longitude});
        way["shop"="car"](around:${radius},${latitude},${longitude});
      );
      out body;
      >;
      out skel qt;
    `;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    
    const response = await fetch(overpassUrl);
    const data = await response.json();

    if (data.elements && data.elements.length > 0) {
      return processOverpassData(data.elements, latitude, longitude);
    } else {
      return searchWithNominatim(latitude, longitude);
    }
  } catch (error) {
    return searchWithNominatim(latitude, longitude);
  }
};

const processOverpassData = async (elements, userLat, userLon) => {
  const centers = [];
  
  for (const element of elements) {
    if (element.tags && (element.tags.name || element.tags['name:en'] || element.tags['name:ar'])) {
      const center = {
        id: element.id,
        name: element.tags.name || element.tags['name:en'] || element.tags['name:ar'] || 'Car Service Center',
        address: formatAddress(element.tags),
        coordinate: {
          latitude: element.lat || element.center?.lat,
          longitude: element.lon || element.center?.lon
        },
        phone: element.tags.phone || element.tags['contact:phone'] || 'Not available',
        website: element.tags.website || element.tags['contact:website'],
        openingHours: element.tags.opening_hours || 'Not specified',
        services: extractServices(element.tags),
        rating: Math.random() * (5 - 3.5) + 3.5,
        distance: calculateDistance(userLat, userLon, element.lat || element.center?.lat, element.lon || element.center?.lon),
        priceRange: getPriceRange(),
        isOpen: isCurrentlyOpen(element.tags.opening_hours),
        availableSlots: generateTimeSlots()
      };

      if (center.coordinate.latitude && center.coordinate.longitude) {
        centers.push(center);
      }
    }
  }

  return centers
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10)
    .map(center => ({
      ...center,
      distance: `${center.distance.toFixed(1)} km`
    }));
};

const searchWithNominatim = async (latitude, longitude) => {
  try {
    const searchQueries = [
      'car repair',
      'auto service',
      'car maintenance',
      'مركز صيانة سيارات',
      'ورشة سيارات'
    ];

    let allResults = [];

    for (const query of searchQueries) {
      const url = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `limit=20&` +
        `viewbox=${longitude-0.1},${latitude-0.1},${longitude+0.1},${latitude+0.1}&` +
        `bounded=1&` +
        `addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CarMaintenanceApp/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        allResults = [...allResults, ...data];
      }
    }

    const uniqueResults = removeDuplicates(allResults);
    return processNominatimData(uniqueResults, latitude, longitude);
  } catch (error) {
    throw error;
  }
};

const processNominatimData = (results, userLat, userLon) => {
  const centers = results
    .filter(result => result.lat && result.lon)
    .map((result, index) => ({
      id: result.place_id || index,
      name: result.display_name.split(',')[0],
      address: formatNominatimAddress(result),
      coordinate: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      },
      phone: 'Contact for details',
      services: ['General Maintenance', 'Oil Change', 'Tire Service'],
      rating: Math.random() * (5 - 3.5) + 3.5,
      distance: calculateDistance(userLat, userLon, parseFloat(result.lat), parseFloat(result.lon)),
      priceRange: getPriceRange(),
      isOpen: true,
      availableSlots: generateTimeSlots()
    }));

  return centers
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10)
    .map(center => ({
      ...center,
      distance: `${center.distance.toFixed(1)} km`
    }));
};

// Enhanced navigation functions
export const detectCurrentStep = (userLocation, routeCoordinates, directions) => {
  // Find the closest point on the route
  let closestIndex = 0;
  let minDistance = Infinity;
  
  routeCoordinates.forEach((coord, index) => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      coord.latitude,
      coord.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  // Calculate which step based on progress
  const progress = closestIndex / routeCoordinates.length;
  const currentStep = Math.floor(progress * directions.length);
  
  // Check if user is off route
  const isOffRoute = minDistance > 0.05; // 50 meters
  
  return {
    currentStep: Math.min(currentStep, directions.length - 1),
    isOffRoute,
    distanceToRoute: minDistance,
    closestPointIndex: closestIndex
  };
};

export const calculateETAToDestination = (currentLocation, destination, trafficFactor = 1.2) => {
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    destination.latitude,
    destination.longitude
  );
  
  // Assume average speed of 40 km/h in city
  const avgSpeed = 40;
  const timeInHours = (distance / avgSpeed) * trafficFactor;
  const timeInMinutes = Math.ceil(timeInHours * 60);
  
  const eta = new Date();
  eta.setMinutes(eta.getMinutes() + timeInMinutes);
  
  return {
    minutes: timeInMinutes,
    arrivalTime: eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export const getNextManeuverDistance = (userLocation, routeCoordinates, currentStep, directions) => {
  if (!directions[currentStep]) return null;
  
  // Find the start point of the next maneuver
  const stepsPerDirection = Math.floor(routeCoordinates.length / directions.length);
  const nextStepStartIndex = (currentStep + 1) * stepsPerDirection;
  
  if (nextStepStartIndex >= routeCoordinates.length) return null;
  
  const nextStepCoordinate = routeCoordinates[nextStepStartIndex];
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    nextStepCoordinate.latitude,
    nextStepCoordinate.longitude
  );
  
  return {
    distance: distance * 1000, // Convert to meters
    coordinate: nextStepCoordinate
  };
};

export const shouldAnnounceDirection = (distanceToNextStep) => {
  // Announce at different distances based on speed
  const announceDistances = [500, 200, 50]; // meters
  
  for (const distance of announceDistances) {
    if (Math.abs(distanceToNextStep - distance) < 20) {
      return { shouldAnnounce: true, distance };
    }
  }
  
  return { shouldAnnounce: false, distance: null };
};

export const recalculateRoute = async (userLocation, destination) => {
  // This would call the routing service to get a new route
  // Similar to getRouteToDestination but from current location
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      const coordinates = route.geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      
      const distance = (route.distance / 1000).toFixed(1);
      const duration = Math.ceil(route.duration / 60);
      
      const directions = route.legs[0].steps.map((step, index) => ({
        instruction: step.maneuver.instruction || `Step ${index + 1}`,
        distance: (step.distance / 1000).toFixed(1) + ' km',
        duration: Math.ceil(step.duration / 60) + ' min',
        type: step.maneuver.type,
        modifier: step.maneuver.modifier
      }));

      return {
        coordinates,
        details: {
          distance,
          duration,
          directions
        }
      };
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};