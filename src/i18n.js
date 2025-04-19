import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// Initialise i18n
i18n
  .use(HttpApi) // Permet de charger les traductions depuis /public/locales
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language'
    },

    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // chemin vers tes fichiers publics
    }
  });

export default i18n;
