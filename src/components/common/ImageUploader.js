import React, { useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCamera, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useAxiosContext } from '../../contexts/AxiosContext';

/**
 * Composant pour télécharger des images vers Cloudinary via le backend
 * 
 * @param {function} onImageUploaded - Fonction appelée avec l'URL ou les URLs des images téléchargées
 * @param {string|array} initialImage - URL initiale de l'image ou tableau d'URLs (optionnel)
 * @param {number} maxSize - Taille maximale du fichier en Mo (par défaut 5Mo)
 * @param {array} allowedTypes - Types de fichiers autorisés (par défaut toutes les images)
 * @param {boolean} multiple - Permet la sélection multiple d'images (par défaut false)
 * @param {number} maxImages - Nombre maximum d'images pouvant être sélectionnées (par défaut 5)
 * @returns {JSX.Element} Composant ImageUploader
 */
const ImageUploader = ({ 
  onImageUploaded, 
  initialImage = null,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  multiple = false,
  maxImages = 5
}) => {
  const { post } = useAxiosContext();
  // Initialiser previews comme un tableau, même si initialImage est une seule URL
  const [previews, setPreviews] = useState(() => {
    if (!initialImage) return [];
    return Array.isArray(initialImage) ? initialImage : [initialImage];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState(() => {
    if (!initialImage) return [];
    return Array.isArray(initialImage) ? initialImage : [initialImage];
  });

  /**
   * Vérifie si le fichier est valide (type et taille)
   * @param {File} file - Fichier à vérifier
   * @returns {Object} { isValid, errorMessage }
   */
  const validateFile = (file) => {
    // Vérifier le type de fichier
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        errorMessage: `Type de fichier non supporté. Formats acceptés: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`
      };
    }
    
    // Vérifier la taille du fichier
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      return { 
        isValid: false, 
        errorMessage: `Fichier trop volumineux (${fileSizeInMB.toFixed(2)} Mo). Taille maximale: ${maxSize} Mo`
      };
    }
    
    return { isValid: true };
  };

  /**
   * Gère le changement de fichier et l'upload vers Cloudinary
   */
  const handleFileChange = async (e) => {
    // Gérer la sélection multiple ou unique de fichiers
    const selectedFiles = multiple ? Array.from(e.target.files) : [e.target.files[0]];
    if (!selectedFiles.length) return;
    
    // Vérifier si le nombre maximum d'images est atteint
    if (multiple && (previews.length + selectedFiles.length) > maxImages) {
      setError(`Vous ne pouvez pas télécharger plus de ${maxImages} images.`);
      return;
    }
    
    // Valider chaque fichier
    for (const file of selectedFiles) {
      const { isValid, errorMessage } = validateFile(file);
      if (!isValid) {
        setError(errorMessage);
        return;
      }
    }

    // Créer les aperçus locaux
    const newPreviews = [...previews];
    for (const file of selectedFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        // Ajouter le nouvel aperçu sans écraser les existants
        newPreviews.push(reader.result);
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    }

    // Upload vers Cloudinary via notre backend
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const newUrls = [...uploadedUrls];
      
      // Upload de chaque fichier sélectionné
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file); // Garder 'file' comme nom de paramètre pour l'upload individuel
        
        const response = await post('/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            // Calculer et mettre à jour la progression
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        // Ajouter l'URL de l'image téléchargée
        newUrls.push(response);
        console.log(`Upload réussi (${i+1}/${selectedFiles.length}):`, response);
      }
      
      // Mettre à jour les URLs et notifier le parent
      setUploadedUrls(newUrls);
      onImageUploaded(multiple ? newUrls : newUrls[newUrls.length - 1]);
      setIsUploading(false);
    } catch (err) {
      console.error("Erreur d'upload:", err);
      // Afficher plus de détails sur l'erreur pour faciliter le débogage
      console.log("Détails de l'erreur:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Message d'erreur plus précis
      let errorMsg = 'Échec du téléchargement de l\'image. Veuillez réessayer.';
      if (err.response?.data) {
        errorMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setIsUploading(false);
    }
  };

  /**
   * Gère la suppression d'une image
   * @param {number} index - Index de l'image à supprimer
   */
  const handleRemoveImage = (index) => {
    // Créer des copies des tableaux pour ne pas modifier directement l'état
    const newPreviews = [...previews];
    const newUploadedUrls = [...uploadedUrls];
    
    // Supprimer l'image à l'index spécifié
    newPreviews.splice(index, 1);
    newUploadedUrls.splice(index, 1);
    
    // Mettre à jour les états
    setPreviews(newPreviews);
    setUploadedUrls(newUploadedUrls);
    
    // Notifier le parent
    onImageUploaded(multiple ? newUploadedUrls : newUploadedUrls.length > 0 ? newUploadedUrls[0] : null);
    setError(null);
  };
  
  /**
   * Réinitialise l'erreur
   */
  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="image-uploader">
      {/* Affichage des aperçus d'images */}
      {previews.length > 0 ? (
        <div className="mb-3">
          <div className="d-flex flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="position-relative" style={{ width: multiple ? '120px' : '100%' }}>
                <img 
                  src={preview} 
                  alt={`Aperçu ${index + 1}`} 
                  className="img-fluid rounded" 
                  style={{ 
                    height: multiple ? "120px" : "200px", 
                    width: multiple ? "120px" : "100%", 
                    objectFit: "cover" 
                  }}
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="position-absolute top-0 end-0 m-1"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isUploading}
                >
                  <FaTrash size={12} />
                </Button>
              </div>
            ))}
            
            {/* Bouton d'ajout si en mode multiple et que la limite n'est pas atteinte */}
            {multiple && previews.length < maxImages && !isUploading && (
              <label 
                className="d-flex justify-content-center align-items-center rounded border border-dashed"
                style={{ width: '120px', height: '120px', cursor: 'pointer' }}
                htmlFor="file-upload"
              >
                <FaCamera size={24} />
              </label>
            )}
          </div>
          {multiple && (
            <small className="text-muted d-block mt-2">
              {previews.length} sur {maxImages} images
            </small>
          )}
        </div>
      ) : (
        <div 
          className="text-center p-4 bg-light rounded mb-3"
          style={{ cursor: 'pointer' }}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <FaCamera size={24} className="mb-2" />
          <p className="mb-0">Cliquez pour {multiple ? 'ajouter des photos' : 'ajouter une photo'}</p>
          <small className="text-muted d-block mt-2">
            Formats acceptés: {allowedTypes.map(type => type.split('/')[1]).join(', ')}<br />
            Taille max: {maxSize} Mo {multiple && `(${maxImages} images maximum)`}
          </small>
        </div>
      )}
      
      {/* Indicateur de progression */}
      {isUploading && (
        <div className="mt-2">
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" /> 
            <span>Téléchargement en cours... {uploadProgress}%</span>
          </div>
          <div className="progress mt-1" style={{ height: '5px' }}>
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      )}
      
      {/* Affichage des erreurs */}
      {error && (
        <Alert 
          variant="danger" 
          className="mt-2 p-2 small" 
          dismissible 
          onClose={handleDismissError}
        >
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            {error}
          </div>
        </Alert>
      )}
      
      {/* Input file caché */}
      <Form.Control
        id="file-upload"
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
        className="d-none"
        disabled={isUploading || (multiple && previews.length >= maxImages)}
        multiple={multiple}
      />
    </div>
  );
};

export default ImageUploader;
