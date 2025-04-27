import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAxios } from '../hooks/useAxios';

// Création du contexte
export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axios = useAxios();

  // Récupération des produits
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/ecommerce/products');
      setProducts(response?.data || response || []);
    } catch (error) {
      // Log réduit pour améliorer les performances
      setError('Erreur lors de la récupération des produits');
    } finally {
      setLoading(false);
    }
  }, [axios]);

  // Charger les produits au montage du composant
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fonction pour récupérer un produit par son ID
  const getProductById = useCallback((productId) => {
    return products.find(product => product.id === productId) || null;
  }, [products]);

  // Valeur du contexte
  const value = {
    products,
    loading,
    error,
    fetchProducts,
    getProductById
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

