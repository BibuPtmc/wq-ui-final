import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// import { useAxios } from '../hooks/useAxios'; // Sera utilisé pour les futures fonctionnalités

// Création du contexte
const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const axiosInstance = useAxios(); // Sera utilisé pour les futures fonctionnalités

  // Récupération des produits
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:8080/ecommerce/products');
      setProducts(response.data || []);
    } catch (error) {
      // Log réduit pour améliorer les performances
      setError('Erreur lors de la récupération des produits');
    } finally {
      setLoading(false);
    }
  }, []);

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

// Hook personnalisé pour utiliser le contexte
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
