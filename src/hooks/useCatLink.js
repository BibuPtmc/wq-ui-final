import { useState, useCallback, useRef } from 'react';
import { useAxios } from './useAxios';

export const useCatLink = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  // Add debounce mechanism
  const fetchTimeoutRef = useRef(null);

  // Fonction pour créer une demande de liaison entre un chat perdu et un chat trouvé
  const createLinkRequest = useCallback(async (lostCatStatusId, foundCatStatusId, comment) => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
      await axios.post(
        "/cat-link/request", 
        {
          lostCatStatusId,
          foundCatStatusId,
          comment
        },
        { headers }
      );
      
      setSuccessMessage("Demande de liaison envoyée avec succès !");
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Erreur lors de la création de la demande de liaison:", error);
      setError(error.response?.data || "Une erreur est survenue lors de la création de la demande");
      setLoading(false);
      return false;
    }
  }, [axios]);

  // Fonction pour répondre à une demande de liaison
  const respondToLinkRequest = useCallback(async (requestId, status, comment) => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
      await axios.post(
        "/cat-link/respond", 
        {
          requestId,
          status,
          comment
        },
        { headers }
      );
      
      // Mettre à jour la liste des demandes en attente
      setPendingRequests(prev => prev.filter(req => req.requestId !== requestId));
      
      const statusMessage = status === "ACCEPTED" ? "acceptée" : "refusée";
      setSuccessMessage(`Demande de liaison ${statusMessage} avec succès !`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Erreur lors de la réponse à la demande de liaison:", error);
      setError(error.response?.data || "Une erreur est survenue lors de la réponse à la demande");
      setLoading(false);
      return false;
    }
  }, [axios]);

  // Fonction pour récupérer les demandes en attente de réponse avec debounce
  const fetchPendingRequests = useCallback(async () => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set a new timeout to debounce the API call
    fetchTimeoutRef.current = setTimeout(async () => {
      // Only proceed if we're not already loading
      if (!loading) {
        setLoading(true);
        setError(null);
        try {
          const headers = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
          const response = await axios.get("/cat-link/responder/pending", { headers });
          setPendingRequests(response || []);
        } catch (error) {
          console.error("Erreur lors de la récupération des demandes en attente:", error);
          setError(error.response?.data || "Une erreur est survenue lors de la récupération des demandes");
          setPendingRequests([]);
        } finally {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce
  }, [axios, loading]);

  // Fonction pour récupérer les demandes envoyées
  const fetchSentRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
      const response = await axios.get("/cat-link/requester", { headers });
      setSentRequests(response || []);
      setLoading(false);
      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes envoyées:", error);
      setError(error.response?.data || "Une erreur est survenue lors de la récupération des demandes");
      setSentRequests([]);
      setLoading(false);
      return [];
    }
  }, [axios]);

  return {
    loading,
    error,
    successMessage,
    pendingRequests,
    sentRequests,
    createLinkRequest,
    respondToLinkRequest,
    fetchPendingRequests,
    fetchSentRequests
  };
};
