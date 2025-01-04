import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import CatMatching from '../CatMatching';

const MatchingPage = () => {
  const [cats, setCats] = useState({ lost: [], found: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('lost');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        };

        const [lostResponse, foundResponse] = await Promise.all([
          axios.get('cat/byType/LOST', { headers }),
          axios.get('cat/byType/FOUND', { headers })
        ]);

        setCats({
          lost: lostResponse.data,
          found: foundResponse.data
        });
      } catch (err) {
        setError('Erreur lors de la récupération des chats: ' + err.message);
      } finally {
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
              src={`data:image/jpeg;base64,${cat.imageCatData}`}
              alt={cat.name}
              style={{ 
                height: '200px', 
                objectFit: 'cover',
                marginBottom: '1rem'
              }}
            />
          )}
          <Card.Text>
            <strong>Race:</strong> {cat.breed || 'Non spécifié'}<br />
            <strong>Couleur:</strong> {cat.color || 'Non spécifié'}<br />
            <strong>Couleur des yeux:</strong> {cat.eyeColor || 'Non spécifié'}<br />
            <strong>Genre:</strong> {cat.gender || 'Non spécifié'}<br />
            <strong>Type de fourrure:</strong> {cat.furType || 'Non spécifié'}
          </Card.Text>
          <CatMatching cat={cat} />
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
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
    <Container className="mt-4 mb-4">
      <h1 className="text-center mb-4">Système de Correspondance des Chats</h1>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab 
          eventKey="lost" 
          title={`Chats Perdus (${cats.lost.length})`}
        >
          <div className="mb-3">
            <Alert variant="info">
              Ces chats ont été signalés comme perdus. Cliquez sur "Trouver des correspondances" 
              pour voir les chats trouvés qui pourraient correspondre.
            </Alert>
          </div>
          <Row>
            {cats.lost.length === 0 ? (
              <Col>
                <Alert variant="warning">
                  Aucun chat perdu n'a été signalé pour le moment.
                </Alert>
              </Col>
            ) : (
              cats.lost.map(cat => renderCatCard(cat))
            )}
          </Row>
        </Tab>

        <Tab 
          eventKey="found" 
          title={`Chats Trouvés (${cats.found.length})`}
        >
          <div className="mb-3">
            <Alert variant="info">
              Ces chats ont été signalés comme trouvés. Cliquez sur "Trouver des correspondances" 
              pour voir les chats perdus qui pourraient correspondre.
            </Alert>
          </div>
          <Row>
            {cats.found.length === 0 ? (
              <Col>
                <Alert variant="warning">
                  Aucun chat trouvé n'a été signalé pour le moment.
                </Alert>
              </Col>
            ) : (
              cats.found.map(cat => renderCatCard(cat))
            )}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default MatchingPage;
