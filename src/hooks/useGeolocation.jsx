import { useState, useCallback, useRef, useEffect } from "react";

export const useGeolocation = () => {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Permet d’éviter les mises à jour d’état après le démontage
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getCurrentPosition = useCallback(() => {
    setIsLocating(true);
    setGeoError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error(
          "La géolocalisation n'est pas prise en charge par votre navigateur"
        );
        if (isMounted.current) {
          setGeoError(error.message);
          setIsLocating(false);
        }
        reject(error);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted.current) {
            setIsLocating(false);
          }
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = "Erreur de géolocalisation";
          if (error.code === 1)
            errorMessage = "Permission de géolocalisation refusée";
          if (error.code === 2) errorMessage = "Position non disponible";
          if (error.code === 3) errorMessage = "Délai d'attente expiré";

          if (isMounted.current) {
            setGeoError(errorMessage);
            setIsLocating(false);
          }
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    getCurrentPosition,
    isLocating,
    geoError,
    setGeoError,
  };
};
