import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

interface Result {
  location: Coords | null;
  permissionDenied: boolean;
  requestLocation: () => void;
}

export function useLocation(): Result {
  const [location, setLocation] = useState<Coords | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionDenied(true);
          return;
        }
        setPermissionDenied(false);
        const position = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      } catch {
        setPermissionDenied(true);
      }
    })();
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, permissionDenied, requestLocation };
}
