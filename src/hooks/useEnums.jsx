import { useEffect, useState, useCallback } from "react";
import { useAxios } from "./useAxios";

export const useEnums = () => {
  const axios = useAxios();

  const [enums, setEnums] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction utilitaire centralisée avec useCallback
  const getEnumLabel = useCallback((enumArray, value) => {
    if (!enumArray || !value) return value;
    const found = enumArray.find((option) => option.value === value);
    return found ? found.label : value;
  }, []);

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        setLoading(true);
        const data = await axios.get("enums/all");
        setEnums(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des énumérations");
        setEnums(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEnums();
  }, [axios]);

  return {
    enums,
    loading,
    error,
    getEnumLabel,
  };
};
