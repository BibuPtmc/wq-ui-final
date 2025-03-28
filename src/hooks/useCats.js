import React, { useState, useEffect } from 'react';
import { useAxios } from './useAxios';

export const useCats = () => {
  const axios = useAxios();
  const [reportedCats, setReportedCats] = useState([]);
  const [ownedCats, setOwnedCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Use a ref to track if we've already run the initial fetch
  const initialFetchDone = React.useRef(false);

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
    } catch (error) {
      console.error("Error fetching cats:", error);
    } finally {
      initialFetchDone.current = true;
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

      const catStatusDTO = {
        catStatusId: catStatusId,
        statusCat: updatedData.statusCat,
        comment: updatedData.comment,
        cat: {
          catId: currentCat.cat.catId
        }
      };

      await axios.put(`cat/updateStatus`, catStatusDTO, { headers });
      
      setReportedCats(prevCats => prevCats.map(cat => 
        cat.catStatusId === catStatusId 
          ? { 
              ...cat,
              cat: { ...cat.cat, name: updatedData.name },
              statusCat: updatedData.statusCat,
              comment: updatedData.comment
            }
          : cat
      ));
      
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
        furType: currentCat.furType,
        gender: updatedData.gender || currentCat.gender,
        chipNumber: updatedData.chipNumber || currentCat.chipNumber,
        type: currentCat.type,
        dateOfBirth: updatedData.dateOfBirth || currentCat.dateOfBirth,
        imageCatData: currentCat.imageCatData
      };

      await axios.put(`cat/update`, catDTO, { headers });

      // Si le chat a un statut (perdu/trouvé), mettre à jour également le commentaire
      if (currentCatStatus.catStatusId) {
        const catStatusDTO = {
          catStatusId: currentCatStatus.catStatusId,
          statusCat: currentCatStatus.statusCat,
          comment: updatedData.comment || currentCatStatus.comment,
          cat: {
            catId: catId
          }
        };
        await axios.put(`cat/updateStatus`, catStatusDTO, { headers });
      }
      
      // Mettre à jour l'état local
      setOwnedCats(prevCats => prevCats.map(catStatus => 
        catStatus.cat.catId === catId 
          ? { 
              ...catStatus,
              cat: { 
                ...catStatus.cat, 
                name: updatedData.name || catStatus.cat.name,
                color: updatedData.color || catStatus.cat.color,
                eyeColor: updatedData.eyeColor || catStatus.cat.eyeColor,
                breed: updatedData.breed || catStatus.cat.breed,
                gender: updatedData.gender || catStatus.cat.gender,
                chipNumber: updatedData.chipNumber || catStatus.cat.chipNumber,
                dateOfBirth: updatedData.dateOfBirth || catStatus.cat.dateOfBirth
              },
              comment: updatedData.comment || catStatus.comment
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
    handleDeleteReportedCat,
    handleEditReportedCat,
    handleEditOwnedCat,
    handleDeleteOwnedCat,
    findPotentialFoundCats,
    findPotentialLostCats,
    fetchCats
  };
};
