import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

// Garder useCart pour la rétrocompatibilité
export const useCart = useCartContext;

export const CartProvider = ({ children }) => {
  // Utiliser la clé publique depuis les variables d'environnement
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  // Vérifier si la clé est disponible
  useEffect(() => {
    if (!stripePublicKey) {
      // Log réduit pour améliorer les performances
    }
  }, [stripePublicKey]);

  const [cartItems, setCartItems] = useState(() => {
    // Récupérer les articles du panier depuis le localStorage au chargement
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sauvegarder le panier dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product.id) {
      // Log réduit pour améliorer les performances
      return;
    }
  
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotal,
    clearCart,
    stripePublicKey,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};
