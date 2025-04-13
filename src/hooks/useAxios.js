
import { useAxiosContext } from '../contexts/AxiosContext';

/**
 * Hook useAxios pour la compatibilité avec le code existant
 * Utilise le nouveau contexte AxiosContext pour centraliser la gestion des requêtes HTTP
 * @returns {Object} Instance axios avec les méthodes get, post, put, delete
 */
export function useAxios() {
  // Utilise le contexte AxiosContext
  const { axiosInstance } = useAxiosContext();
  
  // Retourne l'instance axios pour maintenir la compatibilité avec le code existant
  return axiosInstance;
}
