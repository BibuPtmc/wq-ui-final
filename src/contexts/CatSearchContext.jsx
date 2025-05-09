import React, { createContext, useContext, useState, useCallback } from "react";
import { useAxios } from "../hooks/useAxios";
import { formatEnumValue } from "../utils/enumUtils";

// Création du contexte
const CatSearchContext = createContext();

export const CatSearchProvider = ({ children }) => {
  const axios = useAxios();
  const [foundCats, setFoundCats] = useState([]);
  const [lostCats, setLostCats] = useState([]);
  const [filteredFoundCats, setFilteredFoundCats] = useState([]);
  const [filteredLostCats, setFilteredLostCats] = useState([]);
  const [loadingFound, setLoadingFound] = useState(true);
  const [loadingLost, setLoadingLost] = useState(true);
  const [matchCounts, setMatchCounts] = useState({});
  const [loadingMatches, setLoadingMatches] = useState({});

  // État des filtres
  const [filters, setFilters] = useState({
    breed: "",
    color: "",
    eyeColor: "",
    postalCode: "",
    location: {
      latitude: "",
      longitude: "",
      radius: 10, // Rayon par défaut en km
      address: "", // Pour stocker l'adresse complète
    },
  });

  // Fonction pour calculer la distance entre deux points géographiques en km (formule de Haversine)
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }, []);

  // Fonction pour obtenir l'adresse à partir des coordonnées
  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const address = {
          address: [data.address.road, data.address.house_number]
            .filter(Boolean)
            .join(" "),
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "",
          postalCode: data.address.postcode || "",
          latitude,
          longitude,
        };

        return address;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse:", error);
      return null;
    }
  };

  // Fonction pour utiliser la position actuelle
  const useCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "La géolocalisation n'est pas prise en charge par votre navigateur."
          )
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Récupérer l'adresse à partir des coordonnées
          const addressData = await getAddressFromCoordinates(
            latitude,
            longitude
          );

          if (addressData) {
            // Mettre à jour les filtres avec la position actuelle et l'adresse
            setFilters((prev) => ({
              ...prev,
              postalCode: "", // Vider le code postal car on utilise la position actuelle
              location: {
                ...prev.location,
                latitude,
                longitude,
                address: addressData.address,
                city: addressData.city,
                postalCode: addressData.postalCode,
              },
            }));
            resolve(addressData);
          } else {
            // Si on ne peut pas obtenir l'adresse, utiliser juste les coordonnées
            setFilters((prev) => ({
              ...prev,
              postalCode: "", // Vider le code postal car on utilise la position actuelle
              location: {
                ...prev.location,
                latitude,
                longitude,
                address: "Position actuelle",
              },
            }));
            resolve({ latitude, longitude, address: "Position actuelle" });
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          reject(error);
        }
      );
    });
  };

  // Fonction pour gérer les changements de filtres
  const handleFilterChange = (field, value) => {
    if (field === "postalCode") {
      // Si l'utilisateur saisit un code postal, effacer les données de localisation
      setFilters((prev) => ({
        ...prev,
        postalCode: value,
        location: {
          ...prev.location,
          latitude: "",
          longitude: "",
          address: "",
          city: "",
          postalCode: "",
        },
      }));
    } else if (field === "radius") {
      // Mettre à jour le rayon de recherche
      setFilters((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          radius: value,
        },
      }));
    } else {
      // Mettre à jour les autres filtres normalement
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      breed: "",
      color: "",
      eyeColor: "",
      postalCode: "",
      location: {
        latitude: "",
        longitude: "",
        radius: 10,
        address: "",
      },
    });

    // Réinitialiser les chats filtrés
    setFilteredFoundCats(foundCats);
    setFilteredLostCats(lostCats);
  };

  // Effacer la position actuelle
  const clearCurrentLocation = () => {
    setFilters((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: "",
        longitude: "",
        address: "",
        city: "",
        postalCode: "",
      },
    }));
  };

  // Appliquer les filtres aux chats trouvés
  const applyFiltersToFoundCats = useCallback(() => {
    if (!foundCats || foundCats.length === 0) return;

    let filtered = [...foundCats];

    // Filtrer par race
    if (filters.breed) {
      filtered = filtered.filter(
        (catStatus) => catStatus.cat.breed === filters.breed
      );
    }

    // Filtrer par couleur
    if (filters.color) {
      filtered = filtered.filter(
        (catStatus) => catStatus.cat.color === filters.color
      );
    }

    // Filtrer par couleur des yeux
    if (filters.eyeColor) {
      filtered = filtered.filter(
        (catStatus) => catStatus.cat.eyeColor === filters.eyeColor
      );
    }

    // Filtrer par code postal
    if (filters.postalCode) {
      filtered = filtered.filter(
        (catStatus) =>
          catStatus.location &&
          catStatus.location.postalCode &&
          catStatus.location.postalCode.includes(filters.postalCode)
      );
    }

    // Filtrer par localisation et rayon
    if (filters.location.latitude && filters.location.longitude) {
      filtered = filtered.filter((catStatus) => {
        if (
          !catStatus.location ||
          !catStatus.location.latitude ||
          !catStatus.location.longitude
        ) {
          return false;
        }

        const distance = calculateDistance(
          filters.location.latitude,
          filters.location.longitude,
          catStatus.location.latitude,
          catStatus.location.longitude
        );

        return distance <= filters.location.radius;
      });
    }

    setFilteredFoundCats(filtered);
  }, [foundCats, filters, calculateDistance]);

  // Appliquer les filtres aux chats perdus
  const applyFiltersToLostCats = useCallback(() => {
    if (!lostCats || lostCats.length === 0) return;

    let filtered = [...lostCats];

    // Filtrer par race
    if (filters.breed) {
      filtered = filtered.filter(
        (catStatus) => catStatus.cat.breed === filters.breed
      );
    }

    // Filtrer par couleur
    if (filters.color) {
      filtered = filtered.filter(
        (catStatus) => catStatus.cat.color === filters.color
      );
    }

    // Filtrer par couleur des yeux
    if (filters.eyeColor) {
      filtered = filtered.filter(
        (catStatus) => catStatus.cat.eyeColor === filters.eyeColor
      );
    }

    // Filtrer par code postal
    if (filters.postalCode) {
      filtered = filtered.filter(
        (catStatus) =>
          catStatus.location &&
          catStatus.location.postalCode &&
          catStatus.location.postalCode.includes(filters.postalCode)
      );
    }

    // Filtrer par localisation et rayon
    if (filters.location.latitude && filters.location.longitude) {
      filtered = filtered.filter((catStatus) => {
        if (
          !catStatus.location ||
          !catStatus.location.latitude ||
          !catStatus.location.longitude
        ) {
          return false;
        }

        const distance = calculateDistance(
          filters.location.latitude,
          filters.location.longitude,
          catStatus.location.latitude,
          catStatus.location.longitude
        );

        return distance <= filters.location.radius;
      });
    }

    setFilteredLostCats(filtered);
  }, [lostCats, filters, calculateDistance]);

  // Fonction pour récupérer les chats trouvés
  const fetchFoundCats = useCallback(async () => {
    try {
      setLoadingFound(true);
      const response = await axios.get("cat/findFoundCat");
      setFoundCats(response || []);
      setFilteredFoundCats(response || []);
      setLoadingFound(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des chats trouvés:", error);
      setFoundCats([]);
      setFilteredFoundCats([]);
      setLoadingFound(false);
    }
  }, [axios]);

  // Fonction pour récupérer les chats perdus
  const fetchLostCats = useCallback(async () => {
    try {
      setLoadingLost(true);
      const response = await axios.get("cat/findLostCat");
      setLostCats(response || []);
      setFilteredLostCats(response || []);
      setLoadingLost(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des chats perdus:", error);
      setLostCats([]);
      setFilteredLostCats([]);
      setLoadingLost(false);
    }
  }, [axios]);

  // Fonction pour récupérer le nombre de correspondances pour les chats trouvés
  const fetchFoundMatchCounts = useCallback(async () => {
    // Éviter les appels inutiles
    if (foundCats.length === 0) return;

    // Vérifier si on a déjà récupéré les correspondances pour tous les chats
    const allCatsHaveMatchCounts = foundCats.every(
      (catStatus) => typeof matchCounts[catStatus.cat.catId] !== "undefined"
    );

    if (allCatsHaveMatchCounts) return;

    const newMatchCounts = { ...matchCounts };

    // Ne récupérer que les correspondances pour les chats qui n'en ont pas encore
    const catsToFetch = foundCats.filter(
      (catStatus) => typeof matchCounts[catStatus.cat.catId] === "undefined"
    );

    for (const catStatus of catsToFetch) {
      const catId = catStatus.cat.catId;
      setLoadingMatches((prev) => ({ ...prev, [catId]: true }));

      try {
        const response = await axios.get(`/cat/potentialLostCats/${catId}`);
        newMatchCounts[catId] = response ? response.length : 0;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des correspondances pour le chat ${catId}:`,
          error
        );
        newMatchCounts[catId] = 0;
      } finally {
        setLoadingMatches((prev) => ({ ...prev, [catId]: false }));
      }
    }

    setMatchCounts(newMatchCounts);
  }, [foundCats, axios, matchCounts]);

  // Fonction pour récupérer le nombre de correspondances pour les chats perdus
  const fetchLostMatchCounts = useCallback(async () => {
    // Éviter les appels inutiles
    if (lostCats.length === 0) return;

    // Vérifier si on a déjà récupéré les correspondances pour tous les chats
    const allCatsHaveMatchCounts = lostCats.every(
      (catStatus) => typeof matchCounts[catStatus.cat.catId] !== "undefined"
    );

    if (allCatsHaveMatchCounts) return;

    const newMatchCounts = { ...matchCounts };

    // Ne récupérer que les correspondances pour les chats qui n'en ont pas encore
    const catsToFetch = lostCats.filter(
      (catStatus) => typeof matchCounts[catStatus.cat.catId] === "undefined"
    );

    for (const catStatus of catsToFetch) {
      const catId = catStatus.cat.catId;
      setLoadingMatches((prev) => ({ ...prev, [catId]: true }));

      try {
        const response = await axios.get(`/cat/potentialFoundCats/${catId}`);
        newMatchCounts[catId] = response ? response.length : 0;
      } catch (error) {
        console.error(
          `Erreur lors de la récupération des correspondances pour le chat ${catId}:`,
          error
        );
        newMatchCounts[catId] = 0;
      } finally {
        setLoadingMatches((prev) => ({ ...prev, [catId]: false }));
      }
    }

    setMatchCounts(newMatchCounts);
  }, [lostCats, axios, matchCounts]);

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "Inconnu";

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Si le mois de naissance n'est pas encore arrivé cette année ou
    // si c'est le même mois mais que le jour n'est pas encore arrivé
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Format de l'âge
    if (age < 1) {
      // Calculer l'âge en mois
      const ageInMonths =
        today.getMonth() -
        birthDate.getMonth() +
        (today.getFullYear() - birthDate.getFullYear()) * 12;
      return `${ageInMonths} mois`;
    } else {
      return `${age} an${age > 1 ? "s" : ""}`;
    }
  };

  // Fonction pour formater les valeurs d'énumération
  const formatValue = (value) => {
    return formatEnumValue(value);
  };

  // Fonction pour trouver les chats perdus potentiellement correspondants à un chat trouvé
  const findPotentialLostCats = useCallback(
    async (catId) => {
      try {
        const response = await axios.get(`/cat/potentialLostCats/${catId}`);
        return response || [];
      } catch (error) {
        console.error(
          "Erreur lors de la recherche des correspondances:",
          error
        );
        return [];
      }
    },
    [axios]
  );

  // Fonction pour trouver les chats trouvés potentiellement correspondants à un chat perdu
  const findPotentialFoundCats = useCallback(
    async (catId) => {
      try {
        const response = await axios.get(`/cat/potentialFoundCats/${catId}`);
        return response || [];
      } catch (error) {
        console.error(
          "Erreur lors de la recherche des chats trouvés correspondants:",
          error
        );
        return [];
      }
    },
    [axios]
  );

  // Fonction pour rafraîchir toutes les listes
  const refreshCatLists = useCallback(async () => {
    try {
      // Rafraîchir les chats trouvés et perdus
      await fetchFoundCats();
      await fetchLostCats();

      // Rafraîchir les compteurs de correspondances
      await fetchFoundMatchCounts();
      await fetchLostMatchCounts();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des listes:", error);
    }
  }, [
    fetchFoundCats,
    fetchLostCats,
    fetchFoundMatchCounts,
    fetchLostMatchCounts,
  ]);

  return (
    <CatSearchContext.Provider
      value={{
        foundCats,
        lostCats,
        filteredFoundCats,
        filteredLostCats,
        loadingFound,
        loadingLost,
        filters,
        matchCounts,
        loadingMatches,
        fetchFoundCats,
        fetchLostCats,
        handleFilterChange,
        resetFilters,
        useCurrentLocation,
        clearCurrentLocation,
        applyFiltersToFoundCats,
        applyFiltersToLostCats,
        calculateDistance,
        getAddressFromCoordinates,
        fetchFoundMatchCounts,
        fetchLostMatchCounts,
        calculateAge,
        formatValue,
        findPotentialLostCats,
        findPotentialFoundCats,
        refreshCatLists,
      }}
    >
      {children}
    </CatSearchContext.Provider>
  );
};

export const useCatSearch = () => {
  const context = useContext(CatSearchContext);
  if (!context) {
    throw new Error("useCatSearch must be used within a CatSearchProvider");
  }
  return context;
};
