import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../components/ecommerce/CartContext';
import { Container, Alert, Button } from 'react-bootstrap';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [hasCleared, setHasCleared] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId && !hasCleared) {
      clearCart();
      setHasCleared(true);
    }
  }, [sessionId, clearCart, hasCleared]);

  return (
    <Container className="py-5">
      <Alert variant="success">
        <Alert.Heading>Paiement réussi !</Alert.Heading>
        <p>
          Merci pour votre commande. Votre paiement a été traité avec succès.
          Vous recevrez bientôt un email de confirmation.
        </p>
      </Alert>
      <Button 
        variant="primary" 
        onClick={() => navigate('/')}
        className="mt-3"
      >
        Retour à l'accueil
      </Button>
    </Container>
  );
};

export default PaymentSuccess;
