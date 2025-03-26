import React, { useEffect, useState } from "react";
import { useAxios } from "../../hooks/useAxios";
import { Card, Button, Container, Row, Col, Spinner, Badge, Form, InputGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaTimes, FaCalendar } from "react-icons/fa";
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

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Si le mois de naissance n'est pas encore arrivé cette année ou 
    // si c'est le même mois mais que le jour n'est pas encore arrivé
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Format de l'âge
    if (age < 1) {
      // Calculer l'âge en mois
      const ageInMonths = today.getMonth() - birthDate.getMonth() + 
        (today.getFullYear() - birthDate.getFullYear()) * 12;
      return `${ageInMonths} mois`;
    } else {
      return `${age} an${age > 1 ? 's' : ''}`;
    }
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
      // Skip if no cats or if we're already loading matches
      if (lostCats.length === 0 || Object.values(loadingMatches).some(isLoading => isLoading)) {
        return;
      }

      // Check if we already have match counts for all cats
      const allCatsHaveMatchCounts = lostCats.every(
        catStatus => typeof matchCounts[catStatus.cat.catId] !== 'undefined'
      );
      
      // Skip if we already have all match counts
      if (allCatsHaveMatchCounts) {
        return;
      }
      
      // Only fetch for cats that don't have match counts yet
      const catsToFetch = lostCats.filter(
        catStatus => typeof matchCounts[catStatus.cat.catId] === 'undefined'
      );
      
      if (catsToFetch.length === 0) {
        return;
      }
      
      const counts = { ...matchCounts };
      const loading = { ...loadingMatches };
      
      // Set loading state for cats we're about to fetch
      catsToFetch.forEach(catStatus => {
        loading[catStatus.cat.catId] = true;
      });
      setLoadingMatches(loading);
      
      // Fetch match counts sequentially to avoid too many simultaneous requests
      for (const catStatus of catsToFetch) {
        const catId = catStatus.cat.catId;
        try {
          const matchResults = await findPotentialFoundCats(catId);
          counts[catId] = matchResults.length;
          loading[catId] = false;
          
          // Update state after each fetch to show progress
          setMatchCounts({ ...counts });
          setLoadingMatches({ ...loading });
        } catch (error) {
          console.error(`Error fetching matches for cat ${catId}:`, error);
          counts[catId] = 0;
          loading[catId] = false;
        }
      }
    };
    
    fetchMatchCounts();
  }, [lostCats, matchCounts, loadingMatches, findPotentialFoundCats]); // eslint-disable-line react-hooks/exhaustive-deps
  // We're intentionally not re-running this effect when findPotentialFoundCats changes
  // to prevent an infinite loop of API calls

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
                    <Card className="cat-card shadow-sm h-100">
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={`data:${cat.type};base64,${cat.imageCatData}`}
                          alt={cat.name}
                          onError={(e) => {
                            e.target.src = "/images/noImageCat.png";
                            e.target.onerror = null;
                          }}
                          style={{ 
                            height: "220px", 
                            width: "100%",
                            objectFit: "cover",
                            backgroundColor: "#f8f9fa"
                          }}
                        />
                        <div 
                          className="position-absolute top-0 end-0 m-2"
                        >
                          <Badge
                            bg={cat.gender === "MALE" ? "primary" : "danger"}
                            className="px-2 py-1"
                            style={{ fontSize: '0.8rem' }}
                          >
                            {formatValue(cat.gender)}
                          </Badge>
                        </div>
                        <div 
                          className="position-absolute bottom-0 start-0 w-100 p-2"
                          style={{ 
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                            borderBottomLeftRadius: 'calc(0.375rem - 1px)',
                            borderBottomRightRadius: 'calc(0.375rem - 1px)'
                          }}
                        >
                          <h5 className="card-title text-white mb-0">{cat.name || "Chat sans nom"}</h5>
                          <p className="card-text text-white-50 small mb-0">
                            {formatValue(cat.breed) || "Race inconnue"}
                          </p>
                        </div>
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <div 
                              className="rounded-circle me-2" 
                              style={{ 
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: cat.color ? cat.color.toLowerCase() : '#ccc',
                                border: '1px solid rgba(0,0,0,0.2)'
                              }}
                            ></div>
                            <small className="text-muted">
                              Couleur: {formatValue(cat.color) || "Inconnue"}
                            </small>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <FaCalendar className="me-2 text-muted" style={{ fontSize: '0.8rem' }}></FaCalendar>
                            <small className="text-muted">
                              Âge: {cat.dateOfBirth ? calculateAge(cat.dateOfBirth) : "Inconnu"}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-muted" style={{ fontSize: '0.8rem' }}></FaMapMarkerAlt>
                            <small className="text-muted">
                              Perdu le: {new Date(catStatus.reportDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </small>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <div className="d-grid gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShow(catStatus)}
                              className="d-flex align-items-center justify-content-center"
                            >
                              <i className="bi bi-info-circle me-1"></i>
                              Plus d'informations
                            </Button>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="d-flex align-items-center justify-content-center"
                              onClick={() => handleShowMatches(cat)}
                              disabled={loadingMatches[cat.catId]}
                            >
                              {loadingMatches[cat.catId] ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Recherche...
                                </>
                              ) : (
                                <>
                                  <FaSearch className="me-1" />
                                  {matchCounts[cat.catId] ? 
                                    `${matchCounts[cat.catId]} correspondance${matchCounts[cat.catId] > 1 ? 's' : ''}` : 
                                    'Rechercher des correspondances'}
                                </>
                              )}
                            </Button>
                          </div>
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
