/**
 * Utilitaires pour la gestion des énumérations entre le frontend et le backend
 */

/**
 * Formate une valeur d'énumération en format lisible
 * Exemple: "MAINE_COON" -> "Maine Coon"
 * @param {string} value - Valeur d'énumération à formater
 * @returns {string} - Valeur formatée
 */
export const formatEnumValue = (value) => {
  if (!value) return "";
  
  // Remplacer les underscores par des espaces et mettre en forme (première lettre en majuscule, reste en minuscule)
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Convertit une valeur en format d'énumération (majuscules, sans accents, espaces remplacés par des underscores)
 * Exemple: "Maine Coon" -> "MAINE_COON"
 * @param {string} value - Valeur à convertir
 * @param {string} defaultValue - Valeur par défaut si value est vide
 * @returns {string} - Valeur convertie en format d'énumération
 */
export const convertToEnum = (value, defaultValue = "") => {
  if (!value) return defaultValue;
  
  // Convertir la valeur en format d'énumération (majuscules, sans accents, espaces remplacés par des underscores)
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/\s+/g, "_");
};

/**
 * Formate une date au format attendu par le backend Java (YYYY-MM-DD HH:MM:SS.SSS)
 * @param {string} dateString - Chaîne de date à formater
 * @returns {string|null} - Date formatée ou null en cas d'erreur
 */
export const formatDateForJava = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  try {
    // Créer un objet Date à partir de la chaîne
    const date = new Date(dateString);
    
    // Formater la date exactement comme dans RegisterCat: "YYYY-MM-DD HH:MM:SS.SSS"
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0') + ' ' + 
           String(date.getHours()).padStart(2, '0') + ':' + 
           String(date.getMinutes()).padStart(2, '0') + ':' + 
           String(date.getSeconds()).padStart(2, '0') + '.' +
           String(date.getMilliseconds()).padStart(3, '0');
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return null;
  }
};
