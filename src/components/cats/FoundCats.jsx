import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col, Spinner, Badge, Form, InputGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import "../../styles/global.css";
import CatDetails from "../profile/CatDetails";
import MatchingResults from "./MatchingResults";
import CatFilters from "./CatFilters";
import { breedOptions } from "../../utils/enumOptions";
import { colorOptions as colorChoices, eyeColorOptions as eyeColorChoices } from "../../utils/enumOptions";
import { CatFoundIdDisplay } from "./CatLinkRequest";
import { useCatSearch } from "../../contexts/CatSearchContext";

function FoundCats() {
  const { t } = useTranslation();
  const {
    filteredFoundCats,
    loadingFound,
    filters,
    matchCounts,
    loadingMatches,
    fetchFoundCats,
    handleFilterChange,
    resetFilters,
    useCurrentLocation,
    clearCurrentLocation,
    applyFiltersToFoundCats,
    fetchFoundMatchCounts,
    calculateAge,
    formatValue,
    findPotentialLostCats
  } = useCatSearch();

  const [show, setShow] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const colorSelectOptions = [
    { value: "", label: t('foundCats.allColors', 'Toutes les couleurs') },
    ...colorChoices.map(value => ({ 
      value, 
      label: formatValue(value) 
    }))
  ];

  const eyeColorSelectOptions = [
    { value: "", label: t('foundCats.allEyeColors', "Toutes les couleurs d'yeux") },
    ...eyeColorChoices.map(value => ({ 
      value, 
      label: formatValue(value) 
    }))
  ];

  const breedSelectOptions = [
  { value: "", label: t('foundCats.allBreeds', "Toutes les races") },
  ...breedOptions.map(breed => ({
    value: breed,
    label: formatValue(breed)
  }))
];

  const handleClose = () => setShow(false);
  
  const handleShow = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShow(true);
  };

  const handleShowMatches = async (cat) => {
    try {
      const matchResults = await findPotentialLostCats(cat.catId);
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

  useEffect(() => {
    fetchFoundCats();
  }, [fetchFoundCats]);

  useEffect(() => {
    applyFiltersToFoundCats();
  }, [filters, applyFiltersToFoundCats]);

  useEffect(() => {
    if (filteredFoundCats.length > 0 && !loadingFound) {
      const timer = setTimeout(() => {
        fetchFoundMatchCounts();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loadingFound, filteredFoundCats.length, fetchFoundMatchCounts]);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{t('foundCats.title', 'Chats trouvés')}</h1>
        <Button
          variant="outline-primary"
          onClick={() => setShowFilters(!showFilters)}
          className="d-flex align-items-center"
        >
          <FaFilter className="me-2" />
          {showFilters ? t('foundCats.hideFilters', 'Masquer les filtres') : t('foundCats.showFilters', 'Afficher les filtres')}
        </Button>
      </div>

      {showFilters && <CatFilters type="found" />}
      
      {loadingFound ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">{t('foundCats.loading', 'Chargement des chats trouvés...')}</p>
        </div>
      ) : filteredFoundCats.length > 0 ? (
        <>
          <p className="mb-4">
            {filteredFoundCats.length} chat{filteredFoundCats.length > 1 ? 's' : ''} trouvé{filteredFoundCats.length > 1 ? 's' : ''}
          </p>
          
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredFoundCats.map((catStatus) => {
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
                        {cat.imageUrl ? (
                          <Card.Img
                            variant="top"
                            src={cat.imageUrl}
                            alt={cat.name || 'Chat'}
                            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                            onError={(e) => {
                              e.target.src = "/noImageCat.png";
                              e.target.onerror = null;
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
                          <Badge bg="success">{formatValue(cat.gender)}</Badge>
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
                              {t('foundCats.age', 'Âge')}: {cat.dateOfBirth ? calculateAge(cat.dateOfBirth) : t('foundCats.unknown', 'Inconnu')}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-muted" style={{ fontSize: '0.8rem' }}></FaMapMarkerAlt>
                            <small className="text-muted">
                              {t('foundCats.foundOn', 'Trouvé le')}: {new Date(catStatus.reportDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                              {t('foundCats.moreInfo', "Plus d'informations")}
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
                                  {t('foundCats.searching', 'Recherche...')}
                                </>
                              ) : (
                                <>
                                  <FaSearch className="me-1" />
                                  {matchCounts[cat.catId] ? 
                                    t('foundCats.matchCount', {
                                      count: matchCounts[cat.catId],
                                      defaultValue: '{{count}} correspondance',
                                      plural: '{{count}} correspondances'
                                    }) : 
                                    t('foundCats.searchMatches', 'Rechercher des correspondances')}
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
          <h3>{t('foundCats.noResultsTitle', 'Aucun chat trouvé ne correspond à vos critères')}</h3>
          <p className="text-muted">
            {t('foundCats.noResultsText', 'Essayez de modifier vos filtres ou revenez plus tard.')}
          </p>
          <Button variant="outline-success" onClick={resetFilters}>
            {t('foundCats.resetFilters', 'Réinitialiser les filtres')}
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

export default FoundCats;