import React, { useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCamera, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useAxios } from '../../hooks/useAxios';
import { useTranslation } from 'react-i18next';

/**
 * Component for uploading images to Cloudinary via the backend
 * 
 * @param {function} onImageUploaded - Function called with the URL or URLs of uploaded images
 * @param {string|array} initialImage - Initial image URL or array of URLs (optional)
 * @param {number} maxSize - Maximum file size in MB (default 5MB)
 * @param {array} allowedTypes - Allowed file types (default all images)
 * @param {boolean} multiple - Allow multiple image selection (default false)
 * @param {number} maxImages - Maximum number of images that can be selected (default 5)
 * @returns {JSX.Element} ImageUploader component
 */
const ImageUploader = ({ 
  onImageUploaded, 
  initialImage = null,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  multiple = false,
  maxImages = 5,
  onUploadStatusChange = null // Callback to inform parent about upload status
}) => {
  const { t } = useTranslation();
  const axios = useAxios();
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
   * Checks if the file is valid (type and size)
   * @param {File} file - File to check
   * @returns {Object} { isValid, errorMessage }
   */
  const validateFile = (file) => {
    // Vérifier le type de fichier
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        errorMessage: t('upload.unsupportedFileType', 'Type de fichier non supporté. Formats acceptés: {{formats}}', {
          formats: allowedTypes.map(type => type.split('/')[1]).join(', ')
        })
      };
    }
    
    // Vérifier la taille du fichier
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      return { 
        isValid: false, 
        errorMessage: t('upload.fileTooLarge', 'Fichier trop volumineux ({{size}} Mo). Taille maximale: {{maxSize}} Mo', {
          size: fileSizeInMB.toFixed(2),
          maxSize: maxSize
        })
      };
    }
    
    return { isValid: true };
  };

  const extractPublicIdFromUrl = (url) => {
    // Ex: https://res.cloudinary.com/ton-cloud/image/upload/v123456/whiskerquest/xyz123.jpg
    // public_id = whiskerquest/xyz123
    const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)\./);
    return matches ? matches[1] : null;
  };

  /**
   * Handles file change and upload to Cloudinary
   */
  const handleFileChange = async (e) => {
    // Gérer la sélection multiple ou unique de fichiers
    const selectedFiles = multiple ? Array.from(e.target.files) : [e.target.files[0]];
    if (!selectedFiles.length) return;
    
    // Check if maximum number of images is reached
    if (multiple && (previews.length + selectedFiles.length) > maxImages) {
      setError(t('upload.tooManyImages', 'Vous ne pouvez pas télécharger plus de {{maxImages}} images.', { maxImages }));
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
    // Informer le composant parent que le chargement a commencé
    if (onUploadStatusChange) {
      onUploadStatusChange(true);
    }
    setError(null);
    setUploadProgress(0);
    
    try {
      const newUrls = [...uploadedUrls];
      
      // Upload de chaque fichier sélectionné
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file); // Garder 'file' comme nom de paramètre pour l'upload individuel
        
        const response = await axios.post('/media/upload', formData, {
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
      // Informer le composant parent que le chargement est terminé (avec succès)
      if (onUploadStatusChange) {
        onUploadStatusChange(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Display more details about the error for debugging
      console.log("Error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // More precise error message
      let errorMsg = t('upload.uploadFailed', 'Échec du téléchargement de l\'image. Veuillez réessayer.');
      if (err.response?.data) {
        errorMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setIsUploading(false);
      // Informer le composant parent que le chargement est terminé (avec erreur)
      if (onUploadStatusChange) {
        onUploadStatusChange(false);
      }
    }
  };

  /**
   * Handles image deletion
   * @param {number} index - Index of the image to delete
   */
  const handleRemoveImage = async (index) => {
    const urlToDelete = uploadedUrls[index];
    const publicId = extractPublicIdFromUrl(urlToDelete);
  
    if (publicId) {
      try {
        await axios.delete(`/media/delete?publicId=${publicId}`);
      } catch (err) {
        setError("Erreur lors de la suppression de l'image sur le serveur.");
        return;
      }
    }
  
    // Mise à jour locale (comme avant)
    const newPreviews = [...previews];
    const newUploadedUrls = [...uploadedUrls];
    newPreviews.splice(index, 1);
    newUploadedUrls.splice(index, 1);
    setPreviews(newPreviews);
    setUploadedUrls(newUploadedUrls);
    onImageUploaded(multiple ? newUploadedUrls : newUploadedUrls.length > 0 ? newUploadedUrls[0] : null);
    setError(null);
  };
  
  /**
   * Resets the error
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
                  alt={t('upload.preview', 'Aperçu {{number}}', { number: index + 1 })} 
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
              {t('upload.imageCount', '{{current}} sur {{max}} images', { current: previews.length, max: maxImages })}
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
          <p className="mb-0">{t('upload.clickToAdd', 'Cliquez pour {{action}}', { action: multiple ? t('upload.addPhotos', 'ajouter des photos') : t('upload.addPhoto', 'ajouter une photo') })}</p>
          <small className="text-muted d-block mt-2">
            {t('upload.acceptedFormats', 'Formats acceptés: {{formats}}', { formats: allowedTypes.map(type => type.split('/')[1]).join(', ') })}<br />
            {t('upload.maxSize', 'Taille max: {{size}} Mo', { size: maxSize })} {multiple && t('upload.maxImages', '({{max}} images maximum)', { max: maxImages })}
          </small>
        </div>
      )}
      
      {/* Indicateur de progression */}
      {isUploading && (
        <div className="mt-2">
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" /> 
            <span>{t('upload.uploading', 'Téléchargement en cours... {{progress}}%', { progress: uploadProgress })}</span>
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
