import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import '../styles/global.css';

const gpsCollars = [
  {
    id: 1,
    name: "Tractive GPS Cat",
    price: 49.99,
    description: "Suivez votre chat en temps réel. Batterie longue durée, étanche, léger et confortable.",
    features: ["GPS en temps réel", "Étanche", "Batterie 7 jours", "Zone de sécurité"],
    image: "/images/gps-collar-1.jpg",
    bestseller: true
  },
  {
    id: 2,
    name: "Whisker Tracker Pro",
    price: 69.99,
    description: "GPS premium avec suivi d'activité et historique des déplacements complet.",
    features: ["Suivi d'activité", "Historique 30 jours", "Alertes instantanées", "Design élégant"],
    image: "/images/gps-collar-2.jpg",
    new: true
  },
  {
    id: 3,
    name: "SafeCat Basic",
    price: 39.99,
    description: "Solution GPS abordable pour garder un œil sur votre chat.",
    features: ["GPS basique", "Batterie 5 jours", "Application mobile", "Installation facile"],
    image: "/images/gps-collar-3.jpg"
  }
];

function GpsCollars() {
  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-5">
          <h1 className="display-4 mb-3">Colliers GPS pour Chats</h1>
          <p className="lead text-muted">
            Gardez un œil sur votre compagnon félin avec nos colliers GPS de haute qualité
          </p>
        </div>

        <Row xs={1} md={2} lg={3} className="g-4">
          {gpsCollars.map((collar) => (
            <Col key={collar.id}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-100 shadow-sm">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={collar.image}
                      alt={collar.name}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=Image+non+disponible";
                      }}
                    />
                    {collar.bestseller && (
                      <Badge 
                        bg="warning" 
                        text="dark"
                        className="position-absolute top-0 start-0 m-2"
                      >
                        Meilleure vente
                      </Badge>
                    )}
                    {collar.new && (
                      <Badge 
                        bg="success"
                        className="position-absolute top-0 start-0 m-2"
                      >
                        Nouveau
                      </Badge>
                    )}
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-3">{collar.name}</Card.Title>
                    <Card.Text className="text-muted mb-3">
                      {collar.description}
                    </Card.Text>
                    <div className="mb-3">
                      {collar.features.map((feature, index) => (
                        <Badge 
                          key={index}
                          bg="light" 
                          text="dark"
                          className="me-2 mb-2"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="h4 mb-0">{collar.price} €</span>
                        <Button 
                          variant="primary"
                          className="px-4"
                        >
                          Acheter
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-5 py-4 bg-light rounded">
          <h2 className="h4 mb-4">Pourquoi choisir nos colliers GPS ?</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="px-3">
                <h3 className="h5 mb-3">Sécurité Maximale</h3>
                <p className="text-muted">Localisez votre chat en temps réel et recevez des alertes instantanées</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="px-3">
                <h3 className="h5 mb-3">Confort Optimal</h3>
                <p className="text-muted">Conçus spécialement pour les chats, légers et confortables</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="px-3">
                <h3 className="h5 mb-3">Application Simple</h3>
                <p className="text-muted">Interface intuitive pour suivre facilement les déplacements</p>
              </div>
            </Col>
          </Row>
        </div>
      </motion.div>
    </Container>
  );
}

export default GpsCollars;
