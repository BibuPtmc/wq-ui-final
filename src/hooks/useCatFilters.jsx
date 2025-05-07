import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useEnums from './useEnums';

export const useCatFilters = (formatValue) => {
  const { t } = useTranslation();
  const { enums, loading: enumsLoading, error: enumsError } = useEnums();
  const [filters, setFilters] = useState({
    breed: '',
    color: '',
    eyeColor: '',
    postalCode: '',
    location: {
      latitude: '',
      longitude: '',
      address: '',
      city: '',
      postalCode: '',
      radius: 10 // Rayon de recherche par défaut
    }
  });

  // Options pour les filtres avec valeur vide pour "Toutes les options"
  const colorSelectOptions = [
    { value: "", label: t('foundCats.allColors', 'Toutes les couleurs') },
    ...(enums?.catColor || []).map(opt => ({
      value: opt.value,
      label: opt.label
    }))
  ];

  const eyeColorSelectOptions = [
    { value: "", label: t('foundCats.allEyeColors', "Toutes les couleurs d'yeux") },
    ...(enums?.eyeColor || []).map(opt => ({
      value: opt.value,
      label: opt.label
    }))
  ];

  const breedSelectOptions = [
    { value: "", label: t('foundCats.allBreeds', "Toutes les races") },
    ...(enums?.breed || []).map(opt => ({
      value: opt.value,
      label: opt.label
    }))
  ];

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleLocationChange = useCallback((locationData) => {
    setFilters(prev => ({
      ...prev,
      location: {
        ...prev.location,
        ...locationData
      }
    }));
  }, []);

  const useCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        }
      );
    }
  }, [handleLocationChange]);

  const clearCurrentLocation = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: '',
        longitude: '',
        address: '',
        city: '',
        postalCode: ''
      }
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      breed: '',
      color: '',
      eyeColor: '',
      postalCode: '',
      location: {
        latitude: '',
        longitude: '',
        address: '',
        city: '',
        postalCode: '',
        radius: 10
      }
    });
  }, []);

  const applyFilters = useCallback((cats) => {
    return cats.filter(cat => {
      const catData = cat.cat;
      
      // Filtre par race
      if (filters.breed && catData.breed !== filters.breed) {
        return false;
      }
      
      // Filtre par couleur
      if (filters.color && catData.color !== filters.color) {
        return false;
      }
      
      // Filtre par couleur des yeux
      if (filters.eyeColor && catData.eyeColor !== filters.eyeColor) {
        return false;
      }
      
      // Filtre par code postal
      if (filters.postalCode && cat.location.postalCode !== filters.postalCode) {
        return false;
      }
      
      // Filtre par localisation (si des coordonnées sont définies)
      if (filters.location.latitude && filters.location.longitude) {
        const distance = calculateDistance(
          filters.location.latitude,
          filters.location.longitude,
          cat.location.latitude,
          cat.location.longitude
        );
        // Filtrer les chats dans le rayon défini
        if (distance > filters.location.radius) {
          return false;
        }
      }
      
      return true;
    });
  }, [filters]);

  // Fonction utilitaire pour calculer la distance entre deux points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return {
    filters,
    colorSelectOptions,
    eyeColorSelectOptions,
    breedSelectOptions,
    handleFilterChange,
    handleLocationChange,
    useCurrentLocation,
    clearCurrentLocation,
    resetFilters,
    applyFilters,
    enumsLoading,
    enumsError
  };
}; 