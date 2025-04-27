import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Alert, Row, Col } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AddressAutofill from './AddressAutofill';

// Utiliser la variable d'environnement
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;


const MapLocation = ({ 
  location, 
  onLocationChange,
  onAddressChange,
  isLocating,
  geoError,
  onGeoErrorDismiss,
  onRequestCurrentLocation,
  mapHeight = "300px",
  markers = [],
  showSearch = true,
  fitBoundsToMarkers = true,
  disableMapClick = false,
  mapRef = null // Nouvelle prop pour exposer la référence à la carte
}) => {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const markerRefs = useRef([]);
  const [addressValue, setAddressValue] = useState(location?.address || '');

  // Initialiser la carte
  const initializeMap = useCallback((longitude, latitude) => {
    if (!mapContainer.current || map.current) return;

    // Utiliser des coordonnées par défaut si non définies
    const lng = longitude || 4.3517;  
    const lat = latitude || 50.8503;  
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: 11,
      maxZoom: 16, // Limiter le zoom maximum pour réduire le chargement de tuiles détaillées
      minZoom: 8,  // Limiter le zoom minimum
      attributionControl: false, // Désactiver le contrôle d'attribution pour économiser des ressources
      preserveDrawingBuffer: false, // Améliore les performances
      localIdeographFontFamily: "'Noto Sans', 'Noto Sans CJK SC', sans-serif", // Utiliser les polices locales si disponibles
      fadeDuration: 0, // Désactiver les animations de fondu pour améliorer les performances
      trackResize: false // Désactiver le redimensionnement automatique
    });

    // Gérer les images manquantes
    map.current.on('styleimagemissing', (e) => {
      // Créer une image de remplacement pour les images manquantes
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d');
      
      // Dessiner un cercle jaune comme image de remplacement
      ctx.beginPath();
      ctx.arc(10, 10, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffcc00';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Ajouter l'image à la carte
      map.current.addImage(e.id, { width: 20, height: 20, data: new Uint8Array(ctx.getImageData(0, 0, 20, 20).data.buffer) });
    });

    // Ajouter le contrôle de navigation avec moins d'options
    map.current.addControl(new mapboxgl.NavigationControl({
      showCompass: false, // Masquer la boussole pour économiser des ressources
      showZoom: true
    }), 'top-right');
    
    // Ne pas ajouter le marqueur principal si disableMapClick est true
    if (onLocationChange && !disableMapClick) {
      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current);

      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        onLocationChange(lngLat.lng, lngLat.lat);
      });

      map.current.on('click', (e) => {
        if (!e.features || !e.features.length) {
          marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          onLocationChange(e.lngLat.lng, e.lngLat.lat);
        }
      });
    }

    map.current.on('load', () => {
      map.current.resize();
    });

    // Exposer la référence à la carte au composant parent
    if (mapRef) {
      mapRef.current = map.current;
    }
  }, [onLocationChange, disableMapClick, mapRef]);

  useEffect(() => {
    // Si nous avons des coordonnées valides, initialiser la carte
    if (location.longitude && location.latitude) {
      // Vérifier si la carte existe déjà et si les coordonnées ont changé significativement
      if (map.current) {
        // Mettre à jour le centre de la carte sans réinitialiser
        map.current.setCenter([location.longitude, location.latitude]);
      } else {
        // Initialiser la carte seulement si elle n'existe pas
        initializeMap(location.longitude, location.latitude);
      }
    } else {
      // Sinon utiliser les coordonnées par défaut
      if (!map.current) {
        initializeMap(2.3488, 48.8534);
      }
    }
    
    return () => {
      if (map.current) {
        markerRefs.current.forEach(marker => marker.remove());
        markerRefs.current = [];
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap, location?.longitude, location?.latitude]);

  // Mettre à jour le marqueur si les coordonnées changent en externe
  useEffect(() => {
    if (map.current && marker.current && location?.longitude && location?.latitude) {
      marker.current.setLngLat([location.longitude, location.latitude]);
      
      if (!markers.length) {
        map.current.flyTo({
          center: [location.longitude, location.latitude],
          essential: true
        });
      }
    }
  }, [location?.longitude, location?.latitude, markers]);

  // Mettre à jour l'adresse affichée lorsqu'elle change
  useEffect(() => {
    if (location?.address !== addressValue) {
      setAddressValue(location?.address || '');
    }
  }, [location?.address, addressValue]);

  // Gérer la sélection d'une adresse depuis l'autofill
  const handleLocationSelect = (locationData) => {
    // Mettre à jour le marqueur et la vue de la carte
    if (locationData.longitude && locationData.latitude) {
      onLocationChange(locationData.longitude, locationData.latitude); 
    }
    // Mettre à jour les détails de l'adresse
    if (onAddressChange) {
      onAddressChange({
        address: locationData.address,
        city: locationData.city,
        postalCode: locationData.postalCode
      });
    }
  };

  // Ajouter les marqueurs des chats
  useEffect(() => {
    if (!map.current) return;

    // Supprimer les anciens marqueurs
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];

    if (markers.length > 0) {
      // Créer un élément pour l'icône de chat
      const createCatIcon = () => {
        const el = document.createElement('div');
        el.className = 'cat-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundColor = 'white';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.fontSize = '18px';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.innerHTML = '🐈';
        
        return el;
      };

      const bounds = new mapboxgl.LngLatBounds();

      markers.forEach(markerData => {
        if (markerData.longitude && markerData.latitude) {
          bounds.extend([markerData.longitude, markerData.latitude]);
          
          // Créer un marqueur avec l'icône de chat
          const catMarker = new mapboxgl.Marker({
            element: createCatIcon()
          })
            .setLngLat([markerData.longitude, markerData.latitude])
            .addTo(map.current);

          if (markerData.popupContent) {
            catMarker.setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(markerData.popupContent)
            );
          }

          markerRefs.current.push(catMarker);
        }
      });

      // Ajuster la carte pour montrer tous les marqueurs si nécessaire
      if (fitBoundsToMarkers && bounds.isEmpty() === false) {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [markers, fitBoundsToMarkers]);

  return (
    <div className="map-component">
      {showSearch && (
        <Row className="mb-3">
          <Col>
            <AddressAutofill 
              value={addressValue}
              onChange={(value) => {
                setAddressValue(value);
                if (onAddressChange) {
                  onAddressChange({ address: value });
                }
              }}
              onLocationSelect={handleLocationSelect}
              placeholder={t('map.searchPlaceholder', 'Rechercher une adresse...')}
            />
          </Col>
        </Row>
      )}
      
      <div className="position-relative mb-2">
        <div 
          ref={mapContainer} 
          className="map-container rounded" 
          style={{ height: mapHeight, width: "100%" }}
        />
        {isLocating && (
          <div className="position-absolute top-50 start-50 translate-middle bg-white p-2 rounded shadow">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {t('map.locating', 'Localisation en cours...')}
          </div>
        )}
        {onRequestCurrentLocation && (
          <Button
            variant="primary"
            size="sm"
            className="position-absolute bottom-0 end-0 m-2"
            onClick={onRequestCurrentLocation}
          >
            <FaMapMarkerAlt className="me-1" /> {t('map.myPosition', 'Ma position')}
          </Button>
        )}
      </div>
      
      {geoError && (
        <Alert variant="warning" className="mt-2" onClose={onGeoErrorDismiss} dismissible>
          {geoError}
        </Alert>
      )}
      
      {showSearch && (
        <p className="text-muted mt-2">
          <small>{t('map.help', 'Recherchez une adresse ou cliquez sur la carte pour définir la localisation')}</small>
        </p>
      )}
    </div>
  );
};

export default MapLocation;
