import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAxios } from "../hooks/useAxios";
import { useAuth } from "../contexts/AuthProvider";
import { reverseGeocode } from "../utils/geocodingService";
import { useCatsContext } from "./CatsContext";

// Création du contexte
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const axios = useAxios();
  const { isLoggedIn, userData, setUserData } = useAuth();
  const { updateAllOwnedCatsAddress } = useCatsContext();

  // États pour le profil utilisateur
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    latitude: null,
    longitude: null,
    gender: "",
    birthDay: "",
    phone: "",
  });

  // États pour la gestion des mots de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    matchingPassword: "",
  });

  // États pour les commandes
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // États pour les retours d'opérations
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Fonction pour récupérer les données du profil utilisateur
  const fetchProfileData = useCallback(async () => {
    if (!isLoggedIn || !sessionStorage.getItem("token")) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("users/me");

      setProfileData({
        firstName: response.firstName || "",
        lastName: response.lastName || "",
        address: response.address?.address || "",
        city: response.address?.city || "",
        postalCode: response.address?.postalCode || "",
        latitude: response.address?.latitude || null,
        longitude: response.address?.longitude || null,
        gender: response.gender || "",
        birthDay: response.birthDay || "",
        phone: response.phone || "",
      });

      // Mettre à jour les données utilisateur dans AuthContext si nécessaire
      if (setUserData) {
        setUserData(response);
      }
    } catch (error) {
      // Log réduit pour améliorer les performances
      setUpdateError("Erreur lors du chargement des données utilisateur");
    } finally {
      setLoading(false);
    }
  }, [axios, isLoggedIn, setUserData]);

  // Charger les données du profil au montage du composant
  useEffect(() => {
    if (isLoggedIn) {
      fetchProfileData();
    }
  }, [isLoggedIn, fetchProfileData]);

  // Fonction pour mettre à jour le profil utilisateur
  const updateProfile = useCallback(
    async (profileFormData) => {
      if (!isLoggedIn) return false;

      try {
        setUpdateError("");
        setUpdateSuccess(false);

        // Préparer les données pour l'API
        const updatedUserData = {
          firstName: profileFormData.firstName,
          lastName: profileFormData.lastName,
          gender: profileFormData.gender,
          birthDay: profileFormData.birthDay,
          phone: profileFormData.phone,
          address: profileFormData.address,
          city: profileFormData.city,
          postalCode: profileFormData.postalCode,
          latitude: profileFormData.latitude,
          longitude: profileFormData.longitude,
        };

        await axios.put("users/update", updatedUserData);

        // Mettre à jour l'état local
        setProfileData(profileFormData);

        // Mettre à jour les données utilisateur dans AuthContext
        if (setUserData) {
          setUserData({
            ...userData,
            ...updatedUserData,
          });
        }

        setUpdateSuccess(true);

        // Réinitialiser le message de succès après 3 secondes
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);

        return true;
      } catch (error) {
        // Log réduit pour améliorer les performances
        setUpdateError(
          "Erreur lors de la mise à jour du profil. Veuillez réessayer."
        );
        return false;
      }
    },
    [axios, isLoggedIn, userData, setUserData]
  );

  // Fonction pour mettre à jour le mot de passe
  const updatePassword = useCallback(
    async (passwordFormData) => {
      if (!isLoggedIn) return false;

      try {
        setUpdateError("");
        setUpdateSuccess(false);

        // Vérifier que les deux mots de passe correspondent
        if (
          passwordFormData.newPassword !== passwordFormData.matchingPassword
        ) {
          setUpdateError("Les mots de passe ne correspondent pas");
          return false;
        }

        // Préparer les données pour l'API
        const passwordData = {
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
          matchingPassword: passwordFormData.matchingPassword,
        };

        await axios.put("users/update-password", passwordData);

        // Réinitialiser le formulaire
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          matchingPassword: "",
        });

        setUpdateSuccess(true);

        // Déconnecter l'utilisateur après 2 secondes
        setTimeout(() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("userData");
          window.location.href = "/login";
        }, 2000);

        return true;
      } catch (error) {
        // Log réduit pour améliorer les performances
        setUpdateError(
          "Erreur lors de la mise à jour du mot de passe. Veuillez vérifier votre mot de passe actuel."
        );
        return false;
      }
    },
    [axios, isLoggedIn]
  );

  // Fonction pour supprimer le compte
  const deleteAccount = useCallback(async () => {
    if (!isLoggedIn) return false;

    try {
      // Tenter de supprimer le compte
      await axios.delete(`users/delete?id=${userData.userId}`);

      // Si la suppression réussit, déconnecter l'utilisateur
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");

      return true;
    } catch (error) {
      // Gérer les différents types d'erreurs
      if (error.response) {
        const { status, data } = error.response;

        if (status === 500) {
          console.error(
            "Erreur serveur lors de la suppression du compte:",
            error
          );
          // Le backend devrait maintenant gérer correctement les demandes de liaison
          // mais nous gardons ce message au cas où d'autres contraintes d'intégrité seraient découvertes
          setUpdateError(
            "Impossible de supprimer votre compte car vous avez des données associées actives. " +
              "Veuillez d'abord supprimer tous vos chats et annuler toutes les demandes de liaison avant de supprimer votre compte."
          );
        } else if (status === 404) {
          setUpdateError("Compte utilisateur non trouvé.");
        } else {
          // Utiliser le message d'erreur du backend s'il est disponible
          setUpdateError(
            data ||
              "Erreur lors de la suppression du compte. Veuillez réessayer plus tard."
          );
        }
      } else {
        console.error("Erreur lors de la suppression du compte:", error);
        setUpdateError(
          "Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer."
        );
      }
      return false;
    }
  }, [axios, isLoggedIn, userData]);

  // Fonction pour récupérer l'historique des commandes
  const fetchOrders = useCallback(
    async (forceRefresh = false) => {
      if (!isLoggedIn) return;

      // Ne charger les commandes que si elles n'ont pas déjà été chargées ou si forceRefresh est true
      if (ordersLoaded && !forceRefresh) return;

      try {
        setOrdersLoading(true);
        const response = await axios.get("/ecommerce/orders");
        const userId = userData?.id;
        // Filtrage robuste : accepte userId ou user.id
        const myOrders = Array.isArray(response)
          ? response.filter(
              (order) =>
                order.userId === userId ||
                (order.user && order.user.id === userId)
            )
          : [];
        setOrders(myOrders);
        setOrdersLoaded(true);
      } catch (error) {
        // Log réduit pour améliorer les performances
      } finally {
        setOrdersLoading(false);
      }
    },
    [axios, isLoggedIn, ordersLoaded, userData]
  );

  // Rafraîchir les commandes à chaque changement d'utilisateur
  useEffect(() => {
    if (isLoggedIn && userData?.id) {
      fetchOrders(true); // force refresh
    }
  }, [isLoggedIn, userData?.id, fetchOrders]);

  // Fonction pour mettre à jour la localisation à partir des coordonnées
  const updateLocationFromCoordinates = useCallback(
    async (longitude, latitude) => {
      try {
        const addressInfo = await reverseGeocode(longitude, latitude);

        setProfileData((prev) => ({
          ...prev,
          longitude,
          latitude,
          address: addressInfo?.address || prev.address,
          city: addressInfo?.city || prev.city,
          postalCode: addressInfo?.postalCode || prev.postalCode,
        }));

        return true;
      } catch (error) {
        // Log réduit pour améliorer les performances
        return false;
      }
    },
    []
  );

  // Fonction pour mettre à jour l'adresse
  const updateAddressData = useCallback((addressData) => {
    setProfileData((prev) => ({
      ...prev,
      address: addressData.address || prev.address,
      city: addressData.city || prev.city,
      postalCode: addressData.postalCode || prev.postalCode,
      latitude: addressData.latitude || prev.latitude,
      longitude: addressData.longitude || prev.longitude,
    }));
  }, []);

  // Valeur du contexte
  const value = {
    profileData,
    setProfileData,
    passwordForm,
    setPasswordForm,
    orders,
    ordersLoading,
    loading,
    updateSuccess,
    updateError,
    fetchProfileData,
    updateProfile,
    updatePassword,
    deleteAccount,
    fetchOrders,
    updateLocationFromCoordinates,
    updateAddressData,
    setUpdateError,
    setUpdateSuccess,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
