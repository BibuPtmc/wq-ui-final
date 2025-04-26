import { useContext } from 'react';
import { ProductContext } from '../contexts/ProductContext';

// Hook personnalisé pour utiliser le contexte produit
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
