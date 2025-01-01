import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location');
        setIsLoading(false);
      }
    );
  }, []);

  return { location, error, isLoading };
};