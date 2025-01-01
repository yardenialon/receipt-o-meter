export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

export const parseCoordinates = (address: string | null): { lat: number; lon: number } | null => {
  if (!address) return null;
  
  // Expected format: "lat,lon" or address string
  const coords = address.split(',').map(Number);
  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    return { lat: coords[0], lon: coords[1] };
  }
  return null;
};