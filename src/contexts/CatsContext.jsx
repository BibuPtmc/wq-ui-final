import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

/**
 * Affiche une notification d’erreur API standardisée.
 * @param {function} showNotification - Fonction de notification du contexte
 * @param {string} contextMsg - Message d’intention (ex: "lors de la modification du chat")
 * @param {object} error - Objet erreur capturé
 */
function notifyApiError(showNotification, contextMsg, error) {
  showNotification(
    `Erreur ${contextMsg} : ` +
    (error?.response?.data?.message || error?.message || "Erreur inconnue"),
    "error"
  );
}

/**
 * Construit un objet cat conforme à l’API à partir d’un objet source.
 * @param {object} catData - Données du chat (formulaire ou state)
 * @param {function} convertToEnum - Fonction de conversion enum
 * @returns {object}
 */
function buildCatDTO(catData, convertToEnum) {
  return {
    catId: catData.catId,
    name: catData.name,
    breed: convertToEnum(catData.breed, ""),
    color: convertToEnum(catData.color, ""),
    dateOfBirth: catData.dateOfBirth,
    imageCatData: catData.imageCatData,
    gender: catData.gender,
    chipNumber: catData.chipNumber,
    furType: convertToEnum(catData.furType, ""),
    eyeColor: convertToEnum(catData.eyeColor, "")
  };
}

/**
 * Construit un objet catDTO pour update/create à partir de données mises à jour et d’un état courant.
 * @param {object} updatedData - Données du formulaire ou de la modification
 * @param {object} currentCat - Données actuelles du chat (state)
 * @param {function} convertToEnum - Fonction de conversion enum
 * @returns {object}
 */
function buildUpdatedCatDTO(updatedData, currentCat, convertToEnum) {
  return {
    catId: updatedData.catId || currentCat.catId,
    name: updatedData.name || currentCat.name,
    color: convertToEnum(updatedData.color, currentCat.color),
    eyeColor: convertToEnum(updatedData.eyeColor, currentCat.eyeColor),
    breed: convertToEnum(updatedData.breed, currentCat.breed),
    dateOfBirth: updatedData.dateOfBirth || currentCat.dateOfBirth,
    imageCatData: updatedData.imageCatData || currentCat.imageCatData,
    gender: updatedData.gender || currentCat.gender,
    chipNumber: updatedData.chipNumber || currentCat.chipNumber,
    furType: convertToEnum(updatedData.furType, currentCat.furType),
    imageUrls: updatedData.imageUrls || currentCat.imageUrls,
    imageUrl: updatedData.imageUrl || currentCat.imageUrl,
    comment: updatedData.hasOwnProperty('comment') ? updatedData.comment : currentCat.comment
  };
}


import { useAxios } from '../hooks/useAxios';
import { formatDateForJava, convertToEnum } from '../utils/enumUtils';
import { useAuth } from '../hooks/authProvider';
import { useNotification } from './NotificationContext';

// Création du contexte
const CatsContext = createContext();

export const CatsProvider = ({ children }) => {
  const axios = useAxios();
  const { isLoggedIn } = useAuth();
  const [reportedCats, setReportedCats] = useState([]);
  const [ownedCats, setOwnedCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [userAddress, setUserAddress] = useState(null);

  // Use a ref to track if we've already run the initial fetch
  const initialFetchDone = useRef(false);

  /**
   * Récupère l'adresse de l'utilisateur connecté depuis l'API et met à jour le state local userAddress.
   * Affiche une notification en cas d'erreur.
   */
  const fetchUserAddress = useCallback(async () => {
    try {
      const response = await axios.get("users/me");
      
      if (response && response.address) {
        setUserAddress({
          address: response.address.address || "",
          city: response.address.city || "",
          postalCode: response.address.postalCode || "",
          latitude: response.address.latitude || null,
          longitude: response.address.longitude || null
        });
      }
    } catch (error) {
      showNotification("Erreur lors de la récupération de l'adresse utilisateur : " + (error?.response?.data?.message || error?.message || "Erreur inconnue"), "error");
    }
  }, [axios]);

  /**
   * Récupère les chats signalés et possédés de l'utilisateur depuis l'API.
   * Met à jour les états reportedCats et ownedCats, ainsi que l'adresse utilisateur.
   * Gère le chargement et les notifications d'erreur.
   */
  const fetchCats = useCallback(async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      if (!isLoggedIn) return;
      
      // Indiquer que le chargement est en cours
      setLoading(true);
      
      // Fetch reported cats
      try {
        const reportedResponse = await axios.get("cat/reportedCats");
        setReportedCats(reportedResponse || []); 
      } catch (error) {
        setReportedCats([]);
      }

      // Fetch owned cats
      try {
        const ownedResponse = await axios.get("cat/ownedCats");
        setOwnedCats(ownedResponse || []);
      } catch (error) {
        setOwnedCats([]);
      }

      // Fetch user address
      await fetchUserAddress();
      
      setLoading(false);
      initialFetchDone.current = true;
    } catch (error) {
      notifyApiError(showNotification, "lors de la récupération des chats", error);
      setLoading(false);
    }
  }, [axios, isLoggedIn, fetchUserAddress]);

  // Refetch cats when user logs in
  useEffect(() => {
    if (isLoggedIn && sessionStorage.getItem("token")) {
      fetchCats();
    } else {
      // Reset state when user logs out
      setReportedCats([]);
      setOwnedCats([]);
      initialFetchDone.current = false;
    }
  }, [isLoggedIn, fetchCats]);

  /**
   * Supprime un chat signalé (catStatusId) via l'API et met à jour le state local.
   * Affiche une notification de succès ou d'erreur.
   */
  const handleDeleteReportedCat = async (catStatusId) => {
    try {
      // Trouver le chat signalé correspondant
      const catToDelete = reportedCats.find(cat => cat.catStatusId === catStatusId);
      if (!catToDelete) throw new Error("Chat signalé introuvable");
      const catId = catToDelete.cat.catId;
      // Utiliser le même endpoint que pour les chats possédés
      await axios.delete(`/cat/delete?id=${catId}`);
      setReportedCats(prevCats => prevCats.filter(cat => cat.cat.catId !== catId));
      showNotification('Le chat a été supprimé avec succès !', 'success');
      return true;
    } catch (error) {
      showNotification("Erreur lors de la suppression du chat signalé : " + (error?.response?.data?.message || error?.message || "Erreur inconnue"), "error");
      return false;
    }
  };

  /**
   * Modifie les informations d'un chat signalé et/ou change son statut (ex : vers possédé).
   * Met à jour l'API et le state local, affiche une notification adaptée.
   */
  const handleEditReportedCat = async (catStatusId, updatedData) => {
    try {
      const currentCat = reportedCats.find(cat => cat.catStatusId === catStatusId);
      if (!currentCat) {
        throw new Error("Chat non trouvé");
      }

      // Utilisation de la fonction convertToEnum centralisée
      const catDTO = buildUpdatedCatDTO(updatedData, currentCat.cat, convertToEnum);


      // Vérifier si nous changeons le statut du chat (par exemple, de trouvé à possédé)
      const newStatus = updatedData.statusCat || currentCat.statusCat;
      const isChangingToOwned = newStatus === "OWN" && currentCat.statusCat !== "OWN";

      // Si nous changeons le statut à "possédé", utiliser l'adresse de l'utilisateur
      let location;
      if (isChangingToOwned && userAddress) {
        location = { ...userAddress };
      } else {
        location = {
          latitude: updatedData.location?.latitude || currentCat.location?.latitude,
          longitude: updatedData.location?.longitude || currentCat.location?.longitude,
          address: updatedData.location?.address || currentCat.location?.address,
          city: updatedData.location?.city || currentCat.location?.city,
          postalCode: updatedData.location?.postalCode || currentCat.location?.postalCode
        };
      }

      // Formater la date actuelle pour Java LocalDateTime
      const now = new Date();
      const formattedDate = formatDateForJava(now.toISOString());

      // Créer l'objet catStatus pour la mise à jour
      const catStatus = {
        catStatusId: catStatusId,
        statusCat: newStatus,
        reportDate: formattedDate,
        location: location,
        cat: {
          catId: currentCat.cat.catId
        }
      };

      // Vérifier si le statut du chat a changé
      const statusHasChanged = updatedData.statusCat && updatedData.statusCat !== currentCat.statusCat;

      // Mettre à jour les informations du chat
      await axios.put(`/cat/update`, catDTO);

      let response = null;
      if (statusHasChanged) {
        // Mettre à jour le statut du chat seulement si le statut a changé
        response = await axios.put(`/cat/updateStatus`, catStatus);
      }

      // Mettre à jour l'état local
      if (isChangingToOwned) {
        // Supprimer de la liste des chats signalés
        setReportedCats(prevCats => prevCats.filter(cat => cat.catStatusId !== catStatusId));
        
        // Ajouter à la liste des chats possédés
        const updatedOwnedCat = {
          catStatusId: (response && response.catStatusId) || catStatusId,
          statusCat: "OWN",
          reportDate: formattedDate,
          location: location,
          cat: catDTO
        };
        setOwnedCats(prevCats => [...prevCats, updatedOwnedCat]);
      } else {
        // Mettre à jour dans la liste des chats signalés
        setReportedCats(prevCats => prevCats.map(cat => 
          cat.catStatusId === catStatusId 
            ? {
                ...cat,
                statusCat: newStatus,
                reportDate: formattedDate,
                location: location,
                cat: catDTO
              }
            : cat
        ));
      }
      
      showNotification('Le chat a été mis à jour avec succès !', 'success');
      return true;
    } catch (error) {
      notifyApiError(showNotification, "lors de la mise à jour du chat signalé", error);
      return false;
    }
  };

  /**
   * Modifie les informations d'un chat possédé (catId) via l'API et met à jour le state local.
   * Affiche une notification de succès ou d'erreur.
   */
  const handleEditOwnedCat = async (catId, updatedData) => {
    try {
      const currentCatStatus = ownedCats.find(catStatus => catStatus.cat.catId === catId);
      if (!currentCatStatus) {
        throw new Error("Chat non trouvé");
      }

      // Utilisation de la fonction convertToEnum centralisée
      const catDTO = buildUpdatedCatDTO(updatedData, currentCatStatus.cat, convertToEnum);

      // Formater la date actuelle pour Java LocalDateTime
      const now = new Date();
      const formattedDate = formatDateForJava(now.toISOString());

      // Vérifier si le statut du chat a changé
      const statusHasChanged = updatedData.statusCat && updatedData.statusCat !== currentCatStatus.statusCat;

      // Créer l'objet pour la mise à jour du statut
      const catStatus = {
        catStatusId: currentCatStatus.catStatusId,
        statusCat: updatedData.statusCat || currentCatStatus.statusCat,
        reportDate: formattedDate,
        location: {
          latitude: userAddress?.latitude || currentCatStatus.location?.latitude,
          longitude: userAddress?.longitude || currentCatStatus.location?.longitude,
          address: userAddress?.address || currentCatStatus.location?.address,
          city: userAddress?.city || currentCatStatus.location?.city,
          postalCode: userAddress?.postalCode || currentCatStatus.location?.postalCode
        },
        cat: {
          catId: catId
        }
      };

      // Mettre à jour les informations du chat
      await axios.put(`/cat/update`, catDTO);
      
      // Mettre à jour le statut du chat uniquement si le statut a changé
      if (statusHasChanged) {
        await axios.put(`/cat/updateStatus`, catStatus);
      }
      
      // Mettre à jour l'état local
      setOwnedCats(prevCats => prevCats.map(cat => 
        cat.cat.catId === catId 
          ? {
              ...cat,
              statusCat: updatedData.statusCat || cat.statusCat,
              reportDate: formattedDate,
              cat: catDTO
            }
          : cat
      ));
      return true;
    } catch (error) {
      notifyApiError(showNotification, "lors de la mise à jour du chat possédé", error);
      return false;
    }
  };

  const handleDeleteOwnedCat = async (catId) => {
    try {
      await axios.delete(`/cat/delete?id=${catId}`);
      setOwnedCats(prevCats => prevCats.filter(cat => cat.cat.catId !== catId));
      showNotification('Le chat a été supprimé avec succès !', 'success'); 
      return true;
    } catch (error) {
      notifyApiError(showNotification, "lors de la suppression du chat possédé", error);
      return false;
    }
  };


  // Fonction pour déclarer un chat possédé comme perdu avec une localisation personnalisée
  /**
   * Déclare un chat possédé comme perdu avec une localisation personnalisée.
   * Met à jour l'API, retire le chat de la liste des possédés et l'ajoute aux signalés.
   * Affiche une notification adaptée.
   */
  const handleReportCatAsLost = async (catId, lostData) => {
    try {
      const currentCatStatus = ownedCats.find(catStatus => catStatus.cat.catId === catId);
      if (!currentCatStatus) {
        throw new Error("Chat non trouvé");
      }
      
      // Utilisation de la fonction convertToEnum centralisée

      // Formater la date actuelle pour Java LocalDateTime
      const now = new Date();
      const formattedDate = formatDateForJava(now.toISOString());

      // Utiliser l'adresse de l'utilisateur si aucune localisation personnalisée n'est fournie
      // Toujours exiger une localisation personnalisée pour le passage d'un chat possédé à perdu
      if (!lostData.location || !lostData.location.latitude || !lostData.location.longitude) {
        throw new Error("Veuillez sélectionner une localisation précise où le chat a été perdu.");
      }
      const location = {
        latitude: lostData.location.latitude,
        longitude: lostData.location.longitude,
        address: lostData.location.address,
        city: lostData.location.city,
        postalCode: lostData.location.postalCode
      };

      // Créer l'objet catStatus pour déclarer le chat comme perdu (structure similaire à RegisterCat)
      const catStatus = {
        cat: buildCatDTO(currentCatStatus.cat, convertToEnum),
        comment: lostData.comment || "Chat perdu",
        statusCat: "LOST", // Statut perdu
        reportDate: formattedDate,
        location: location
      };

      // Mettre à jour le statut du chat
      const response = await axios.post(`/cat/register`, catStatus);
      
      // Mettre à jour l'état local
      setOwnedCats(prevCats => prevCats.filter(cat => cat.cat.catId !== catId));
      
      // Ajouter le chat à la liste des chats signalés
      const updatedCat = {
        catStatusId: response.catStatusId,
        statusCat: "LOST",
        comment: lostData.comment || "Chat perdu",
        reportDate: formattedDate,
        location: location,
        cat: currentCatStatus.cat
      };
      
      setReportedCats(prevCats => [...prevCats, updatedCat]);
      
      showNotification('Votre chat a été déclaré comme perdu avec succès !', 'success');
      return true;
    } catch (error) {
      showNotification("Erreur lors de la récupération de l'adresse utilisateur : " + (error?.response?.data?.message || error?.message || "Erreur inconnue"), "error");
      return false;
    }
  };

  /**
   * Recherche les chats trouvés potentiellement correspondants à un chat perdu donné (catId).
   * Retourne la liste depuis l'API ou [] en cas d'erreur, notifie l'utilisateur.
   */
  const findPotentialFoundCats = async (catId) => {
    try {
      const response = await axios.get(`/cat/potentialFoundCats/${catId}`);
      return response;
    } catch (error) {
      showNotification("Erreur lors de la récupération de l'adresse utilisateur : " + (error?.response?.data?.message || error?.message || "Erreur inconnue"), "error");
      return [];
    }
  };

  /**
   * Recherche les chats perdus potentiellement correspondants à un chat trouvé donné (catId).
   * Retourne la liste depuis l'API ou [] en cas d'erreur, notifie l'utilisateur.
   */
  const findPotentialLostCats = async (catId) => {
    try {
      const response = await axios.get(`/cat/potentialLostCats/${catId}`);
      return response;
    } catch (error) {
      showNotification("Erreur lors de la récupération de l'adresse utilisateur : " + (error?.response?.data?.message || error?.message || "Erreur inconnue"), "error");
      return [];
    }
  };

  // Nouvelle fonction pour mettre à jour l'adresse de tous les chats possédés
  /**
   * Met à jour l'adresse de tous les chats possédés avec une nouvelle adresse (newAddress).
   * Met à jour l'API et le state local, affiche une notification de succès.
   */
  const updateAllOwnedCatsAddress = async (newAddress) => {
    try {
      // Pour chaque chat possédé, on met à jour la localisation
      const updatePromises = ownedCats.map(async (catStatus) => {
        const catDTO = {
          ...catStatus.cat,
          // On conserve toutes les infos du chat, mais on met à jour la localisation
          location: {
            address: newAddress.address,
            city: newAddress.city,
            postalCode: newAddress.postalCode,
            latitude: newAddress.latitude,
            longitude: newAddress.longitude,
          }
        };
        await axios.put(`/cat/update`, catDTO);
        return {
          ...catStatus,
          location: catDTO.location,
          cat: {
            ...catStatus.cat,
            location: catDTO.location,
          }
        };
      });
      // Met à jour localement l'état après toutes les requêtes
      const updatedCats = await Promise.all(updatePromises);
      setOwnedCats(updatedCats);
      showNotification('L\'adresse de tous vos chats a été mise à jour !', 'success');
      return true;
    } catch (error) {
      // Log réduit pour les performances
      return false;
    }
  };

  return (
    <CatsContext.Provider value={{
      reportedCats,
      ownedCats,
      loading,
      userAddress,
      handleDeleteReportedCat,
      handleEditReportedCat,
      handleEditOwnedCat,
      handleDeleteOwnedCat,
      handleReportCatAsLost,
      findPotentialFoundCats,
      findPotentialLostCats,
      fetchCats,
      fetchUserAddress,
      updateAllOwnedCatsAddress
    }}>
      {children}
    </CatsContext.Provider>
  );
};

export const useCatsContext = () => {
  const context = useContext(CatsContext);
  if (!context) {
    throw new Error('useCatsContext must be used within a CatsProvider');
  }
  return context;
};