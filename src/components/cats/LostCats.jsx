import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col, Spinner, Badge, Form, InputGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import "../../styles/global.css";
import CatDetails from "../profile/CatDetails";
import MatchingResults from "./MatchingResults";
import Select from "react-select";
import catBreeds from "../../CatBreeds";
import { colorOptions as colorChoices, eyeColorOptions as eyeColorChoices } from "../../utils/enumOptions";
// Importation du nouveau contexte au lieu des hooks individuels
import { useCatSearch } from "../../contexts/CatSearchContext";

function LostCats() {
  const { t } = useTranslation();
  // Utilisation du contexte CatSearch au lieu de la logique dupliquée
  const {
    filteredLostCats,
    loadingLost,
    filters,
    matchCounts,
    loadingMatches,
    fetchLostCats,
    handleFilterChange,
    resetFilters,
    useCurrentLocation,
    clearCurrentLocation,
    applyFiltersToLostCats,
    fetchLostMatchCounts,
    calculateAge,
    formatValue,
    findPotentialFoundCats
  } = useCatSearch();

  // États locaux qui restent dans le composant
  const [show, setShow] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Options pour les filtres avec valeur vide pour "Toutes les options"
  const colorSelectOptions = [
    { value: "", label: t('lostCats.allColors', 'Toutes les couleurs') },
    ...colorChoices.map(value => ({ 
      value, 
      label: formatValue(value) 
    }))
  ];

  const eyeColorSelectOptions = [
    { value: "", label: t('lostCats.allEyeColors', "Toutes les couleurs d'yeux") },
    ...eyeColorChoices.map(value => ({ 
      value, 
      label: formatValue(value) 
    }))
  ];

  const breedOptions = [
    { value: "", label: t('lostCats.allBreeds', "Toutes les races") },
    ...catBreeds.map(breed => ({ 
      value: breed.value, 
      label: formatValue(breed.value) 
    }))
  ];

  const handleClose = () => setShow(false);
  
  const handleShow = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShow(true);
  };

  const handleShowMatches = async (cat) => {
    try {
      // Utiliser la fonction déjà extraite du contexte
      const matchResults = await findPotentialFoundCats(cat.catId);
      setMatches(matchResults);
      setShowMatches(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des correspondances:", error);
      setMatches([]);
      setShowMatches(true);
    }
  };

  const handleCloseMatches = () => {
    setShowMatches(false);
  };

  // Chargement initial des données
  useEffect(() => {
    fetchLostCats();
  }, [fetchLostCats]);

  // Appliquer les filtres lorsqu'ils changent
  useEffect(() => {
    applyFiltersToLostCats();
  }, [filters, applyFiltersToLostCats]);

  // Récupérer le nombre de correspondances pour chaque chat une seule fois après le chargement initial
  useEffect(() => {
    if (filteredLostCats.length > 0 && !loadingLost) {
      // Utiliser setTimeout pour éviter les appels simultanés
      const timer = setTimeout(() => {
        fetchLostMatchCounts();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loadingLost, filteredLostCats.length, fetchLostMatchCounts]);

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">{t('lostCats.title', 'Chats perdus')}</h1>
      
      {/* Bouton pour afficher/masquer les filtres */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant={showFilters ? "secondary" : "outline-secondary"}
          onClick={() => setShowFilters(!showFilters)}
          className="d-flex align-items-center"
        >
          <FaFilter className="me-2" />
          {showFilters ? t('lostCats.hideFilters', 'Masquer les filtres') : t('lostCats.showFilters', 'Filtrer les résultats')}
        </Button>
      </div>
      
      {/* Filtres */}
      {showFilters && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Filtres</h5>
            <Row>
              {/* Filtres par caractéristiques */}
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Race</Form.Label>
                  <Select
                    options={breedOptions}
                    value={breedOptions.find(option => option.value === filters.breed) || breedOptions[0]}
                    onChange={(selectedOption) => handleFilterChange('breed', selectedOption.value)}
                    isSearchable
                    placeholder="Toutes les races"
                    className="mb-3"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Couleur</Form.Label>
                  <Select
                    options={colorSelectOptions}
                    value={colorSelectOptions.find(option => option.value === filters.color) || colorSelectOptions[0]}
                    onChange={(selectedOption) => handleFilterChange('color', selectedOption.value)}
                    isSearchable
                    placeholder="Toutes les couleurs"
                    className="mb-3"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Couleur des yeux</Form.Label>
                  <Select
                    options={eyeColorSelectOptions}
                    value={eyeColorSelectOptions.find(option => option.value === filters.eyeColor) || eyeColorSelectOptions[0]}
                    onChange={(selectedOption) => handleFilterChange('eyeColor', selectedOption.value)}
                    isSearchable
                    placeholder="Toutes les couleurs d'yeux"
                    className="mb-3"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              {/* Filtres par localisation */}
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Code postal</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Entrez un code postal"
                      value={filters.postalCode}
                      onChange={(e) => handleFilterChange('postalCode', e.target.value)}
                      disabled={filters.location.latitude && filters.location.longitude}
                    />
                    {filters.postalCode && (
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => handleFilterChange('postalCode', '')}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Position actuelle</Form.Label>
                  <div className="d-flex">
                    <Button
                      variant={filters.location.latitude ? "success" : "outline-primary"}
                      onClick={useCurrentLocation}
                      disabled={filters.postalCode !== ""}
                      className="flex-grow-1 me-2"
                    >
                      <FaMapMarkerAlt className="me-2" />
                      {filters.location.latitude 
                        ? "Position utilisée" 
                        : "Utiliser ma position"}
                    </Button>
                    
                    {filters.location.latitude && (
                      <Button 
                        variant="outline-danger"
                        onClick={clearCurrentLocation}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </div>
                  
                  {filters.location.address && (
                    <small className="text-muted d-block mt-1">
                      {filters.location.address}, {filters.location.postalCode} {filters.location.city}
                    </small>
                  )}
                </Form.Group>
              </Col>
            </Row>
            
            {/* Rayon de recherche (uniquement si la position est utilisée) */}
            {(filters.location.latitude || filters.postalCode) && (
              <Row>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>
                      Rayon de recherche: {filters.location.radius} km
                    </Form.Label>
                    <Form.Range
                      min={1}
                      max={100}
                      value={filters.location.radius}
                      onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="outline-secondary" onClick={resetFilters} className="me-2">
                Réinitialiser
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Liste des chats perdus */}
      {loadingLost ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">Chargement des chats perdus...</p>
        </div>
      ) : filteredLostCats.length > 0 ? (
        <>
          <p className="mb-4">
            {filteredLostCats.length} chat{filteredLostCats.length > 1 ? 's' : ''} perdu{filteredLostCats.length > 1 ? 's' : ''}
          </p>
          
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredLostCats.map((catStatus) => {
              const cat = catStatus.cat;
              return (
                <Col key={cat.catId}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-100 shadow-sm">
                      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                        {/* Utiliser imageUrl comme image principale */}
                        {cat.imageUrl ? (
                          <Card.Img
                            variant="top"
                            src={cat.imageUrl}
                            alt={cat.name || 'Chat'}
                            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                            onError={(e) => {
                              e.target.src = "/noImageCat.png";
                              e.target.onerror = null; // Empêche les erreurs en boucle
                            }}
                          />
                        ) : (
                          <Card.Img
                            variant="top"
                            src="/noImageCat.png"
                            alt="Aucune photo"
                            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                          />
                        )}
                        
                        {/* Indicateur de photos multiples si le chat a plusieurs images */}
                        {cat.imageUrls && cat.imageUrls.length > 1 && (
                          <div 
                            className="position-absolute top-0 end-0 m-2 bg-dark bg-opacity-75 text-white px-2 py-1 rounded-pill"
                            style={{ fontSize: '0.8rem' }}
                          >
                            <i className="bi bi-images me-1"></i>
                            {cat.imageUrls.length} photos
                          </div>
                        )}
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title>{cat.name}</Card.Title>
                          <Badge bg="danger">{formatValue(cat.gender)}</Badge>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            <Badge bg="light" text="dark">{formatValue(cat.breed)}</Badge>
                            <Badge bg="light" text="dark">{formatValue(cat.color)}</Badge>
                            <Badge bg="light" text="dark">Yeux {formatValue(cat.eyeColor)}</Badge>
                          </div>
                          
                          <div className="d-flex align-items-center mb-1">
                            <BiCalendar className="me-2 text-muted" style={{ fontSize: '0.8rem' }}></BiCalendar>
                            <small className="text-muted">
                              {t('lostCats.age', 'Âge')}: {cat.dateOfBirth ? calculateAge(cat.dateOfBirth) : t('lostCats.unknown', 'Inconnu')}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-muted" style={{ fontSize: '0.8rem' }}></FaMapMarkerAlt>
                            <small className="text-muted">
                              {t('lostCats.lostOn', 'Perdu le')}: {new Date(catStatus.reportDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </small>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <div className="d-grid gap-2">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleShow(catStatus)}
                              className="d-flex align-items-center justify-content-center"
                            >
                              <i className="bi bi-info-circle me-1"></i>
                              {t('lostCats.moreInfo', "Plus d'informations")}
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
                                  {t('lostCats.searching', 'Recherche...')}
                                </>
                              ) : (
                                <>
                                  <FaSearch className="me-1" />
                                  {matchCounts[cat.catId] ? 
                                    t('lostCats.matchCount', {
                                      count: matchCounts[cat.catId],
                                      defaultValue: '{{count}} correspondance',
                                      plural: '{{count}} correspondances'
                                    }) : 
                                    t('lostCats.searchMatches', 'Rechercher des correspondances')}
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
          <h3>{t('lostCats.noResultsTitle', 'Aucun chat perdu ne correspond à vos critères')}</h3>
          <p className="text-muted">
            {t('lostCats.noResultsText', 'Essayez de modifier vos filtres ou revenez plus tard.')}
          </p>
          <Button variant="outline-success" onClick={resetFilters}>
            {t('lostCats.resetFilters', 'Réinitialiser les filtres')}
          </Button>
        </div>
      )}
      
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