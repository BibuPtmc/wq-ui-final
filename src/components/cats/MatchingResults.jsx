import React from 'react';
import { Modal, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { FaPaw, FaPercentage } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useCatSearch } from '../../contexts/CatSearchContext';


import { useTranslation } from 'react-i18next';

function MatchingResults({ matches, show, handleClose, onViewDetails }) {
  const { formatValue } = useCatSearch();
  const { t } = useTranslation();
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton style={{ 
        background: '#8B4513',
        color: 'white',
        borderBottom: 'none'
      }}>
        <Modal.Title>
          <FaPaw className="me-2" style={{ color: 'white' }} />
          Correspondances potentielles
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {matches.length > 0 ? (
          <Row xs={1} md={2} className="g-4">
            {matches.map((match) => {
              const cat = match.matchedCat.cat;
              return (
                <Col key={match.matchedCat.catStatusId}>
                  <Card className="h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={cat.imageUrl || 
                      (cat.imageUrls && cat.imageUrls.length > 0 ? cat.imageUrls[0] : 
                      "/noImageCat.png")}
                    alt={cat.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = "/noImageCat.png";
                      e.target.onerror = null; // Empêche les erreurs en boucle
                    }}
                    />
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="mb-0">{cat.name || "Chat sans nom"}</Card.Title>
                        <Badge bg="info" className="ms-2">
                          <FaPercentage className="me-1" />
                          {match.matchScore}%
                        </Badge>
                      </div>

                      {/* Jauges circulaires pour chaque critère */}
                      <Row className="text-center mb-3">
                        <Col sm={6} key={`color-${match.matchedCat.catStatusId}`}>
                          <div style={{ width: 60, height: 60, margin: 'auto' }}>
                            <CircularProgressbar 
                              value={match.colorMatch || 0} 
                              text={`${match.colorMatch || 0}%`} 
                              styles={buildStyles({ 
                                textColor: '#8B4513',
                                pathColor: '#8B4513',
                                trailColor: '#ddd',
                              })}
                            />
                          </div>
                          <div className="text-muted small mt-2">{t('matching.color', 'Couleur')}</div>
                        </Col>
                        <Col sm={6} key={`breed-${match.matchedCat.catStatusId}`}>
                          <div style={{ width: 60, height: 60, margin: 'auto' }}>
                            <CircularProgressbar 
                              value={match.breedMatch || 0} 
                              text={`${match.breedMatch || 0}%`} 
                              styles={buildStyles({ 
                                textColor: '#8B4513',
                                pathColor: '#8B4513',
                                trailColor: '#ddd',
                              })}
                            />
                          </div>
                          <div className="text-muted small mt-2">{t('matching.breed', 'Race')}</div>
                        </Col>
                      </Row>
                      <Row className="text-center mb-3">
                        <Col sm={6} key={`fur-${match.matchedCat.catStatusId}`}>
                          <div style={{ width: 60, height: 60, margin: 'auto' }}>
                            <CircularProgressbar 
                              value={match.furTypeMatch || 0} 
                              text={`${match.furTypeMatch || 0}%`} 
                              styles={buildStyles({ 
                                textColor: '#8B4513',
                                pathColor: '#8B4513',
                                trailColor: '#ddd',
                              })}
                            />
                          </div>
                          <div className="text-muted small mt-2">{t('matching.fur', 'Pelage')}</div>
                        </Col>
                        <Col sm={6} key={`eye-${match.matchedCat.catStatusId}`}>
                          <div style={{ width: 60, height: 60, margin: 'auto' }}>
                            <CircularProgressbar 
                              value={match.eyeColorMatch || 0} 
                              text={`${match.eyeColorMatch || 0}%`} 
                              styles={buildStyles({ 
                                textColor: '#8B4513',
                                pathColor: '#8B4513',
                                trailColor: '#ddd',
                              })}
                            />
                          </div>
                          <div className="text-muted small mt-2">{t('matching.eyes', 'Yeux')}</div>
                        </Col>
                      </Row>
                      <Row className="text-center mb-3">
                        <Col sm={6} key={`distance-${match.matchedCat.catStatusId}`}>
                          <div style={{ width: 60, height: 60, margin: 'auto' }}>
                            <CircularProgressbar 
                              value={match.distanceScore || 0} 
                              text={`${match.distanceScore || 0}%`} 
                              styles={buildStyles({ 
                                textColor: '#8B4513',
                                pathColor: '#8B4513',
                                trailColor: '#ddd',
                              })}
                            />
                          </div>
                          <div className="text-muted small mt-2">{t('matching.distance', 'Distance')}</div>
                        </Col>
                      </Row>

                      <Card.Text className="text-muted small mb-2">
                        Race: {formatValue(cat.breed) || "Inconnue"}
                      </Card.Text>
                      <Card.Text className="text-muted small mb-2">
                        Trouvé le: {new Date(match.matchedCat.reportDate).toLocaleDateString()}
                      </Card.Text>
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => onViewDetails(match.matchedCat)}
                          className="rounded-pill"
                        >
                          Voir les détails
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div className="text-center py-4">
            <h5>Aucune correspondance trouvée</h5>
            <p className="text-muted">
              Nous n'avons pas trouvé de chats correspondant aux critères de recherche.
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default MatchingResults;
