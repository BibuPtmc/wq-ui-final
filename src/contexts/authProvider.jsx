import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAxios } from "../hooks/useAxios";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "./NotificationContext";

const AuthContext = createContext();

export const AuthProvider = ({ children, onLogoutRef }) => {
  const { showNotification } = useNotification();
  const axios = useAxios();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const initialLoadDone = useRef(false);

  // Fonction pour définir les données utilisateur et les sauvegarder dans sessionStorage
  const setUserDataWithStorage = useCallback((data) => {
    setUserData(data);
    if (data) {
      sessionStorage.setItem("userData", JSON.stringify(data));
    } else {
      sessionStorage.removeItem("userData");
    }
  }, []);

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = useCallback(async () => {
    // Éviter de recharger les données si nous l'avons déjà fait
    if (initialLoadDone.current && userData) {
      return;
    }

    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    // D'abord, essayons de récupérer les données du sessionStorage
    const storedUserData = sessionStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setLoading(false);
        initialLoadDone.current = true;
        return;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur du sessionStorage:",
          error
        );
      }
    }

    // Si pas de données en sessionStorage, récupérer depuis l'API
    try {
      const response = await axios.get("users/me");
      setUserDataWithStorage(response);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (!isLoggedIn) {
        setUserDataWithStorage(null);
      }
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [setUserDataWithStorage, userData, isLoggedIn, axios]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      fetchUserData();
    }
  }, [fetchUserData]);

  const navigate = useNavigate();

  /**
   * Déconnecte l'utilisateur.
   * Si la déconnexion est causée par une erreur 401, affiche une notification spécifique.
   * Sinon, notification générique.
   * @param {Object} [options]
   * @param {boolean} [options.sessionExpired]
   */
  // Fonction de déconnexion
  const logout = useCallback(
    (options = {}) => {
      setIsLoggedIn(false);
      setUserDataWithStorage(null);
      sessionStorage.removeItem("token");
      initialLoadDone.current = false;
      navigate("/login", { replace: true });

      if (options.sessionExpired) {
        showNotification(
          "Votre session a expiré, veuillez vous reconnecter.",
          "error"
        );
      } else {
        showNotification("Vous avez été déconnecté.", "info");
      }
    },
    [setUserDataWithStorage, navigate, showNotification]
  );

  // Exposer la fonction de déconnexion via la ref
  useEffect(() => {
    if (onLogoutRef) {
      onLogoutRef.current = logout;
    }
  }, [logout, onLogoutRef]);

  if (loading) {
    return null; // Ou un composant de chargement
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData: setUserDataWithStorage,
        fetchUserData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
