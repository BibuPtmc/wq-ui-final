import { useEffect } from 'react';
import { useAuth } from '../hooks/authProvider';
import { useAxiosContext } from './AxiosContext';

/**
 * Ce composant s'abonne à l'instance Axios pour détecter les erreurs 401 globalement
 * et déclenche le logout automatique (avec redirection) via le contexte Auth.
 * À placer dans AppProviders ou à la racine de l'app.
 */
export default function AxiosLogoutHandler() {
  const { logout } = useAuth();
  const { axiosInstance } = useAxiosContext();

  useEffect(() => {
    // Ajoute un intercepteur qui déclenche le logout sur 401
    const interceptor = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        // Déclenche le logout sur 401 (Unauthorized) ou 403 (Forbidden)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout({ sessionExpired: true });
        }
        return Promise.reject(error);
      }
    );
    // Nettoyage à l'unmount
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [axiosInstance, logout]);

  return null;
}
