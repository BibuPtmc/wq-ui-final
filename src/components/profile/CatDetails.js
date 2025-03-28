import React, { useState } from 'react';
import { Modal, Row, Col, Badge, Card, Button } from 'react-bootstrap';
import { FaPaw, FaBirthdayCake, FaCalendarAlt, FaInfoCircle, FaComments, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { useCats } from '../../hooks/useCats';
import MatchingResults from '../cats/MatchingResults';

function CatDetails({ selectedCatStatus, handleClose, show }) {
  const { findPotentialFoundCats } = useCats();
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Fonction pour formater les valeurs avec underscore en format plus lisible
  const formatValue = (value) => {
    if (!value) return "";
    
    // Remplacer les underscores par des espaces et mettre en forme (première lettre en majuscule, reste en minuscule)
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (!selectedCatStatus || !selectedCatStatus.cat) {
    return null;
  }

  const cat = selectedCatStatus.cat;

  const handleShowMatches = async () => {
    setLoadingMatches(true);
    const matchResults = await findPotentialFoundCats(cat.catId);
    setMatches(matchResults);
    setLoadingMatches(false);
    setShowMatches(true);
  };

  const handleCloseMatches = () => {
    setShowMatches(false);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton style={{ 
        background: '#8B4513',
        color: 'white',
        borderBottom: 'none'
      }}>
        <Modal.Title>
          <FaPaw className="me-2" style={{ color: '#8B4513' }} />
          {cat.name || "Chat sans nom"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Row>
          <Col md={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Img
                src={`data:${cat.type};base64,${cat.imageCatData}`}
                alt={cat.name}
                style={{ 
                  height: '300px', 
                  objectFit: 'cover',
                  borderRadius: '0.5rem'
                }}
                onError={(e) => {
                  e.target.src = "/images/noImageCat.png";
                  e.target.onerror = null;
                }}
              />
            </Card>
          </Col>
          <Col md={6}>
            <div className="d-flex align-items-center mb-4">
              <Badge 
                bg={cat.gender === "Mâle" ? "primary" : "danger"}
                className="me-2 px-3 py-2"
                style={{ fontSize: '0.9rem' }}
              >
                {cat.gender}
              </Badge>
              {selectedCatStatus.statusCat === 'OWN' && (
                <Badge bg="success" className="px-3 py-2" style={{ fontSize: '0.9rem' }}>
                  Propriétaire
                </Badge>
              )}
            </div>

            <Card className="shadow-sm mb-3">
              <Card.Body>
                <h5 className="mb-3">
                  <FaInfoCircle className="me-2" style={{ color: '#8B4513' }} />
                  Informations générales
                </h5>
                <Row className="g-3">
                  <Col sm={6}>
                    <div className="text-muted mb-1">Race</div>
                    <div className="fw-semibold">{formatValue(cat.breed) || "Inconnue"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted mb-1">Couleur</div>
                    <div className="fw-semibold">{formatValue(cat.color) || "Inconnue"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted mb-1">Type de fourrure</div>
                    <div className="fw-semibold">{formatValue(cat.furType) || "Non spécifié"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted mb-1">Couleur des yeux</div>
                    <div className="fw-semibold">{formatValue(cat.eyeColor) || "Non spécifié"}</div>
                  </Col>
                  {cat.chipNumber && (
                    <Col xs={12}>
                      <div className="text-muted mb-1">Numéro de puce</div>
                      <div className="fw-semibold">{cat.chipNumber}</div>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-3">
              <Card.Body>
                <h5 className="mb-3">
                  <FaCalendarAlt className="me-2" style={{ color: '#8B4513' }} />
                  Dates importantes
                </h5>
                <Row className="g-3">
                  {cat.dateOfBirth && (
                    <Col sm={6}>
                      <div className="text-muted mb-1">
                        <FaBirthdayCake className="me-2" style={{ color: '#8B4513' }} />
                        Date de naissance
                      </div>
                      <div className="fw-semibold">
                        {new Date(cat.dateOfBirth).toLocaleDateString()}
                      </div>
                    </Col>
                  )}
                  <Col sm={6}>
                    <div className="text-muted mb-1">Date de signalement</div>
                    <div className="fw-semibold">
                      {new Date(selectedCatStatus.reportDate).toLocaleDateString()}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {selectedCatStatus.location && (
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <h5 className="mb-3">
                    <FaMapMarkerAlt className="me-2" style={{ color: '#8B4513' }} />
                    Localisation
                  </h5>
                  <Row className="g-3">
                    {selectedCatStatus.location.address && (
                      <Col xs={12}>
                        <div className="text-muted mb-1">Adresse</div>
                        <div className="fw-semibold">{selectedCatStatus.location.address}</div>
                      </Col>
                    )}
                    {selectedCatStatus.location.city && (
                      <Col sm={6}>
                        <div className="text-muted mb-1">Ville</div>
                        <div className="fw-semibold">{selectedCatStatus.location.city}</div>
                      </Col>
                    )}
                    {selectedCatStatus.location.postalCode && (
                      <Col sm={6}>
                        <div className="text-muted mb-1">Code postal</div>
                        <div className="fw-semibold">{selectedCatStatus.location.postalCode}</div>
                      </Col>
                    )}
                    {selectedCatStatus.location.country && (
                      <Col sm={6}>
                        <div className="text-muted mb-1">Pays</div>
                        <div className="fw-semibold">{selectedCatStatus.location.country}</div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            )}

            {selectedCatStatus.comment && (
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">
                    <FaComments className="me-2" style={{ color: '#8B4513' }} />
                    Description
                  </h5>
                  <p className="mb-0">{selectedCatStatus.comment}</p>
                </Card.Body>
              </Card>
            )}

            {/* {selectedCatStatus.contactInfo && (
              <Card className="shadow-sm mt-3">
                <Card.Body>
                  <h5 className="mb-3">
                    <FaInfoCircle className="me-2" style={{ color: '#8B4513' }} />
                    Contact
                  </h5>
                  <Row className="g-3">
                    {selectedCatStatus.contactInfo.name && (
                      <Col sm={6}>
                        <div className="text-muted mb-1">Nom</div>
                        <div className="fw-semibold">{selectedCatStatus.contactInfo.name}</div>
                      </Col>
                    )}
                    {selectedCatStatus.contactInfo.email && (
                      <Col sm={6}>
                        <div className="text-muted mb-1">Email</div>
                        <div className="fw-semibold">{selectedCatStatus.contactInfo.email}</div>
                      </Col>
                    )}
                    {selectedCatStatus.contactInfo.phone && (
                      <Col sm={6}>
                        <div className="text-muted mb-1">Téléphone</div>
                        <div className="fw-semibold">{selectedCatStatus.contactInfo.phone}</div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            )} */}

            {selectedCatStatus.statusCat === 'LOST' && (
              <Button
                variant="primary"
                className="w-100 mt-3"
                onClick={handleShowMatches}
                disabled={loadingMatches}
              >
                <FaSearch className="me-2" />
                {loadingMatches ? 'Recherche en cours...' : 'Rechercher des correspondances'}
              </Button>
            )}
          </Col>
        </Row>
      </Modal.Body>

      <MatchingResults
        matches={matches}
        show={showMatches}
        handleClose={handleCloseMatches}
        onViewDetails={(catStatus) => {
          handleCloseMatches();
          handleClose();
          // You might want to implement a way to show details of the matched cat
        }}
      />
    </Modal>
  );
}

export default CatDetails;