import React from 'react';
import { Modal, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { FaPaw, FaPercentage } from 'react-icons/fa';

function MatchingResults({ matches, show, handleClose, onViewDetails }) {
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
                      src={`data:${cat.type};base64,${cat.imageCatData}`}
                      alt={cat.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = "/images/noImageCat.png";
                        e.target.onerror = null;
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
                      <Card.Text className="text-muted small mb-2">
                        Race: {cat.breed || "Inconnue"}
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
