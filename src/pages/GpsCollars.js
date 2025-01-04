import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import '../styles/global.css';
import { useCart } from '../components/ecommerce/CartContext';
import axios from 'axios';

function GpsCollars() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/ecommerce/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h2>Chargement des produits...</h2>
      </Container>
    );
  }

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
          {products.map((product) => (
            <Col key={product.id}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-100 shadow-sm">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=Image+non+disponible";
                      }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="mb-3">{product.name}</Card.Title>
                    <Card.Text className="text-muted mb-3">
                      {product.description}
                    </Card.Text>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="h4 mb-0">{product.price.toFixed(2)} €</span>
                        <Button 
                          variant="primary"
                          className="px-4"
                          onClick={() => addToCart(product)}
                          disabled={product.stockQuantity === 0}
                        >
                          {product.stockQuantity > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                        </Button>
                      </div>
                      {product.stockQuantity > 0 && (
                        <small className="text-muted mt-2 d-block">
                          Stock disponible: {product.stockQuantity}
                        </small>
                      )}
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
