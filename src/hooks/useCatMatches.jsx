import { useState, useCallback } from "react";
import { useAxios } from "./useAxios";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

/**
 * Hook personnalisé pour gérer les correspondances de chats avec mise en cache
 * @param {string} type - Type de chat ('found' ou 'lost')
 * @returns {Object} - Objet contenant les fonctions et états pour gérer les correspondances
 */
export const useCatMatches = (type) => {
  const axios = useAxios();
  const [matchCounts, setMatchCounts] = useState({});
  const [loadingMatches, setLoadingMatches] = useState({});

  /**
   * Récupère les correspondances pour un chat spécifique
   * @param {number} catId - ID du chat
   * @returns {Promise<number>} - Nombre de correspondances
   */
  const fetchMatchesForCat = useCallback(
    async (catId) => {
      const endpoint =
        type === "found"
          ? `/cat/potentialLostCats/${catId}`
          : `/cat/potentialFoundCats/${catId}`;

      try {
        const response = await axios.get(endpoint);
        return response ? response.length : 0;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des correspondances pour le chat ${catId}:`,
          error
        );
        return 0;
      }
    },
    [axios, type]
  );

  /**
   * Récupère les correspondances pour plusieurs chats en parallèle avec mise en cache
   * @param {Array} cats - Liste des chats
   */
  const fetchMatchesForCats = useCallback(
    async (cats) => {
      if (!cats || cats.length === 0) return;

      const newMatchCounts = { ...matchCounts };
      const now = Date.now();
      const catsToFetch = [];

      // Vérifier le cache pour chaque chat
      cats.forEach((catStatus) => {
        const catId = catStatus.cat.catId;
        const cacheKey = `matches_${type}_${catId}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const { count, timestamp } = JSON.parse(cachedData);
          if (now - timestamp < CACHE_DURATION) {
            newMatchCounts[catId] = count;
          } else {
            catsToFetch.push(catStatus);
          }
        } else {
          catsToFetch.push(catStatus);
        }
      });

      if (catsToFetch.length === 0) {
        setMatchCounts(newMatchCounts);
        return;
      }

      // Mettre à jour l'état de chargement
      const newLoadingMatches = { ...loadingMatches };
      catsToFetch.forEach((catStatus) => {
        newLoadingMatches[catStatus.cat.catId] = true;
      });
      setLoadingMatches(newLoadingMatches);

      try {
        // Faire les requêtes en parallèle
        const fetchPromises = catsToFetch.map(async (catStatus) => {
          const catId = catStatus.cat.catId;
          const count = await fetchMatchesForCat(catId);

          // Mettre en cache
          const cacheKey = `matches_${type}_${catId}`;
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              count,
              timestamp: now,
            })
          );

          return { catId, count };
        });

        // Attendre que toutes les requêtes soient terminées
        const results = await Promise.all(fetchPromises);

        // Mettre à jour les compteurs
        results.forEach(({ catId, count }) => {
          newMatchCounts[catId] = count;
        });

        setMatchCounts(newMatchCounts);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des correspondances:",
          error
        );
      } finally {
        // Réinitialiser l'état de chargement
        const finalLoadingMatches = { ...loadingMatches };
        catsToFetch.forEach((catStatus) => {
          finalLoadingMatches[catStatus.cat.catId] = false;
        });
        setLoadingMatches(finalLoadingMatches);
      }
    },
    [fetchMatchesForCat, loadingMatches, matchCounts, type]
  );

  /**
   * Efface le cache pour un chat spécifique
   * @param {number} catId - ID du chat
   */
  const clearCacheForCat = useCallback(
    (catId) => {
      const cacheKey = `matches_${type}_${catId}`;
      localStorage.removeItem(cacheKey);
    },
    [type]
  );

  /**
   * Efface tout le cache
   */
  const clearAllCache = useCallback(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`matches_${type}_`)) {
        localStorage.removeItem(key);
      }
    });
  }, [type]);

  return {
    matchCounts,
    loadingMatches,
    fetchMatchesForCats,
    clearCacheForCat,
    clearAllCache,
  };
};
