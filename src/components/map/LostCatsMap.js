import React, { useEffect, useState } from 'react';
import MapLocation from './MapLocation';
import api from '../../hooks/api';
import { Container, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaCat, FaMapMarkedAlt } from 'react-icons/fa';
import '../../styles/mapbox-popup.css'; 
import '../../styles/styles'; 



const LostCatsMap = () => {
  const [lostCats, setLostCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({
    longitude: 4.3517,  // Bruxelles
    latitude: 50.8503
  });

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
    
    // Vérifier la disponibilité de l'image
    // Si vous avez un endpoint qui sert les images des chats par ID
    const catImageUrl = catStatus.cat.catId 
      ? `/api/cats/${catStatus.cat.catId}/image` 
      : null;

    // Construction du HTML pour le popup sans inclure les styles inline
    return {
      longitude: catStatus.location.longitude,
      latitude: catStatus.location.latitude,
      popupContent: `
        <div class="cat-popup">
          ${catImageUrl 
            ? `<img src="${catImageUrl}" alt="${catStatus.cat.name}" class="cat-popup-img">`
            : `<div class="cat-popup-placeholder">
                <span>No Photo</span>
              </div>`
          }
          <h5 class="cat-popup-title">${catStatus.cat.name || 'Chat sans nom'}</h5>
          <p class="cat-popup-date">Signalé perdu le: ${reportDate}</p>
          
          <p class="cat-popup-info"><strong>Race:</strong> ${catStatus.cat.breed || 'Non spécifiée'}</p>
          ${catStatus.cat.dateOfBirth ? `<p class="cat-popup-info"><strong>Âge:</strong> ${calculateAge(catStatus.cat.dateOfBirth)} ans</p>` : ''}
          ${catStatus.comment ? `<p class="cat-popup-info"><strong>Commentaire:</strong> ${catStatus.comment}</p>` : ''}
          
          <a href="/chat/${catStatus.cat.catId}" class="cat-popup-btn">Voir plus</a>
        </div>
      `
    };
  }).filter(marker => marker !== null); // Filtrer les marqueurs null

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
          <Alert variant="info">
            Aucun chat perdu n'a été signalé dans votre région.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header style={{ backgroundColor: 'var(--primary-color)' }} className="text-white">
        <div className="d-flex align-items-center">
          <FaMapMarkedAlt className="me-2" />
          <span>Carte des chats perdus</span>
          <Badge bg="light" text="dark" pill className="ms-2">
            {lostCats.length}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        <MapLocation
          location={selectedLocation}
          onLocationChange={(lng, lat) => setSelectedLocation({ longitude: lng, latitude: lat })}
          mapHeight="500px"
          markers={markers}
          showSearch={true}
        />
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