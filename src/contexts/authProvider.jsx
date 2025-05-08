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

export const AuthProvider = ({ children }) => {
  const location = useLocation();
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

    if (!sessionStorage.getItem("token")) {
      setLoading(false);
      setIsLoggedIn(false);
      setUserDataWithStorage(null);
      return;
    }

    // D'abord, essayons de récupérer les données du sessionStorage
    const storedUserData = sessionStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setIsLoggedIn(true);
        setLoading(false);
        initialLoadDone.current = true;
        return;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur du sessionStorage:",
          error
        );
        // Continuer pour essayer de récupérer les données depuis l'API
      }
    }

    // Si nous n'avons pas pu récupérer les données du sessionStorage, essayons l'API
    try {
      const response = await axios.get("users/me");
      setIsLoggedIn(true);
      setUserDataWithStorage(response);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Ne pas déconnecter l'utilisateur si l'API échoue mais que le token est présent
      // Nous gardons l'utilisateur connecté avec les données minimales
      if (sessionStorage.getItem("token")) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserDataWithStorage(null);
      }
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [setUserDataWithStorage, userData]);

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
  const logout = useCallback(
    (options = {}) => {
      setIsLoggedIn(false);
      setUserDataWithStorage(null);
      sessionStorage.removeItem("token");
      setTimeout(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.info(
            "%cVous êtes déconnecté(e). Le token est maintenant vide.",
            "color: green; font-weight: bold;"
          );
        } else {
          console.warn(
            "%cDéconnexion attendue, mais le token existe encore :",
            "color: orange; font-weight: bold;",
            token
          );
        }
      }, 100);
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

  if (loading) {
    return null; // Or a loading spinner
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

export const useAuth = () => useContext(AuthContext);
