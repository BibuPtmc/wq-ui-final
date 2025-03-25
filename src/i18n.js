import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import translationFR from './locales/fr/translation.json';
import translationEN from './locales/en/translation.json';
import translationNL from './locales/nl/translation.json';

// Les ressources de traduction
const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  },
  nl: {
    translation: translationNL
  }
};

i18n
  // Détection automatique de la langue du navigateur
  .use(LanguageDetector)
  // Intégration avec React
  .use(initReactI18next)
  // Initialisation de i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut
    debug: process.env.NODE_ENV === 'development', // Activer le mode debug en développement
    interpolation: {
      escapeValue: false, // Non nécessaire pour React car il échappe par défaut
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Stockage de la langue dans le localStorage
    }
  });

export default i18n;
