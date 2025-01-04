// Ce fichier n'est plus utilisé et peut être supprimé

import React, { useState } from 'react';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';
import { BsCart3 } from 'react-icons/bs';
import { useCart } from './CartContext';
import Cart from './Cart';

const EcommerceNavbar = () => {
  const [showCart, setShowCart] = useState(false);
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-3">
        <Container>
          <Navbar.Brand>WhiskerQuest Shop</Navbar.Brand>
          <Button
            variant="outline-primary"
            onClick={() => setShowCart(true)}
            className="position-relative"
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
        </Container>
      </Navbar>
      <Cart show={showCart} handleClose={() => setShowCart(false)} />
    </>
  );
};

export default EcommerceNavbar;
