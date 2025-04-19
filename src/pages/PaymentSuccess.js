import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';
import { Container, Alert, Button } from 'react-bootstrap';
import Confetti from 'react-confetti';
import { useTranslation } from 'react-i18next';

const PaymentSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartContext();
  const [hasCleared, setHasCleared] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const sessionId = searchParams.get('session_id');

  // Mettre à jour les dimensions de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (sessionId && !hasCleared) {
      clearCart();
      setHasCleared(true);
    }
  }, [sessionId, clearCart, hasCleared]);

  return (
    <>
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        numberOfPieces={200}
        recycle={false}
        colors={['#ff6b6b', '#4ecdc4', '#45b7af', '#96ceb4', '#ffeead']}
      />
      <Container className="py-5">
        <Alert variant="success" className="text-center">
          <Alert.Heading className="display-4">{t('paymentSuccess.title')}</Alert.Heading>
          <p className="lead mb-4">
            {t('paymentSuccess.thankYou')}
          </p>
          <hr />
          <p className="mb-4">
            {t('paymentSuccess.processing')}
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/')}
            className="px-5"
          >
            {t('paymentSuccess.backHome')}
          </Button>
        </Alert>
      </Container>
    </>
  );
};

export default PaymentSuccess;
