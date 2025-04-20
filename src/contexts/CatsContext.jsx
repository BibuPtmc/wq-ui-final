import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAxios } from '../hooks/useAxios';
import { formatDateForJava, convertToEnum } from '../utils/enumUtils';
import { useAuth } from '../hooks/authProvider';

// Création du contexte
const CatsContext = createContext();

export const CatsProvider = ({ children }) => {
  const axios = useAxios();
  const { isLoggedIn } = useAuth();
  const [reportedCats, setReportedCats] = useState([]);
  const [ownedCats, setOwnedCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [userAddress, setUserAddress] = useState(null);

  // Use a ref to track if we've already run the initial fetch
  const initialFetchDone = useRef(false);

  const fetchUserAddress = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
      const response = await axios.get("users/me", { headers });
      
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
      // Log réduit pour améliorer les performances
    }
  }, [axios]);

  const fetchCats = useCallback(async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      if (!isLoggedIn) return;
      
      // Indiquer que le chargement est en cours
      setLoading(true);
      
      const headers = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
      
      // Fetch reported cats
      try {
        const reportedResponse = await axios.get("cat/reportedCats", { headers });
        setReportedCats(reportedResponse || []); 
      } catch (error) {
        setReportedCats([]);
      }

      // Fetch owned cats
      try {
        const ownedResponse = await axios.get("cat/ownedCats", { headers });
        setOwnedCats(ownedResponse || []);
      } catch (error) {
        setOwnedCats([]);
      }

      // Fetch user address
      await fetchUserAddress();
      
      setLoading(false);
      initialFetchDone.current = true;
    } catch (error) {
      // Log réduit pour améliorer les performances
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

  const handleDeleteReportedCat = async (catStatusId) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };
      // Utiliser le nouvel endpoint pour supprimer un statut de chat
      await axios.delete(`/cat-status/delete?id=${catStatusId}`, { headers });
      setReportedCats(prevCats => prevCats.filter(cat => cat.catStatusId !== catStatusId));
      setSuccessMessage('Le chat a été supprimé avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000); // Le message disparaît après 3 secondes
      return true;
    } catch (error) {
      // Log réduit pour améliorer les performances
      return false;
    }
  };

  const handleEditReportedCat = async (catStatusId, updatedData) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };

      const currentCat = reportedCats.find(cat => cat.catStatusId === catStatusId);
      if (!currentCat) {
        throw new Error("Chat non trouvé");
      }

      // Utilisation de la fonction convertToEnum centralisée
      const catDTO = {
        catId: currentCat.cat.catId,
        name: updatedData.name,
        color: convertToEnum(updatedData.color, currentCat.cat.color),
        eyeColor: convertToEnum(updatedData.eyeColor, currentCat.cat.eyeColor),
        breed: convertToEnum(updatedData.breed, currentCat.cat.breed),
        dateOfBirth: updatedData.dateOfBirth || currentCat.cat.dateOfBirth,
        imageUrl: updatedData.imageUrl || currentCat.cat.imageUrl,
        imageUrls: updatedData.imageUrls || currentCat.cat.imageUrls,
        gender: updatedData.gender || currentCat.cat.gender,
        chipNumber: updatedData.chipNumber || currentCat.cat.chipNumber,
        furType: convertToEnum(updatedData.furType, currentCat.cat.furType),
        comment: updatedData.hasOwnProperty('comment') ? updatedData.comment : currentCat.cat.comment
      };

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
      await axios.put(`/cat/update`, catDTO, { headers });

      let response = null;
      if (statusHasChanged) {
        // Mettre à jour le statut du chat seulement si le statut a changé
        response = await axios.put(`/cat/updateStatus`, catStatus, { headers });
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
      
      setSuccessMessage('Le chat a été mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du chat:", error);
      return false;
    }
  };

  const handleEditOwnedCat = async (catId, updatedData) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };

      const currentCatStatus = ownedCats.find(catStatus => catStatus.cat.catId === catId);
      if (!currentCatStatus) {
        throw new Error("Chat non trouvé");
      }

      // Utilisation de la fonction convertToEnum centralisée
      const catDTO = {
        catId: catId,
        name: updatedData.name,
        color: convertToEnum(updatedData.color, currentCatStatus.cat.color),
        eyeColor: convertToEnum(updatedData.eyeColor, currentCatStatus.cat.eyeColor),
        breed: convertToEnum(updatedData.breed, currentCatStatus.cat.breed),
        dateOfBirth: updatedData.dateOfBirth || currentCatStatus.cat.dateOfBirth,
        imageCatData: updatedData.imageCatData || currentCatStatus.cat.imageCatData,
        gender: updatedData.gender || currentCatStatus.cat.gender,
        chipNumber: updatedData.chipNumber || currentCatStatus.cat.chipNumber,
        furType: convertToEnum(updatedData.furType, currentCatStatus.cat.furType),
        comment: updatedData.hasOwnProperty('comment') ? updatedData.comment : currentCatStatus.cat.comment
      };

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
      await axios.put(`/cat/update`, catDTO, { headers });
      
      // Mettre à jour le statut du chat uniquement si le statut a changé
      if (statusHasChanged) {
        await axios.put(`/cat/updateStatus`, catStatus, { headers });
      }
      
      // Mettre à jour l'état local
      setOwnedCats(prevCats => prevCats.map(cat => 
        cat.cat.catId === catId 
          ? {
              ...cat,
              statusCat: updatedData.statusCat || cat.statusCat,
              reportDate: formattedDate,
              cat: {
                ...cat.cat,
                name: updatedData.name,
                color: convertToEnum(updatedData.color, cat.cat.color),
                eyeColor: convertToEnum(updatedData.eyeColor, cat.cat.eyeColor),
                breed: convertToEnum(updatedData.breed, cat.cat.breed),
                dateOfBirth: updatedData.dateOfBirth || cat.cat.dateOfBirth,
                imageCatData: updatedData.imageCatData || cat.cat.imageCatData,
                gender: updatedData.gender || cat.cat.gender,
                chipNumber: updatedData.chipNumber || cat.cat.chipNumber,
                furType: convertToEnum(updatedData.furType, cat.cat.furType),
                comment: updatedData.hasOwnProperty('comment') ? updatedData.comment : cat.cat.comment,
              }
            }
          : cat
      ));
      
      setSuccessMessage('Le chat a été mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du chat:", error);
      return false;
    }
  };

  const handleDeleteOwnedCat = async (catId) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };
      await axios.delete(`/cat/delete?id=${catId}`, { headers });
      setOwnedCats(prevCats => prevCats.filter(cat => cat.cat.catId !== catId));
      setSuccessMessage('Le chat a été supprimé avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000); // Le message disparaît après 3 secondes
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du chat:", error);
      return false;
    }
  };

  // Fonction pour déclarer un chat possédé comme perdu avec une localisation personnalisée
  const handleReportCatAsLost = async (catId, lostData) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };

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
        cat: {
          catId: catId,
          name: currentCatStatus.cat.name,
          breed: convertToEnum(currentCatStatus.cat.breed, ""),
          color: convertToEnum(currentCatStatus.cat.color, ""),
          dateOfBirth: currentCatStatus.cat.dateOfBirth,
          imageCatData: currentCatStatus.cat.imageCatData,
          gender: currentCatStatus.cat.gender,
          chipNumber: currentCatStatus.cat.chipNumber,
          furType: convertToEnum(currentCatStatus.cat.furType, ""),
          eyeColor: convertToEnum(currentCatStatus.cat.eyeColor, "")
        },
        comment: lostData.comment || "Chat perdu",
        statusCat: "LOST", // Statut perdu
        reportDate: formattedDate,
        location: location
      };

      // Mettre à jour le statut du chat
      const response = await axios.post(`/cat/register`, catStatus, { headers });
      
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
      
      setSuccessMessage('Votre chat a été déclaré comme perdu avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (error) {
      // Log réduit pour améliorer les performances
      return false;
    }
  };

  const findPotentialFoundCats = async (catId) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };
      const response = await axios.get(`/cat/potentialFoundCats/${catId}`, { headers });
      return response;
    } catch (error) {
      // Log réduit pour améliorer les performances
      return [];
    }
  };

  const findPotentialLostCats = async (catId) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };
      const response = await axios.get(`/cat/potentialLostCats/${catId}`, { headers });
      return response;
    } catch (error) {
      // Log réduit pour améliorer les performances
      return [];
    }
  };

  return (
    <CatsContext.Provider value={{
      reportedCats,
      ownedCats,
      loading,
      successMessage,
      userAddress,
      handleDeleteReportedCat,
      handleEditReportedCat,
      handleEditOwnedCat,
      handleDeleteOwnedCat,
      handleReportCatAsLost,
      findPotentialFoundCats,
      findPotentialLostCats,
      fetchCats,
      fetchUserAddress
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
