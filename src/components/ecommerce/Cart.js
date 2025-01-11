import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, ListGroup, Form, Badge } from 'react-bootstrap';
import { useCart } from './CartContext';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useAuth } from '../../hooks/authProvider';
import { BsCart3 } from 'react-icons/bs';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart, stripePublicKey } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Initialize Stripe with the public key from context
  const stripePromise = useMemo(() => {
    try {
      if (!stripePublicKey) {
        console.error('La clé publique Stripe n\'est pas définie');
        return null;
      }
      return loadStripe(stripePublicKey);
    } catch (err) {
      console.error('Erreur d\'initialisation de Stripe:', err);
      return null;
    }
  }, [stripePublicKey]);

  // Si l'utilisateur n'est pas connecté, on ne rend pas le composant
  if (!isLoggedIn) {
    return null;
  }

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Impossible d\'initialiser Stripe');
      }

      // Création de la session de paiement
      const response = await fetch('http://localhost:8080/ecommerce/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const session = await response.json();

      // Redirection vers la page de paiement
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Erreur lors du paiement:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: 'inline-block' }}
      >
        <Button
          variant="outline-primary"
          className="rounded-pill position-relative"
          onClick={() => setShowModal(true)}
        >
          <BsCart3 size={20} />
          {totalItems > 0 && (
            <Badge
              bg="danger"
              className="position-absolute top-0 start-100 translate-middle rounded-pill"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </motion.div>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Votre Panier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.length === 0 ? (
            <p className="text-center py-3">Votre panier est vide</p>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item.product.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{item.product.name}</h6>
                      <p className="mb-0 text-primary">{item.product.price.toFixed(2)} €</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                        style={{ width: '70px' }}
                        className="text-center"
                      />
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {cartItems.length > 0 && (
            <div className="mt-4 text-end">
              <h5>Total: {getTotal().toFixed(2)} €</h5>
            </div>
          )}
          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
          {cartItems.length > 0 && (
            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Chargement...' : 'Payer'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Cart;
