import React, { useState } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Container, Row, Col, Spinner } from 'react-bootstrap';

const CatMatching = ({ cat, isLost }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const findMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        'cat/findMatches',
        {
          targetCat: cat,
          isLost: isLost,
          maxResults: 5
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        }
      );
      setMatches(response.data);
    } catch (err) {
      setError('Erreur lors de la recherche de correspondances: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMatch(null);
  };

  const renderMatchDetails = (match) => {
    return (
      <Container>
        <p className="mb-3">
          {match.matchDescription}
        </p>
        <Row>
          <Col sm={6}>
            <h6>Chat correspondant:</h6>
            <p>Nom: {match.matchedCat.name}</p>
            <p>Couleur: {match.matchedCat.color}</p>
            <p>Race: {match.matchedCat.breed}</p>
            <p>Genre: {match.matchedCat.gender}</p>
          </Col>
          {match.matchedCat.imageCatData && (
            <Col sm={6}>
              <img
                src={`data:image/jpeg;base64,${match.matchedCat.imageCatData}`}
                alt={match.matchedCat.name}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Col>
          )}
        </Row>
      </Container>
    );
  };

  return (
    <div>
      <Button
        variant="primary"
        onClick={findMatches}
        disabled={loading}
        className="mb-3"
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Recherche...
          </>
        ) : (
          'Trouver des correspondances'
        )}
      </Button>

      {error && (
        <div className="text-danger mb-3">
          {error}
        </div>
      )}

      <Row>
        {matches.map((match, index) => (
          <Col xs={12} sm={6} md={4} key={index} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>
                  Score: {(match.matchScore * 100).toFixed(0)}%
                </Card.Title>
                <Card.Text className="text-muted">
                  {match.matchedCat.name}
                </Card.Text>
                <Button
                  variant="outline-primary"
                  onClick={() => handleMatchClick(match)}
                >
                  Voir les détails
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails de la correspondance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMatch && renderMatchDetails(selectedMatch)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CatMatching;