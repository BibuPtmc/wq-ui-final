import React, { useEffect, useState, useCallback, useRef } from 'react';
import MapLocation from './MapLocation';
import api from '../../hooks/api';
import { Card, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { FaCat, FaMapMarkerAlt } from 'react-icons/fa';
import '../../styles/mapbox-popup.css'; 
import useGeolocation from '../../hooks/useGeolocation';
import { reverseGeocode } from '../../utils/geocodingService';
import { formatEnumValue } from '../../utils/enumUtils';

const LostCatsMap = ({ noLostCatsMessage }) => {
  const [lostCats, setLostCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({
    longitude: 4.3517,  // Bruxelles
    latitude: 50.8503,
    address: '',
    city: '',
    postalCode: ''
  });
  const [mapError, setMapError] = useState(null);
  
  // Utiliser le hook de géolocalisation
  const { getCurrentPosition, isLocating, geoError, setGeoError } = useGeolocation();

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const updateLocationFromCoordinates = useCallback(async (longitude, latitude) => {
    try {
      const addressInfo = await reverseGeocode(longitude, latitude);
  
      setSelectedLocation({
        longitude,
        latitude,
        address: addressInfo?.address || "",
        city: addressInfo?.city || "",
        postalCode: addressInfo?.postalCode || ""
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse:", error);
      setMapError("Erreur lors de la récupération de l'adresse");
    }
  }, []);

  // Fonction simplifiée pour mettre à jour uniquement les coordonnées sans géocodification inverse
  const handleLocationChange = useCallback((longitude, latitude) => {
    setSelectedLocation(prev => ({
      ...prev,
      longitude,
      latitude
    }));
  }, []);

  // Initialisation avec la position actuelle
  useEffect(() => {
    getCurrentPosition()
      .then(position => {
        updateLocationFromCoordinates(position.longitude, position.latitude);
      })
      .catch(error => {
        console.log("Utilisation de la position par défaut:", error.message);
      });
  }, [getCurrentPosition, updateLocationFromCoordinates]);

  useEffect(() => {
    const fetchLostCats = async () => {
      try {
        const response = await api.get('/cat/findLostCat');
        setLostCats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des chats perdus:', err);
        setError('Erreur lors du chargement des chats perdus');
        setLoading(false);
      }
    };

    fetchLostCats();
  }, []);

  // Utilisation de la fonction formatEnumValue centralisée

  // Création des marqueurs avec les photos des chats
  const markers = lostCats.map(catStatus => {
    // Vérifier que location existe
    if (!catStatus.location || !catStatus.location.longitude || !catStatus.location.latitude) {
      return null;
    }

    // Formatage de la date
    const reportDate = catStatus.reportDate 
      ? new Date(catStatus.reportDate).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : 'Date inconnue';
    
    // Utiliser l'image du chat depuis les données
    const catImage = catStatus.cat.imageCatData 
      ? `data:${catStatus.cat.type};base64,${catStatus.cat.imageCatData}` 
      : catStatus.cat.photoUrl || "/images/noImageCat.png";

    // Construction du HTML pour le popup sans inclure les styles inline
    return {
      longitude: catStatus.location.longitude,
      latitude: catStatus.location.latitude,
      popupContent: `
        <div class="cat-popup">
          <img src="${catImage}" alt="${catStatus.cat.name || 'Chat sans nom'}" class="cat-popup-img" onerror="this.src='/images/noImageCat.png'; this.onerror=null;">
          <h5 class="cat-popup-title">${catStatus.cat.name || 'Chat sans nom'}</h5>
          <p class="cat-popup-date">Signalé perdu le: ${reportDate}</p>
          
          <p class="cat-popup-info"><strong>Race:</strong> ${formatEnumValue(catStatus.cat.breed) || 'Non spécifiée'}</p>
          <p class="cat-popup-info"><strong>Genre:</strong> ${formatEnumValue(catStatus.cat.gender) || 'Non spécifié'}</p>
          <p class="cat-popup-info"><strong>Couleur:</strong> ${formatEnumValue(catStatus.cat.color) || 'Non spécifiée'}</p>
          <p class="cat-popup-info"><strong>Couleur des yeux:</strong> ${formatEnumValue(catStatus.cat.eyeColor) || 'Non spécifiée'}</p>
          ${catStatus.cat.dateOfBirth ? `<p class="cat-popup-info"><strong>Âge:</strong> ${calculateAge(catStatus.cat.dateOfBirth)} ans</p>` : ''}
          
          <a href="/lostCats" class="cat-popup-btn">Voir plus</a>
        </div>
      `
    };
  }).filter(marker => marker !== null); // Filtrer les marqueurs null

  const mapRef = useRef(null);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">Chargement des chats perdus...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center">
          <Alert variant="success">
            <Alert.Heading className="d-flex align-items-center justify-content-center">
              <FaCat className="me-2" />
              Bonne nouvelle !
            </Alert.Heading>
            <p className="mb-0">
              Aucun chat n'est perdu dans votre région pour le moment.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (lostCats.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>
            <FaCat className="me-2" />
            Chats perdus dans votre région
          </Card.Title>
          {noLostCatsMessage || (
            <Alert variant="info">
              Aucun chat perdu n'a été signalé dans votre région.
            </Alert>
          )}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header style={{ backgroundColor: 'var(--primary-color)' }} className="text-white">
        <div className="d-flex align-items-center">
          <FaMapMarkerAlt className="me-2" />
          <span>Carte des chats perdus</span>
          <Badge bg="light" text="dark" pill className="ms-2">
            {lostCats.length}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Button 
            variant="outline-primary" 
            className="w-100"
            onClick={() => {
              getCurrentPosition().then(position => {
                // Centrer la carte sur la position actuelle
                if (mapRef && mapRef.current) {
                  mapRef.current.flyTo({
                    center: [position.longitude, position.latitude],
                    essential: true,
                    zoom: 13
                  });
                }
              }).catch(error => {
                setGeoError(error.message);
              });
            }}
            disabled={isLocating}
          >
            <FaMapMarkerAlt className="me-2" />
            {isLocating ? 'Localisation en cours...' : 'Centrer sur ma position'}
          </Button>
        </div>
        <MapLocation
          location={selectedLocation}
          onLocationChange={handleLocationChange}
          onAddressChange={(addressData) => {
            setSelectedLocation({
              ...selectedLocation,
              ...addressData
            });
          }}
          isLocating={isLocating}
          geoError={geoError}
          onGeoErrorDismiss={() => setGeoError(null)}
          onRequestCurrentLocation={getCurrentPosition}
          mapHeight="500px"
          markers={markers}
          showSearch={false} // Désactiver la recherche d'adresse
          fitBoundsToMarkers={false} // Désactiver l'ajustement automatique aux marqueurs
          disableMapClick={true} // Désactiver les clics sur la carte pour ne pas interférer avec les marqueurs
          mapRef={mapRef}
        />
        {mapError && (
          <Alert variant="danger" className="mt-3" onClose={() => setMapError(null)} dismissible>
            {mapError}
          </Alert>
        )}
        <Alert style={{ backgroundColor: 'var(--secondary-color)' }} variant="info" className="text-white mt-3">
          <div className="d-flex align-items-center">
            <FaCat className="me-2" />
            <span>Cliquez sur les marqueurs pour voir les détails des chats perdus</span>
          </div>
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default LostCatsMap;