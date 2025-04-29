import { useEffect, useState } from 'react';

export default function useEnums() {
  const [enums, setEnums] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction utilitaire centralisée
  const getEnumLabel = (enumArray, value) => {
    if (!enumArray || !value) return value;
    const found = enumArray.find(option => option.value === value);
    return found ? found.label : value;
  };

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8080/api/enums/all')
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des énumérations');
        return res.json();
      })
      .then(data => {
        setEnums(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { enums, loading, error, getEnumLabel };
}