import React, { useState, useEffect } from 'react';
import { useAxios } from './useAxios';
import { formatDateForJava, convertToEnum } from '../utils/enumUtils';

export const useCats = () => {
  const axios = useAxios();
  const [reportedCats, setReportedCats] = useState([]);
  const [ownedCats, setOwnedCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [userAddress, setUserAddress] = useState(null);

  // Use a ref to track if we've already run the initial fetch
  const initialFetchDone = React.useRef(false);

  const fetchUserAddress = async () => {
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
      console.error("Erreur lors de la récupération de l'adresse de l'utilisateur:", error);
    }
  };

  const fetchCats = async () => {
    try {
      // Skip if we've already fetched
      if (initialFetchDone.current && !loading) return;
      
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
      console.error("Error fetching cats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a token
    if (sessionStorage.getItem("token")) {
      fetchCats();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // We're intentionally only running this once on mount
  // and using the ref to prevent multiple fetches

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
      console.error("Erreur lors de la suppression du chat signalé:", error);
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
        furType: updatedData.furType || currentCat.cat.furType,
        gender: updatedData.gender || currentCat.cat.gender,
        chipNumber: updatedData.chipNumber || currentCat.cat.chipNumber,
        dateOfBirth: updatedData.dateOfBirth || currentCat.cat.dateOfBirth,
        comment: updatedData.comment, // Stocker le commentaire dans le chat
        imageUrl: currentCat.cat.imageUrl,
        imageUrls: currentCat.cat.imageUrls
      };

      await axios.put(`/cat/update`, catDTO, { headers });

      // Vérifier si le statut du chat a changé
      const statusHasChanged = updatedData.statusCat && updatedData.statusCat !== currentCat.statusCat;
      
      // Ne mettre à jour le statut et la localisation que si le statut a changé
      if (statusHasChanged) {
        // Formater la date pour Java LocalDateTime
        const formattedDate = formatDateForJava(currentCat.reportDate);

        if (formattedDate === null) {
          throw new Error("Erreur lors du formatage de la date");
        }

        // Utiliser l'adresse de l'utilisateur pour le chat possédé
        // Si l'adresse n'est pas disponible, récupérer l'adresse
        if (!userAddress) {
          await fetchUserAddress();
        }

        // Créer l'objet de localisation basé sur l'adresse de l'utilisateur
        const userLocation = userAddress ? {
          address: userAddress.address,
          city: userAddress.city,
          postalCode: userAddress.postalCode,
          latitude: userAddress.latitude,
          longitude: userAddress.longitude
        } : currentCat.location; // Utiliser la localisation actuelle si l'adresse de l'utilisateur n'est pas disponible

        // Créer un objet CatDTO complet pour mettre à jour le chat
        const catDTO = {
          catId: currentCat.cat.catId,
          name: currentCat.cat.name,
          color: currentCat.cat.color,
          eyeColor: currentCat.cat.eyeColor,
          breed: currentCat.cat.breed,
          furType: currentCat.cat.furType,
          gender: currentCat.cat.gender,
          chipNumber: currentCat.cat.chipNumber,

          dateOfBirth: currentCat.cat.dateOfBirth,
          comment: updatedData.comment, // Mettre à jour le commentaire du chat
          imageUrl: currentCat.cat.imageUrl,
          imageUrls: currentCat.cat.imageUrls
        };
        
        // D'abord mettre à jour le chat pour s'assurer que le commentaire est enregistré
        await axios.put(`/cat/update`, catDTO, { headers });
        
        // Ensuite mettre à jour le statut du chat
        const catStatusDTO = {
          catStatusId: catStatusId,
          statusCat: updatedData.statusCat,
          reportDate: formattedDate, // Utiliser la date formatée
          location: userLocation, // Utiliser la localisation de l'utilisateur
          cat: {
            catId: currentCat.cat.catId
          }
        };

        await axios.put(`/cat/updateStatus`, catStatusDTO, { headers });
      }
      
      // Créer l'objet chat mis à jour
      const updatedCat = {
        catStatusId: catStatusId,
        statusCat: statusHasChanged ? updatedData.statusCat : currentCat.statusCat,
        reportDate: currentCat.reportDate,
        location: currentCat.location, // Conserver la localisation actuelle si le statut n'a pas changé
        cat: {
          ...currentCat.cat,
          name: updatedData.name || currentCat.cat.name,
          color: updatedData.color || currentCat.cat.color,
          eyeColor: updatedData.eyeColor || currentCat.cat.eyeColor,
          breed: updatedData.breed || currentCat.cat.breed,
          furType: updatedData.furType || currentCat.cat.furType,
          gender: updatedData.gender || currentCat.cat.gender,
          chipNumber: updatedData.chipNumber || currentCat.cat.chipNumber,
          dateOfBirth: updatedData.dateOfBirth || currentCat.cat.dateOfBirth,
          comment: updatedData.comment // Stocker le commentaire dans le chat
        }
      };
      
      // Mettre à jour les listes en fonction du nouveau statut
      if (updatedData.statusCat === 'OWN') {
        // Si le nouveau statut est OWN, retirer de reportedCats et ajouter à ownedCats
        setReportedCats(prevCats => prevCats.filter(cat => cat.catStatusId !== catStatusId));
        setOwnedCats(prevCats => [...prevCats, updatedCat]);
      } else {
        // Si le nouveau statut est LOST ou FOUND, mettre à jour dans reportedCats
        setReportedCats(prevCats => {
          const filteredCats = prevCats.filter(cat => cat.catStatusId !== catStatusId);
          return [...filteredCats, updatedCat];
        });
      }
      
      setSuccessMessage('Les informations du chat ont été mises à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000); // Le message disparaît après 3 secondes
      return true;
    } catch (error) {
      console.error("Erreur lors de la modification du chat:", error);
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

      const currentCat = currentCatStatus.cat;

      const catDTO = {
        catId: catId,
        name: updatedData.name || currentCat.name,
        color: convertToEnum(updatedData.color || currentCat.color, ""),
        eyeColor: convertToEnum(updatedData.eyeColor || currentCat.eyeColor, ""),
        breed: convertToEnum(updatedData.breed || currentCat.breed, ""),
        furType: convertToEnum(updatedData.furType || currentCat.furType, ""),
        gender: updatedData.gender || currentCat.gender,
        chipNumber: updatedData.chipNumber || currentCat.chipNumber,

        dateOfBirth: updatedData.dateOfBirth || currentCat.dateOfBirth,
        comment: updatedData.comment || currentCat.comment, // Ajouter le commentaire
        imageUrl: currentCat.imageUrl,
        imageUrls: currentCat.imageUrls
      };

      await axios.put(`/cat/update`, catDTO, { headers });

      // Formater la date pour Java LocalDateTime (même si pas de statut)
      let formattedDate = null;
      if (currentCatStatus.reportDate) {
        formattedDate = formatDateForJava(currentCatStatus.reportDate);
        
        if (formattedDate === null) {
          throw new Error("Erreur lors du formatage de la date");
        }
      }

      // Si le chat a un statut ET que le statut a changé, mettre à jour le statut
      if (currentCatStatus.catStatusId && updatedData.statusCat && updatedData.statusCat !== currentCatStatus.statusCat) {
        const catStatusDTO = {
          catStatusId: currentCatStatus.catStatusId,
          statusCat: updatedData.statusCat,
          comment: updatedData.comment || currentCatStatus.comment,
          reportDate: formattedDate, // Utiliser la date formatée
          cat: {
            catId: catId
          }
        };
        await axios.put(`/cat/updateStatus`, catStatusDTO, { headers });
      }
      
      // Mettre à jour l'état local avec toutes les données mises à jour
      setOwnedCats(prevCats => prevCats.map(catStatus => 
        catStatus.cat.catId === catId 
          ? { 
              ...catStatus,
              statusCat: updatedData.statusCat || catStatus.statusCat,
              reportDate: formattedDate, // Maintenant formattedDate est toujours défini
              cat: { 
                ...catStatus.cat, 
                name: updatedData.name || catStatus.cat.name,
                color: updatedData.color || catStatus.cat.color,
                eyeColor: updatedData.eyeColor || catStatus.cat.eyeColor,
                breed: updatedData.breed || catStatus.cat.breed,
                furType: updatedData.furType || catStatus.cat.furType,
                gender: updatedData.gender || catStatus.cat.gender,
                chipNumber: updatedData.chipNumber || catStatus.cat.chipNumber,
                dateOfBirth: updatedData.dateOfBirth || catStatus.cat.dateOfBirth,
                comment: updatedData.comment || catStatus.cat.comment
              }
            }
          : catStatus
      ));
      
      setSuccessMessage('Les informations du chat ont été mises à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (error) {
      console.error("Erreur lors de la modification du chat:", error);
      return false;
    }
  };

  const handleDeleteOwnedCat = async (catId) => {
    try {
      await axios.delete(`/cat/delete?id=${catId}`);
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

      // Créer l'objet de localisation
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
          imageUrl: currentCatStatus.cat.imageUrl,
          imageUrls: currentCatStatus.cat.imageUrls,

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
      console.error("Erreur lors de la déclaration du chat comme perdu:", error);
      return false;
    }
  };

  async function findPotentialFoundCats(catId) {
    try {
      const response = await axios.get(`/cat/potentialFoundCats/${catId}`);
      return response;
    } catch (error) {
      console.error("Erreur lors de la recherche des correspondances:", error);
      return [];
    }
  }

  async function findPotentialLostCats(catId) {
    try {
      const response = await axios.get(`/cat/potentialLostCats/${catId}`);
      return response;
    } catch (error) {
      console.error("Erreur lors de la recherche des chats trouvés correspondants:", error);
      return [];
    }
  }

  return {
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
    fetchCats
  };
};
