/**
 * Utilitaires de validation pour les formulaires
 */

/**
 * Formate un numéro de téléphone selon le format belge ou international
 * @param {string} phoneNumber - Le numéro de téléphone à formater
 * @returns {string} Le numéro de téléphone formaté
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Supprimer tous les caractères non numériques sauf le + au début
  let cleaned = phoneNumber.replace(/[^\d+]/g, "");
  
  // Si le numéro commence par +, on le conserve
  if (cleaned.startsWith("+")) {
    // Format international: +32 493 96 33 75
    if (cleaned.length > 3) {
      let formatted = "+" + cleaned.substring(1, 3);
      if (cleaned.length > 5) formatted += " " + cleaned.substring(3, 6);
      if (cleaned.length > 7) formatted += " " + cleaned.substring(6, 8);
      if (cleaned.length > 9) formatted += " " + cleaned.substring(8, 10);
      if (cleaned.length > 10) formatted += " " + cleaned.substring(10);
      return formatted;
    }
    return cleaned;
  } else {
    // Format belge: 0493 96 33 75
    if (cleaned.length > 4) cleaned = cleaned.substring(0, 4) + " " + cleaned.substring(4);
    if (cleaned.length > 7) cleaned = cleaned.substring(0, 7) + " " + cleaned.substring(7);
    if (cleaned.length > 10) cleaned = cleaned.substring(0, 10) + " " + cleaned.substring(10);
    return cleaned;
  }
};

/**
 * Valide un numéro de téléphone
 * @param {string} phone - Le numéro de téléphone à valider
 * @returns {Object} Un objet contenant la validité et un message d'erreur éventuel
 */
export const validatePhone = (phone) => {
  // Accepte les formats: 0123456789, 0493 96 33 75, 01-23-45-67-89, +32123456789, etc.
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,4}$/;
  
  if (!phone) {
    return { 
      isValid: true, 
      errorMessage: "" 
    };
  }
  
  if (!phoneRegex.test(phone)) {
    return { 
      isValid: false, 
      errorMessage: "Le format du numéro de téléphone n'est pas valide" 
    };
  }
  
  return { 
    isValid: true, 
    errorMessage: "" 
  };
}; 