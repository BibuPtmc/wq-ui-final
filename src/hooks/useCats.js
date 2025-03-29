import React, { useState, useEffect } from 'react';
import { useAxios } from './useAxios';

// Fonction utilitaire pour formater la date au format attendu par le backend Java
const formatDateForJava = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  try {
    // Créer un objet Date à partir de la chaîne
    const date = new Date(dateString);
    
    // Formater la date exactement comme dans RegisterCat: "YYYY-MM-DD HH:MM:SS.SSS"
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0') + ' ' + 
           String(date.getHours()).padStart(2, '0') + ':' + 
           String(date.getMinutes()).padStart(2, '0') + ':' + 
           String(date.getSeconds()).padStart(2, '0') + '.' +
           String(date.getMilliseconds()).padStart(3, '0');
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return null;
  }
};

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
      await axios.delete(`cat/delete?id=${catStatusId}`, { headers });
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

      const catDTO = {
        catId: currentCat.cat.catId,
        name: updatedData.name,
        color: currentCat.cat.color,
        eyeColor: currentCat.cat.eyeColor,
        breed: currentCat.cat.breed,
        furType: currentCat.cat.furType,
        gender: currentCat.cat.gender,
        chipNumber: currentCat.cat.chipNumber,
        type: currentCat.cat.type,
        dateOfBirth: currentCat.cat.dateOfBirth,
        comment: currentCat.cat.comment,
        imageCatData: currentCat.cat.imageCatData
      };

      await axios.put(`cat/update`, catDTO, { headers });

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

      const catStatusDTO = {
        catStatusId: catStatusId,
        statusCat: updatedData.statusCat,
        comment: updatedData.comment,
        reportDate: formattedDate, // Utiliser la date formatée
        location: userLocation, // Utiliser la localisation de l'utilisateur
        cat: {
          catId: currentCat.cat.catId
        }
      };

      await axios.put(`cat/updateStatus`, catStatusDTO, { headers });
      
      // Retirer le chat de la liste des chats signalés
      setReportedCats(prevCats => prevCats.filter(cat => cat.catStatusId !== catStatusId));
      
      // Ajouter le chat à la liste des chats possédés avec les données mises à jour
      const updatedCat = {
        catStatusId: catStatusId,
        statusCat: updatedData.statusCat,
        comment: updatedData.comment,
        reportDate: formattedDate,
        location: userLocation, // Utiliser la localisation de l'utilisateur
        cat: {
          ...currentCat.cat,
          name: updatedData.name || currentCat.cat.name
        }
      };
      
      setOwnedCats(prevCats => [...prevCats, updatedCat]);
      
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

      const currentCat = currentCatStatus.cat;

      const catDTO = {
        catId: catId,
        name: updatedData.name || currentCat.name,
        color: updatedData.color || currentCat.color,
        eyeColor: updatedData.eyeColor || currentCat.eyeColor,
        breed: updatedData.breed || currentCat.breed,
        furType: updatedData.furType || currentCat.furType,
        gender: updatedData.gender || currentCat.gender,
        chipNumber: updatedData.chipNumber || currentCat.chipNumber,
        type: currentCat.type,
        dateOfBirth: updatedData.dateOfBirth || currentCat.dateOfBirth,
        imageCatData: currentCat.imageCatData
      };

      await axios.put(`cat/update`, catDTO, { headers });

      // Formater la date pour Java LocalDateTime (même si pas de statut)
      let formattedDate = null;
      if (currentCatStatus.reportDate) {
        formattedDate = formatDateForJava(currentCatStatus.reportDate);
        
        if (formattedDate === null) {
          throw new Error("Erreur lors du formatage de la date");
        }
      }

      // Si le chat a un statut (perdu/trouvé), mettre à jour également le commentaire
      if (currentCatStatus.catStatusId) {
        const catStatusDTO = {
          catStatusId: currentCatStatus.catStatusId,
          statusCat: updatedData.statusCat || currentCatStatus.statusCat,
          comment: updatedData.comment || currentCatStatus.comment,
          reportDate: formattedDate, // Utiliser la date formatée
          cat: {
            catId: catId
          }
        };
        await axios.put(`cat/updateStatus`, catStatusDTO, { headers });
      }
      
      // Mettre à jour l'état local avec toutes les données mises à jour
      setOwnedCats(prevCats => prevCats.map(catStatus => 
        catStatus.cat.catId === catId 
          ? { 
              ...catStatus,
              statusCat: updatedData.statusCat || catStatus.statusCat,
              comment: updatedData.comment || catStatus.comment,
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
                dateOfBirth: updatedData.dateOfBirth || catStatus.cat.dateOfBirth
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
      await axios.delete(`cat/delete?id=${catId}`);
      setOwnedCats(prevCats => prevCats.filter(cat => cat.cat.catId !== catId));
      setSuccessMessage('Le chat a été supprimé avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000); // Le message disparaît après 3 secondes
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du chat:", error);
      return false;
    }
  };

  async function findPotentialFoundCats(catId) {
    try {
      const response = await axios.get(`cat/potentialFoundCats/${catId}`);
      return response;
    } catch (error) {
      console.error("Erreur lors de la recherche des correspondances:", error);
      return [];
    }
  }

  async function findPotentialLostCats(catId) {
    try {
      const response = await axios.get(`cat/potentialLostCats/${catId}`);
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
    findPotentialFoundCats,
    findPotentialLostCats,
    fetchCats
  };
};
