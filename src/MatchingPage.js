import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Tabs, Tab, Alert } from 'react-bootstrap';
import CatMatching from './CatMatching';

const MatchingPage = () => {
  const [lostCats, setLostCats] = useState([]);
  const [foundCats, setFoundCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        };

        // Récupérer les chats perdus
        const lostResponse = await axios.get('cat/byType/LOST', { headers });
        setLostCats(lostResponse.data);

        // Récupérer les chats trouvés
        const foundResponse = await axios.get('cat/byType/FOUND', { headers });
        setFoundCats(foundResponse.data);

        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des chats: ' + err.message);
        setLoading(false);
      }
    };

    fetchCats();
  }, []);

  const renderCatCard = (cat) => (
    <Col xs={12} md={6} lg={4} className="mb-4" key={cat.catId}>
      <Card>
        <Card.Body>
          <Card.Title>{cat.name}</Card.Title>
          {cat.imageCatData && (
            <Card.Img
              variant="top"
              src={`data:image/jpeg;base64,${cat.imageCatData}`}
              alt={cat.name}
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
          )}
          <Card.Text>
            <strong>Race:</strong> {cat.breed}<br />
            <strong>Couleur:</strong> {cat.color}<br />
            <strong>Genre:</strong> {cat.gender}<br />
            <strong>Type de fourrure:</strong> {cat.furType}
          </Card.Text>
          <CatMatching cat={cat} isLost={cat.type === 'LOST'} />
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <Container className="mt-4">
        <Alert variant="info">Chargement des chats...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Correspondances de Chats</h1>
      
      <Tabs defaultActiveKey="lost" id="matching-tabs" className="mb-4">
        <Tab eventKey="lost" title="Chats Perdus">
          <h3 className="mb-3">Chats Perdus ({lostCats.length})</h3>
          {lostCats.length === 0 ? (
            <Alert variant="info">Aucun chat perdu n'a été signalé.</Alert>
          ) : (
            <Row>
              {lostCats.map(cat => renderCatCard(cat))}
            </Row>
          )}
        </Tab>

        <Tab eventKey="found" title="Chats Trouvés">
          <h3 className="mb-3">Chats Trouvés ({foundCats.length})</h3>
          {foundCats.length === 0 ? (
            <Alert variant="info">Aucun chat trouvé n'a été signalé.</Alert>
          ) : (
            <Row>
              {foundCats.map(cat => renderCatCard(cat))}
            </Row>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default MatchingPage;