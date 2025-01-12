import React from 'react';
import { Modal, Row, Col, Badge } from 'react-bootstrap';
import { FaPaw } from 'react-icons/fa';

function CatDetails({ selectedCatStatus, handleClose, show }) {
  if (!selectedCatStatus || !selectedCatStatus.cat) {
    return null;
  }

  const cat = selectedCatStatus.cat;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaPaw className="me-2" />
          Détails du Chat
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6} className="mb-4">
            <img
              src={`data:${cat.type};base64,${cat.imageCatData}`}
              alt={cat.name}
              className="img-fluid rounded shadow"
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = "/images/noImageCat.png";
                e.target.onerror = null; // Empêche les erreurs en boucle
              }}
            />
          </Col>
          <Col md={6}>
            <div className="mb-4">
              <h3>
                {cat.name || "Chat sans nom"}
                <Badge 
                  bg={cat.gender === "Mâle" ? "primary" : "danger"}
                  className="ms-2"
                >
                  {cat.gender}
                </Badge>
              </h3>
            </div>

            <div className="mb-3">
              <h5>Informations générales</h5>
              <Row>
                <Col sm={6}>
                  <p><strong>Race:</strong> {cat.breed || "Inconnue"}</p>
                  <p><strong>Couleur:</strong> {cat.color || "Inconnue"}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Type de fourrure:</strong> {cat.furType || "Non spécifié"}</p>
                  <p><strong>Couleur des yeux:</strong> {cat.eyeColor || "Non spécifié"}</p>
                </Col>
              </Row>
              {cat.chipNumber && (
                <p><strong>Numéro de puce:</strong> {cat.chipNumber}</p>
              )}
            </div>

            <div className="mb-3">
              <h5>Dates</h5>
              <Row>
                {cat.dateOfBirth && (
                  <Col sm={6}>
                    <p>
                      <strong>Date de naissance:</strong><br />
                      {new Date(cat.dateOfBirth).toLocaleDateString()}
                    </p>
                  </Col>
                )}
                <Col sm={6}>
                  <p>
                    <strong>Date de signalement:</strong><br />
                    {new Date(selectedCatStatus.reportDate).toLocaleDateString()}
                  </p>
                </Col>
              </Row>
            </div>

            {selectedCatStatus.comment && (
              <div>
                <h5>Description</h5>
                <p>{selectedCatStatus.comment}</p>
              </div>
            )}

            <div className="mt-3">
              <Badge bg={selectedCatStatus.statusCat === 'LOST' ? 'danger' : 'success'} className="px-3 py-2">
                {selectedCatStatus.statusCat === 'LOST' ? 'Chat perdu' : 'Chat trouvé'}
              </Badge>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default CatDetails;