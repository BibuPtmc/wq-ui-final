/**
 * Utilitaires pour la gestion des erreurs API
 */

/**
 * Affiche une notification d'erreur API standardisée
 * @param {function} showNotification - Fonction de notification du contexte
 * @param {string} contextMsg - Message d'intention (ex: "lors de la modification du chat")
 * @param {object} error - Objet erreur capturé
 */
export const notifyApiError = (showNotification, contextMsg, error) => {
  showNotification(
    `Erreur ${contextMsg} : ` +
    (error?.response?.data?.message || error?.message || "Erreur inconnue"),
    "error"
  );
};

/**
 * Gère les erreurs API courantes et retourne un message d'erreur approprié
 * @param {object} error - L'erreur capturée
 * @param {object} errorMessages - Objet contenant les messages d'erreur personnalisés
 * @returns {string} Message d'erreur formaté
 */
export const handleApiError = (error, errorMessages = {}) => {
  const defaultMessages = {
    "Email already exists": "Cette adresse email est déjà utilisée",
    "Username already exists": "Ce nom d'utilisateur est déjà utilisé",
    "Phone number already exists": "Ce numéro de téléphone est déjà utilisé",
    "Invalid credentials": "Identifiants invalides",
    "User not found": "Utilisateur non trouvé",
    "Unauthorized": "Vous n'êtes pas autorisé à effectuer cette action",
    "Forbidden": "Accès refusé",
    "Not Found": "Ressource non trouvée",
    "Server Error": "Erreur serveur, veuillez réessayer plus tard"
  };

  // Fusionner les messages par défaut avec les messages personnalisés
  const messages = { ...defaultMessages, ...errorMessages };

  // Récupérer le message d'erreur de l'API
  const apiMessage = error?.response?.data?.message;

  // Si le message existe dans notre mapping, l'utiliser
  if (apiMessage && messages[apiMessage]) {
    return messages[apiMessage];
  }

  // Sinon, retourner un message générique
  return apiMessage || "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.";
};

/**
 * Vérifie si l'erreur est une erreur d'authentification (401 ou 403)
 * @param {object} error - L'erreur à vérifier
 * @returns {boolean} True si c'est une erreur d'authentification
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

/**
 * Vérifie si l'erreur est une erreur de validation
 * @param {object} error - L'erreur à vérifier
 * @returns {boolean} True si c'est une erreur de validation
 */
export const isValidationError = (error) => {
  return error?.response?.status === 400;
};

/**
 * Vérifie si l'erreur est une erreur serveur
 * @param {object} error - L'erreur à vérifier
 * @returns {boolean} True si c'est une erreur serveur
 */
export const isServerError = (error) => {
  return error?.response?.status >= 500;
}; 