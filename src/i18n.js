import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';
import translationNL from './locales/nl/translation.json';

// Les ressources de traduction
const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  },
  nl: {
    translation: translationNL
  }
};

i18n
  // Détecte la langue du navigateur
  .use(LanguageDetector)
  // Passe l'instance i18n à react-i18next
  .use(initReactI18next)
  // Initialise i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut si la langue détectée n'est pas disponible
    debug: process.env.NODE_ENV === 'development', // Active le mode debug en développement

    interpolation: {
      escapeValue: false, // Pas besoin d'échapper les valeurs car React le fait déjà
    },

    // Options de détection de langue
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language', // Clé utilisée dans localStorage
      caches: ['localStorage'],
    }
  });

export default i18n;
