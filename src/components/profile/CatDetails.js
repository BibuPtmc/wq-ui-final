import React from 'react';
import { Modal, Row, Col, Badge, Card } from 'react-bootstrap';
import { FaPaw, FaBirthdayCake, FaCalendarAlt, FaInfoCircle, FaComments } from 'react-icons/fa';

function CatDetails({ selectedCatStatus, handleClose, show }) {
  if (!selectedCatStatus || !selectedCatStatus.cat) {
    return null;
  }

  const cat = selectedCatStatus.cat;

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
                    <div className="fw-semibold">{cat.breed || "Inconnue"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted mb-1">Couleur</div>
                    <div className="fw-semibold">{cat.color || "Inconnue"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted mb-1">Type de fourrure</div>
                    <div className="fw-semibold">{cat.furType || "Non spécifié"}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted mb-1">Couleur des yeux</div>
                    <div className="fw-semibold">{cat.eyeColor || "Non spécifié"}</div>
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
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default CatDetails;