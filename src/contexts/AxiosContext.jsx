import React, { createContext, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';

// Création du contexte
const AxiosContext = createContext();

export const AxiosProvider = ({ children }) => {
  // Création de l'instance axios
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API,
    });

    // Intercepteur de requêtes pour ajouter dynamiquement le token à chaque requête
    instance.interceptors.request.use((config) => {
      // Récupérer le token à chaque requête pour s'assurer qu'il est à jour
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    // Intercepteur de réponses pour traiter les données et les erreurs
    instance.interceptors.response.use(
      (response) => response.data, // Retourne directement les données
      (error) => {
        // Gestion des erreurs
        if (error.response) {
          // Le serveur a répondu avec un code d'erreur
          console.error('Server error:', error.response.status, error.response.data);
          
          // Gestion spécifique des erreurs d'authentification
          if (error.response.status === 401) {
            // Token expiré ou invalide
            console.error('Authentication error: Token expired or invalid');
            // On pourrait implémenter une logique de déconnexion automatique ici
          }
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          console.error('No response received:', error.request);
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          console.error('Request setup error:', error.message);
        }
        
        // Renvoie une promesse rejetée pour propager l'erreur
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // Méthodes HTTP encapsulées
  const get = useCallback(async (url, config = {}) => {
    return axiosInstance.get(url, config);
  }, [axiosInstance]);

  const post = useCallback(async (url, data, config = {}) => {
    return axiosInstance.post(url, data, config);
  }, [axiosInstance]);

  const put = useCallback(async (url, data, config = {}) => {
    return axiosInstance.put(url, data, config);
  }, [axiosInstance]);

  const del = useCallback(async (url, config = {}) => {
    return axiosInstance.delete(url, config);
  }, [axiosInstance]);

  // Valeur du contexte
  const contextValue = useMemo(() => ({
    axiosInstance,
    get,
    post,
    put,
    delete: del // 'delete' est un mot réservé en JS, donc on utilise 'del' en interne
  }), [axiosInstance, get, post, put, del]);

  return (
    <AxiosContext.Provider value={contextValue}>
      {children}
    </AxiosContext.Provider>
  );
};

export const useAxiosContext = () => {
  const context = useContext(AxiosContext);
  if (!context) {
    throw new Error('useAxiosContext must be used within an AxiosProvider');
  }
  return context;
};
