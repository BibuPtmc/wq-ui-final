import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";

// Création du contexte de langue
const LanguageContext = createContext();

// Hook personnalisé pour utiliser le contexte de langue
export const useLanguage = () => {
  return useContext(LanguageContext);
};

// Fournisseur du contexte de langue
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Langues disponibles dans l'application, mémorisées pour éviter la recréation à chaque rendu
  const languages = useMemo(
    () => [
      { code: "fr", name: "Français", flag: "🇫🇷" },
      { code: "en", name: "English", flag: "🇬🇧" },
      { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    ],
    []
  );

  // Fonction pour changer la langue
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
    setCurrentLanguage(langCode);
  };

  // Initialiser la langue au chargement du composant
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
    } else {
      // Détecter la langue du navigateur
      const browserLanguage = navigator.language.split("-")[0];
      const supportedLanguage = languages.find(
        (lang) => lang.code === browserLanguage
      );

      if (supportedLanguage) {
        i18n.changeLanguage(browserLanguage);
        setCurrentLanguage(browserLanguage);
        localStorage.setItem("language", browserLanguage);
      } else {
        // Langue par défaut si la langue du navigateur n'est pas supportée
        i18n.changeLanguage("fr");
        setCurrentLanguage("fr");
        localStorage.setItem("language", "fr");
      }
    }
  }, [i18n, languages]);

  // Valeur du contexte
  const value = {
    currentLanguage,
    languages,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
