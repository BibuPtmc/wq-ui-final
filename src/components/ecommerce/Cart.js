import React, { useState } from 'react';
import { Modal, Button, ListGroup, Form, Badge } from 'react-bootstrap';
import { useCart } from './CartContext';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useAuth } from '../../hooks/authProvider';
import { BsCart3 } from 'react-icons/bs';
import { motion } from 'framer-motion';

const stripePromise = loadStripe('your-publishable-key');

const Cart = () => {
  const [showModal, setShowModal] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, token } = useAuth();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      const stripe = await stripePromise;

      const orderResponse = await axios.post(
        'http://localhost:8080/api/ecommerce/orders',
        cartItems.map(item => ({
          product: { id: item.product.id },
          quantity: item.quantity
        })),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const paymentResponse = await axios.post(
        `http://localhost:8080/api/ecommerce/orders/${orderResponse.data.id}/payment`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const { error } = await stripe.redirectToCheckout({
        clientSecret: paymentResponse.data.clientSecret,
      });

      if (error) {
        console.error('Error:', error);
      } else {
        clearCart();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Une erreur est survenue lors du paiement. Veuillez réessayer.');
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
