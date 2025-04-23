/**
 * Options centralisées pour les sélecteurs de l'application
 * Ces constantes sont utilisées dans les composants pour les menus déroulants
 */

// Options pour les races de chats
export const breedOptions = [
  'SIAMESE', 'PERSIAN', 'MAINE_COON', 'BENGAL', 'RAGDOLL', 
  'SPHYNX', 'BRITISH_SHORTHAIR', 'ABYSSINIAN', 'BIRMAN', 
  'SCOTTISH_FOLD', 'RUSSIAN_BLUE', 'AMERICAN_SHORTHAIR',
  'NORWEGIAN_FOREST_CAT', 'EXOTIC_SHORTHAIR', 'EUROPEAN_SHORTHAIR', 'OTHER'
];

// Options pour les couleurs de chats
export const colorOptions = [
  'NOIR', 'BLANC', 'GRIS', 'ROUX', 'MIXTE', 'AUTRE'
];

// Options pour les couleurs d'yeux
export const eyeColorOptions = [
  'BLEU', 'VERT', 'JAUNE', 'MARRON', 'NOISETTE', 'GRIS', 'ORANGE', 'AUTRE'
];

// Options pour les genres
export const genderOptions = ['Mâle', 'Femelle', 'Inconnu'];

// Options pour les types de fourrure
export const furTypeOptions = ['COURTE', 'MOYENNE', 'LONGUE', 'SANS_POILS'];

// Options pour les statuts de chat
export const statusCatOptions = [
  { value: 'OWN', label: 'Propriétaire' },
  { value: 'FOUND', label: 'Trouvé' },
  { value: 'LOST', label: 'Perdu' }
];

// Fonction pour obtenir le label d'un statut à partir de sa valeur
export const getStatusLabel = (statusValue) => {
  const status = statusCatOptions.find(option => option.value === statusValue);
  return status ? status.label : statusValue;
};
