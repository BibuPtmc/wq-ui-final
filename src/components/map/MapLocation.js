// src/components/map/MapLocation.js
import React, { useEffect, useRef, useCallback } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';

// Utiliser la variable d'environnement
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapLocation = ({ 
  location, 
  onLocationChange,
  isLocating,
  geoError,
  onGeoErrorDismiss,
  onRequestCurrentLocation,
  mapHeight = "300px"
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Initialiser la carte
  const initializeMap = useCallback((longitude, latitude) => {
    if (!mapContainer.current || map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom: 13
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current.getLngLat();
      onLocationChange(lngLat.lng, lngLat.lat);
    });

    map.current.on('click', (e) => {
      marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      onLocationChange(e.lngLat.lng, e.lngLat.lat);
    });
  }, [onLocationChange]);

  useEffect(() => {
    initializeMap(location.longitude, location.latitude);
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap, location.longitude, location.latitude]);

  // Mettre à jour le marqueur si les coordonnées changent en externe
  useEffect(() => {
    if (map.current && marker.current) {
      marker.current.setLngLat([location.longitude, location.latitude]);
      
      map.current.flyTo({
        center: [location.longitude, location.latitude],
        essential: true
      });
    }
  }, [location.longitude, location.latitude]);

  return (
    <div className="map-component">
      <div className="position-relative mb-2">
        <div 
          ref={mapContainer} 
          className="map-container rounded" 
          style={{ height: mapHeight, width: "100%" }}
        />
        {isLocating && (
          <div className="position-absolute top-50 start-50 translate-middle bg-white p-2 rounded shadow">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Localisation en cours...
          </div>
        )}
        <Button
          variant="primary"
          size="sm"
          className="position-absolute bottom-0 end-0 m-2"
          onClick={onRequestCurrentLocation}
        >
          <FaMapMarkerAlt className="me-1" /> Ma position
        </Button>
      </div>
      {geoError && (
        <Alert variant="warning" className="mt-2" onClose={onGeoErrorDismiss} dismissible>
          {geoError}
        </Alert>
      )}
      <p className="text-muted mt-2">
        <small>Cliquez sur la carte pour définir la localisation ou déplacez le marqueur</small>
      </p>
    </div>
  );
};

export default MapLocation;
