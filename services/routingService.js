// services/routingService.js
export const getRouteToDestination = async (origin, destination) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Extract coordinates for polyline
      const coordinates = route.geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      
      // Extract route details
      const distance = (route.distance / 1000).toFixed(1); // Convert to km
      const duration = Math.ceil(route.duration / 60); // Convert to minutes
      
      // Extract turn-by-turn directions
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
    console.error('Error getting route:', error);
    throw error;
  }
};