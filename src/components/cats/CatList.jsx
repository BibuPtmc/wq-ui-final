import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col, Spinner, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { FaSearch, FaFilter, FaMapMarkerAlt } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import CatDetails from "../profile/CatDetails";
import MatchingResults from "./MatchingResults";
import CatFilters from "./CatFilters";
import { useCatSearch } from "../../contexts/CatSearchContext";

/**
 * Composant générique pour afficher les chats trouvés ou perdus
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.type - Le type de chat ('found' ou 'lost')
 * @param {string} props.title - Le titre de la page
 * @param {string} props.loadingText - Le texte de chargement
 * @param {string} props.noResultsTitle - Le titre quand aucun résultat
 * @param {string} props.noResultsText - Le texte quand aucun résultat
 * @param {string} props.resetFiltersText - Le texte du bouton de réinitialisation
 * @param {string} props.moreInfoText - Le texte du bouton plus d'infos
 * @param {string} props.searchingText - Le texte pendant la recherche
 * @param {string} props.searchMatchesText - Le texte du bouton de recherche
 * @param {string} props.matchCountText - Le texte pour le nombre de correspondances
 */
const CatList = ({
  type,
  title,
  loadingText,
  noResultsTitle,
  noResultsText,
  resetFiltersText,
  moreInfoText,
  searchingText,
  searchMatchesText,
  matchCountText
}) => {
  const { t } = useTranslation();
  const {
    filteredFoundCats,
    filteredLostCats,
    loadingFound,
    loadingLost,
    filters,
    matchCounts,
    loadingMatches,
    fetchFoundCats,
    fetchLostCats,
    handleFilterChange,
    resetFilters,
    useCurrentLocation,
    clearCurrentLocation,
    applyFiltersToFoundCats,
    applyFiltersToLostCats,
    fetchFoundMatchCounts,
    fetchLostMatchCounts,
    calculateAge,
    formatValue,
    findPotentialLostCats,
    findPotentialFoundCats
  } = useCatSearch();

  const [show, setShow] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Sélectionner les données en fonction du type
  const cats = type === 'found' ? filteredFoundCats : filteredLostCats;
  const loading = type === 'found' ? loadingFound : loadingLost;
  const fetchCats = type === 'found' ? fetchFoundCats : fetchLostCats;
  const applyFilters = type === 'found' ? applyFiltersToFoundCats : applyFiltersToLostCats;
  const fetchMatchCounts = type === 'found' ? fetchFoundMatchCounts : fetchLostMatchCounts;
  const findMatches = type === 'found' ? findPotentialLostCats : findPotentialFoundCats;

  const handleClose = () => {
    setShow(false);
    // Réafficher les correspondances si elles étaient visibles avant
    if (matches.length > 0) {
      setShowMatches(true);
    }
  };
  
  const handleShow = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShow(true);
    // Ne pas fermer les correspondances, mais les cacher temporairement
    setShowMatches(false);
  };

  const handleShowMatches = async (cat) => {
    try {
      const matchResults = await findMatches(cat.catId);
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
    fetchCats();
  }, [fetchCats]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  useEffect(() => {
    if (cats.length > 0 && !loading) {
      const timer = setTimeout(() => {
        fetchMatchCounts();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, cats.length, fetchMatchCounts]);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{title}</h1>
        <Button
          variant="outline-primary"
          onClick={() => setShowFilters(!showFilters)}
          className="d-flex align-items-center"
        >
          <FaFilter className="me-2" />
          {showFilters ? t('foundCats.hideFilters', 'Masquer les filtres') : t('foundCats.showFilters', 'Afficher les filtres')}
        </Button>
      </div>

      {showFilters && <CatFilters type={type} />}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">{loadingText}</p>
        </div>
      ) : cats.length > 0 ? (
        <>
          <div className="d-flex align-items-center mb-4">
            <Badge bg="info" className="fs-5 px-3 py-2">
              {cats.length} chat{cats.length > 1 ? 's' : ''} {type === 'found' ? 'trouvé' : 'perdu'}{cats.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <Row xs={1} md={2} lg={3} className="g-4">
            {cats.map((catStatus) => {
              const cat = catStatus.cat;
              return (
                <Col key={catStatus.catStatusId}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-100 shadow-sm">
                      <div className="position-relative">
                        <Card.Img
                          variant="top"
                          src={cat.imageUrl || 
                            (cat.imageUrls && cat.imageUrls.length > 0 ? cat.imageUrls[0] : 
                            "/noImageCat.png")}
                          alt={cat.name}
                          style={{ height: '200px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = "/noImageCat.png";
                            e.target.onerror = null;
                          }}
                        />
                        <Badge 
                          bg="dark" 
                          className="position-absolute top-0 end-0 m-2"
                          style={{ opacity: 0.8 }}
                        >
                          {cat.imageUrls ? cat.imageUrls.length : (cat.imageUrl ? 1 : 0)} photo{cat.imageUrls ? (cat.imageUrls.length > 1 ? 's' : '') : (cat.imageUrl ? '' : 's')}
                        </Badge>
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="mb-0">{cat.name || "Chat sans nom"}</Card.Title>
                          <Badge 
                            bg={
                              cat.gender === 'Femelle' ? 'danger' : 
                              cat.gender === 'Mâle' ? 'primary' : 
                              'secondary'
                            }
                          >
                            {formatValue(cat.gender)}
                          </Badge>
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
                              {t(`${type}Cats.age`, 'Âge')}: {cat.dateOfBirth ? calculateAge(cat.dateOfBirth) : t(`${type}Cats.unknown`, 'Inconnu')}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-muted" style={{ fontSize: '0.8rem' }}></FaMapMarkerAlt>
                            <small className="text-muted">
                              {t(`${type}Cats.${type === 'found' ? 'foundOn' : 'lostOn'}`, type === 'found' ? 'Trouvé le' : 'Perdu le')}: {new Date(catStatus.reportDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                              {moreInfoText}
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
                                  {searchingText}
                                </>
                              ) : (
                                <>
                                  <FaSearch className="me-1" />
                                  {matchCounts[cat.catId] ? 
                                    t(matchCountText, {
                                      count: matchCounts[cat.catId],
                                      defaultValue: '{{count}} correspondance',
                                      plural: '{{count}} correspondances'
                                    }) : 
                                    searchMatchesText}
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
          <h3>{noResultsTitle}</h3>
          <p className="text-muted">
            {noResultsText}
          </p>
          <Button variant="outline-success" onClick={resetFilters}>
            {resetFiltersText}
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
        onViewDetails={handleShow}
      />
    </Container>
  );
};

export default CatList; 