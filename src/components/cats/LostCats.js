import React, { useEffect, useState } from "react";
import { useAxios } from "../../hooks/useAxios";
import { Card, Button, Container, Row, Col, Spinner, Badge, Form, InputGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaPaw, FaFilter, FaSearch, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import "../../styles/global.css";
import CatDetails from "../profile/CatDetails";
import { useCats } from "../../hooks/useCats";
import MatchingResults from "./MatchingResults";
import Select from "react-select";
import catBreeds from "../../CatBreeds";

function LostCats() {
  const [lostCats, setLostCats] = useState([]);
  const [filteredCats, setFilteredCats] = useState([]);
  const axios = useAxios();
  const { findPotentialFoundCats } = useCats();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);
  const [matchCounts, setMatchCounts] = useState({});
  const [loadingMatches, setLoadingMatches] = useState({});
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  // const { } = useGeolocation();

  // Fonction pour formater les valeurs avec underscore en format plus lisible
  const formatValue = (value) => {
    if (!value) return "";
    
    // Remplacer les underscores par des espaces et mettre en forme (première lettre en majuscule, reste en minuscule)
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Filtres
  const [filters, setFilters] = useState({
    breed: "",
    color: "",
    eyeColor: "",
    postalCode: "",
    location: {
      latitude: "",
      longitude: "",
      radius: 10, // Rayon par défaut en km
      address: "" // Pour stocker l'adresse complète
    }
  });

  // Options pour les filtres
  const colorOptions = [
    { value: "", label: "Toutes les couleurs" },
    { value: "NOIR", label: formatValue("NOIR") },
    { value: "BLANC", label: formatValue("BLANC") },
    { value: "GRIS", label: formatValue("GRIS") },
    { value: "ROUX", label: formatValue("ROUX") },
    { value: "MIXTE", label: formatValue("MIXTE") },
    { value: "AUTRE", label: formatValue("AUTRE") }
  ];

  const eyeColorOptions = [
    { value: "", label: "Toutes les couleurs d'yeux" },
    { value: "BLEU", label: formatValue("BLEU") },
    { value: "VERT", label: formatValue("VERT") },
    { value: "JAUNE", label: formatValue("JAUNE") },
    { value: "MARRON", label: formatValue("MARRON") },
    { value: "NOISETTE", label: formatValue("NOISETTE") },
    { value: "AUTRE", label: formatValue("AUTRE") }
  ];

  const breedOptions = [
    { value: "", label: "Toutes les races" },
    ...catBreeds.map(breed => ({ value: breed.value, label: formatValue(breed.value) }))
  ];

  const handleClose = () => setShow(false);
  const handleShow = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShow(true);
  };

  const handleShowMatches = async (cat) => {
    const matchResults = await findPotentialFoundCats(cat.catId);
    setMatches(matchResults);
    setShowMatches(true);
  };

  const handleCloseMatches = () => {
    setShowMatches(false);
  };

  useEffect(() => {
    const fetchLostCats = async () => {
      try {
        const response = await axios.get("cat/findLostCat");
        setLoading(false);
        setLostCats(response);
        setFilteredCats(response);
      } catch (error) {
        console.error("Error fetching lost cats:", error);
        setLoading(false);
      }
    };
    if (loading) {
      fetchLostCats();
    }
  }, [axios, loading]);

  useEffect(() => {
    const fetchMatchCounts = async () => {
      const counts = {};
      const loading = {};
      for (const catStatus of lostCats) {
        loading[catStatus.cat.catId] = true;
        const matchResults = await findPotentialFoundCats(catStatus.cat.catId);
        counts[catStatus.cat.catId] = matchResults.length;
        loading[catStatus.cat.catId] = false;
      }
      setMatchCounts(counts);
      setLoadingMatches(loading);
    };
    if (lostCats.length > 0) {
      fetchMatchCounts();
    }
  }, [lostCats, findPotentialFoundCats]);

  // Fonction pour calculer la distance entre deux points géographiques en km (formule de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance en km
    return distance;
  };

  // Fonction pour obtenir l'adresse à partir des coordonnées
  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.display_name) {
        setFilters(prev => ({
          ...prev,
          location: {
            ...prev.location,
            address: data.display_name
          }
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse:", error);
    }
  };

  // Fonction pour utiliser la position actuelle
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          setFilters({
            ...filters,
            postalCode: "",
            location: {
              ...filters.location,
              latitude: latitude,
              longitude: longitude,
              address: "Récupération de l'adresse..." // Message temporaire pendant le chargement
            }
          });
          
          // Récupérer l'adresse complète
          getAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          alert("Impossible d'obtenir votre position actuelle. Veuillez vérifier vos paramètres de localisation.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas prise en charge par votre navigateur.");
    }
  };

  // Fonction pour gérer les changements de filtres
  const handleFilterChange = (field, value) => {
    if (field === 'postalCode' && value) {
      // Si l'utilisateur entre un code postal, réinitialiser les coordonnées de localisation
      setFilters({
        ...filters,
        postalCode: value,
        location: {
          ...filters.location,
          latitude: "",
          longitude: "",
          address: ""
        }
      });
    } else if (field.startsWith('location.')) {
      const locationField = field.split('.')[1];
      setFilters({
        ...filters,
        location: {
          ...filters.location,
          [locationField]: value
        }
      });
    } else {
      setFilters({
        ...filters,
        [field]: value
      });
    }
  };

  // Appliquer les filtres
  const applyFilters = () => {
    let result = [...lostCats];
    
    // Filtre par race
    if (filters.breed) {
      result = result.filter(catStatus => catStatus.cat.breed === filters.breed);
    }
    
    // Filtre par couleur
    if (filters.color) {
      result = result.filter(catStatus => catStatus.cat.color === filters.color);
    }
    
    // Filtre par couleur des yeux
    if (filters.eyeColor) {
      result = result.filter(catStatus => catStatus.cat.eyeColor === filters.eyeColor);
    }
    
    // Filtre par code postal
    if (filters.postalCode) {
      result = result.filter(catStatus => {
        // Vérifier si la localisation existe
        if (!catStatus.location) return false;
        
        // Vérifier si le code postal correspond (recherche partielle)
        return catStatus.location.postalCode && 
          catStatus.location.postalCode.includes(filters.postalCode);
      });
    }
    
    // Filtre par localisation et rayon
    if (filters.location.latitude && filters.location.longitude && filters.location.radius) {
      result = result.filter(catStatus => {
        if (!catStatus.location || !catStatus.location.latitude || !catStatus.location.longitude) {
          return false;
        }
        
        const distance = calculateDistance(
          parseFloat(filters.location.latitude),
          parseFloat(filters.location.longitude),
          parseFloat(catStatus.location.latitude),
          parseFloat(catStatus.location.longitude)
        );
        
        return distance <= filters.location.radius;
      });
    }
    
    setFilteredCats(result);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      breed: "",
      color: "",
      eyeColor: "",
      postalCode: "",
      location: {
        latitude: "",
        longitude: "",
        radius: 10,
        address: ""
      }
    });
    setFilteredCats(lostCats);
  };

  if (loading) {
    return (
      <Container className="loading-container">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="main-container">
      <h1 className="text-center mb-4">Chats Perdus</h1>
      
      {/* Section de filtres */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <div>
            <FaFilter className="me-2" />
            <span>Filtres</span>
          </div>
          <Button 
            variant="link" 
            className="p-0 text-dark" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Masquer" : "Afficher"}
          </Button>
        </Card.Header>
        
        {showFilters && (
          <Card.Body>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Race</Form.Label>
                  <Select
                    value={breedOptions.find(option => option.value === filters.breed)}
                    onChange={(option) => handleFilterChange('breed', option ? option.value : "")}
                    options={breedOptions}
                    isClearable
                    placeholder="Sélectionner une race"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Couleur</Form.Label>
                  <Select
                    value={colorOptions.find(option => option.value === filters.color)}
                    onChange={(option) => handleFilterChange('color', option ? option.value : "")}
                    options={colorOptions}
                    isClearable
                    placeholder="Sélectionner une couleur"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Couleur des yeux</Form.Label>
                  <Select
                    value={eyeColorOptions.find(option => option.value === filters.eyeColor)}
                    onChange={(option) => handleFilterChange('eyeColor', option ? option.value : "")}
                    options={eyeColorOptions}
                    isClearable
                    placeholder="Sélectionner une couleur d'yeux"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mt-4">
              <h6 className="mb-3">Localisation</h6>
              <Col md={6} className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Code postal"
                  value={filters.postalCode}
                  onChange={(e) => handleFilterChange('postalCode', e.target.value)}
                  disabled={filters.location.latitude && filters.location.longitude}
                />
              </Col>
              
              <Col md={6} className="mb-3">
                <InputGroup>
                  <Form.Control
                    type="number"
                    min="1"
                    max="100"
                    value={filters.location.radius}
                    onChange={(e) => handleFilterChange('location.radius', parseInt(e.target.value) || 10)}
                  />
                  <InputGroup.Text>km</InputGroup.Text>
                </InputGroup>
              </Col>
              
              <Col md={12} className="mb-3">
                <div className="d-flex">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={useCurrentLocation}
                    className="me-2 flex-grow-1"
                    disabled={filters.postalCode !== ""}
                  >
                    <FaMapMarkerAlt className="me-1" />
                    Utiliser ma position actuelle
                  </Button>
                  
                  {(filters.location.latitude && filters.location.longitude) && (
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => setFilters({
                        ...filters,
                        location: {
                          ...filters.location,
                          latitude: "",
                          longitude: "",
                          address: ""
                        }
                      })}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </div>
                
                {filters.location.latitude && filters.location.longitude && (
                  <small className="text-muted d-block mt-2 text-center">
                    {filters.location.address || `Position: ${filters.location.latitude.toFixed(6)}, ${filters.location.longitude.toFixed(6)}`}
                  </small>
                )}
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="outline-secondary" className="me-2" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button variant="primary" onClick={applyFilters}>
                <FaSearch className="me-2" />
                Appliquer les filtres
              </Button>
            </div>
          </Card.Body>
        )}
      </Card>
      
      {filteredCats.length > 0 ? (
        <>
          <div className="text-center mb-4">
            <Badge bg="info" className="px-3 py-2">
              {filteredCats.length} chats perdus
            </Badge>
          </div>
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredCats.map((catStatus) => {
              const cat = catStatus.cat;
              return (
                <Col key={cat.catId}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="cat-card shadow-sm">
                      <Card.Img
                        variant="top"
                        src={`data:${cat.type};base64,${cat.imageCatData}`}
                        alt={cat.name}
                        onError={(e) => {
                          e.target.src = "/images/noImageCat.png";
                          e.target.onerror = null;
                        }}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="mb-0">{cat.name || "Chat sans nom"}</Card.Title>
                          <Badge
                            bg={cat.gender === "Mâle" ? "primary" : "danger"}
                            className="ms-2"
                          >
                            {formatValue(cat.gender)}
                          </Badge>
                        </div>
                        <Card.Text className="text-muted small mb-2">
                          Race: {formatValue(cat.breed) || "Inconnue"}
                        </Card.Text>
                        <Card.Text className="text-muted small mb-2">
                          Date de naissance: {cat.dateOfBirth ? new Date(cat.dateOfBirth).toLocaleDateString() : "Inconnue"}
                        </Card.Text>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              Perdu le: {new Date(catStatus.reportDate).toLocaleDateString()}
                            </small>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShow(catStatus)}
                              className="rounded-pill"
                            >
                              Plus d'infos
                            </Button>
                          </div>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="w-100"
                            onClick={() => handleShowMatches(cat)}
                            disabled={loadingMatches[cat.catId]}
                          >
                            <FaPaw className="me-2" />
                            {loadingMatches[cat.catId] ? 'Chargement...' : 
                              matchCounts[cat.catId] ? 
                              `${matchCounts[cat.catId]} correspondance${matchCounts[cat.catId] > 1 ? 's' : ''} trouvée${matchCounts[cat.catId] > 1 ? 's' : ''}` : 
                              'Aucune correspondance'}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              );
            })}
          </Row>
        </>
      ) : (
        <div className="text-center py-5">
          <h3>Aucun chat perdu ne correspond à vos critères</h3>
          <p className="text-muted">
            Essayez de modifier vos filtres ou revenez plus tard.
          </p>
          <Button variant="outline-primary" onClick={resetFilters}>
            Réinitialiser les filtres
          </Button>
        </div>
      )}

      {/* CatDetails Modal */}
      <CatDetails 
        selectedCatStatus={selectedCatStatus} 
        handleClose={handleClose} 
        show={show}
      />

      <MatchingResults
        matches={matches}
        show={showMatches}
        handleClose={handleCloseMatches}
        onViewDetails={(catStatus) => {
          handleCloseMatches();
          handleShow(catStatus);
        }}
      />
    </Container>
  );
}

export default LostCats;
