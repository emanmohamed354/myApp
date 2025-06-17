// utils/locationUtils.js
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

export const formatAddress = (tags) => {
  const parts = [];
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
  
  return parts.length > 0 ? parts.join(', ') : 'Address not specified';
};

export const formatNominatimAddress = (result) => {
  if (result.address) {
    const { road, house_number, suburb, city, state } = result.address;
    const parts = [house_number, road, suburb, city, state].filter(Boolean);
    return parts.join(', ');
  }
  return result.display_name.split(',').slice(1, 3).join(',').trim();
};

export const extractServices = (tags) => {
  const services = [];
  if (tags.service) services.push(...tags.service.split(';'));
  if (tags['service:vehicle:car_repair'] === 'yes') services.push('Car Repair');
  if (tags['service:vehicle:oil_change'] === 'yes') services.push('Oil Change');
  if (tags['service:vehicle:tyres'] === 'yes') services.push('Tire Service');
  if (tags['service:vehicle:batteries'] === 'yes') services.push('Battery Service');
  
  return services.length > 0 ? services : ['General Car Service'];
};

export const getPriceRange = () => {
  const ranges = ['$', '$$', '$$$'];
  return ranges[Math.floor(Math.random() * ranges.length)];
};

export const isCurrentlyOpen = (openingHours) => {
  if (!openingHours) return true;
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= 8 && currentHour < 18;
};

export const generateTimeSlots = () => {
  const slots = [];
  const hours = [8, 9, 10, 11, 14, 15, 16];
  for (const hour of hours) {
    if (Math.random() > 0.3) {
      slots.push(`${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`);
    }
  }
  return slots.length > 0 ? slots : ['9:00 AM', '2:00 PM', '4:00 PM'];
};

export const removeDuplicates = (results) => {
  const seen = new Set();
  return results.filter(item => {
    const key = `${item.lat}-${item.lon}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};