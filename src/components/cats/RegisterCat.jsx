import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert, Card, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { motion } from "framer-motion";
import { FaPaw, FaMapMarkerAlt } from "react-icons/fa";
import { buttonStyles } from "../../styles/styles";
import catBreeds from "../../CatBreeds";
import { useAuth } from "../../hooks/authProvider";
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import useGeolocation from "../../hooks/useGeolocation";
import MapLocation from "../map/MapLocation";
import { reverseGeocode } from "../../utils/geocodingService";
import { colorOptions, eyeColorOptions, genderOptions, furTypeOptions, statusCatOptions } from "../../utils/enumOptions";
// Utiliser les contextes centralisés au lieu des imports directs
import { useCatSearch } from "../../contexts/CatSearchContext";
import { useAxiosContext } from "../../contexts/AxiosContext";
import { useCatsContext } from "../../contexts/CatsContext";
import ImageUploader from "../common/ImageUploader";
import { useTranslation } from 'react-i18next';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function RegisterCat() {
  // Utiliser les fonctions du contexte
  const { formatValue } = useCatSearch();
  const { post } = useAxiosContext();
  const { fetchCats, userAddress } = useCatsContext();
// Pour la carte et la géolocalisation (LOST/FOUND)
const { getCurrentPosition, isLocating, geoError, setGeoError } = useGeolocation();
  const { t } = useTranslation();
  
  // Fonction pour mettre à jour la localisation à partir des coordonnées
const updateLocationFromCoordinates = async (longitude, latitude) => {
  try {
    const addressInfo = await reverseGeocode(longitude, latitude);
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        longitude,
        latitude,
        address: addressInfo?.address || "",
        city: addressInfo?.city || "",
        postalCode: addressInfo?.postalCode || ""
      }
    }));
  } catch (error) {
    // Optionnel : gestion d'erreur
  }
};

  // Fonction pour gérer la demande de localisation actuelle
  const handleRequestCurrentLocation = () => {
    getCurrentPosition()
      .then(position => {
        updateLocationFromCoordinates(position.longitude, position.latitude);
      })
      .catch(() => {
        // Optionnel : gérer les erreurs ici
      });
  };

  // Format today's date as YYYY-MM-DD HH:MM:SS.SSS for the database
  const now = new Date();
  const formattedDate = now.getFullYear() + '-' + 
                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(now.getDate()).padStart(2, '0') + ' ' + 
                      String(now.getHours()).padStart(2, '0') + ':' + 
                      String(now.getMinutes()).padStart(2, '0') + ':' + 
                      String(now.getSeconds()).padStart(2, '0') + '.' +
                      String(now.getMilliseconds()).padStart(3, '0');
  
  // Format today's date as YYYY-MM-DD for the date input display
  const todayForInput = now.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: t('cat.defaultName', 'Mittens'), // Nom par défaut
    breed: "SIAMESE", // Race par défaut
    color: "BLANC", // Couleur par défaut
    dateOfBirth: "", // Laisser vide
    imageUrl: "", // URL principale de l'image Cloudinary
    imageUrls: [], // Tableau pour stocker plusieurs URLs d'images
    gender: "Femelle", // Genre par défaut
    chipNumber: "123456789", // Numéro de puce par défaut
    furType: "COURTE", // Type de fourrure par défaut
    eyeColor: "BLEU", // Couleur des yeux par défaut
    comment: t('cat.defaultComment', 'Chat très amical et joueur.'), // Commentaire par défaut
    statusCat: "LOST", // Statut par défaut
    reportDate: todayForInput, // Date de signalement par défaut
    location: {
      latitude: "", 
      longitude: "",
      address: "",
      city: "",
      postalCode: ""
    }
  });
  
  // Préremplir la localisation avec userAddress dès que disponible
  useEffect(() => {
    if (userAddress) {
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: userAddress.latitude || "",
          longitude: userAddress.longitude || "",
          address: userAddress.address || "",
          city: userAddress.city || "",
          postalCode: userAddress.postalCode || ""
        }
      }));
    }
  }, [userAddress]);

  // État pour gérer les erreurs de validation
  const [validationErrors, setValidationErrors] = useState({
    dateOfBirth: "",
    reportDate: "",
    dateComparison: "" // Pour les erreurs de comparaison entre dates
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  // Nous gardons isLoggedIn pour les vérifications d'authentification
  // mais nous pouvons supprimer showLoginAlert car il n'est pas utilisé

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Créer une copie des erreurs de validation actuelles
    const newValidationErrors = { ...validationErrors };
    
    // Créer une copie des données du formulaire avec la nouvelle valeur
    const updatedFormData = { ...formData, [name]: value };
    
    // Validation spécifique pour la date de naissance
    if (name === "dateOfBirth") {
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        
        // Réinitialiser les heures, minutes, secondes pour comparer uniquement les dates
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
          newValidationErrors.dateOfBirth = t('cat.errorFutureBirthDate', 'La date de naissance ne peut pas être dans le futur');
        } else {
          newValidationErrors.dateOfBirth = "";
        }
        
        // Vérifier la cohérence avec la date de signalement
        if (updatedFormData.reportDate) {
          const reportDate = new Date(updatedFormData.reportDate);
          if (selectedDate > reportDate) {
            newValidationErrors.dateComparison = t('cat.errorDateComparison', 'La date de signalement ne peut pas être antérieure à la date de naissance');
          } else {
            newValidationErrors.dateComparison = "";
          }
        }
      } else {
        // Si la date de naissance est vide, on supprime l'erreur de comparaison
        newValidationErrors.dateOfBirth = "";
        newValidationErrors.dateComparison = "";
      }
    }
    
    // Validation spécifique pour la date de signalement
    if (name === "reportDate") {
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        
        // Réinitialiser les heures, minutes, secondes pour comparer uniquement les dates
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
          newValidationErrors.reportDate = t('cat.errorFutureReportDate', 'La date de signalement ne peut pas être dans le futur');
        } else {
          newValidationErrors.reportDate = "";
        }
        
        // Vérifier la cohérence avec la date de naissance
        if (updatedFormData.dateOfBirth) {
          const birthDate = new Date(updatedFormData.dateOfBirth);
          if (birthDate > selectedDate) {
            newValidationErrors.dateComparison = t('cat.errorDateComparison', 'La date de signalement ne peut pas être antérieure à la date de naissance');
          } else {
            newValidationErrors.dateComparison = "";
          }
        }
      } else {
        newValidationErrors.reportDate = "";
      }
    }
    
    // Mettre à jour les erreurs de validation
    setValidationErrors(newValidationErrors);
    
    // Mettre à jour les données du formulaire
    setFormData(updatedFormData);
  };
  
  const handleSelectChange = (selectedOption, action) => {
    setFormData({
      ...formData,
      [action.name]: selectedOption ? selectedOption.value : "",
    });
  };
  
  // Gérer l'upload d'image avec Cloudinary
  const handleImageUploaded = (imageData) => {
    // Si imageData est un tableau, c'est un upload multiple
    if (Array.isArray(imageData)) {
      setFormData(prev => ({
        ...prev,
        imageUrl: imageData.length > 0 ? imageData[0] : "", // La première image comme principale
        imageUrls: imageData // Toutes les images dans le tableau
      }));
    } else {
      // Upload d'une seule image
      setFormData(prev => ({
        ...prev,
        imageUrl: imageData,
        imageUrls: imageData ? [imageData] : []
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier s'il y a des erreurs de validation
    if (validationErrors.dateOfBirth || validationErrors.reportDate || validationErrors.dateComparison) {
      return; // Ne pas soumettre le formulaire s'il y a des erreurs
    }
    
    // Vérifier si le nom du chat est vide
    const name = formData.name.trim() === "" ? t('cat.unknown', 'Inconnu') : formData.name;
    // Mettre à jour le nom du chat dans le formulaire
    setFormData({ ...formData, name: name });

    // Créer l'objet de localisation
    const localisation = {
      latitude: formData.location.latitude,
      longitude: formData.location.longitude,
      address: formData.location.address,
      city: formData.location.city,
      postalCode: formData.location.postalCode
    };
    
    const catStatus = {
      cat: {
        name: formData.name,
        breed: formData.breed,
        color: formData.color,
        dateOfBirth: formData.dateOfBirth,
        imageUrl: formData.imageUrl,
        imageUrls: formData.imageUrls, // Ajouter le tableau d'URLs d'images
        gender: formData.gender,
        chipNumber: formData.chipNumber,
        furType: formData.furType,
        eyeColor: formData.eyeColor,
        comment: formData.comment,
      },
      comment: formData.comment,
      statusCat: formData.statusCat,
      reportDate: formattedDate,
      location: localisation // Ajout de la localisation
    };
    
    try {
      // Créer un objet FormData pour envoyer les données au format multipart/form-data
      const formData = new FormData();
      
      // Convertir l'objet catStatus en JSON et l'ajouter comme partie "catData"
      formData.append('catData', new Blob([JSON.stringify(catStatus)], {
        type: 'application/json'
      }));
      
      // Ajouter les images si disponibles
      // Note: Dans cette implémentation, nous n'envoyons pas les fichiers car ils ont déjà été uploadés
      // individuellement par le composant ImageUploader. Le backend utilisera les URLs stockées dans catStatus.
      
      // Envoyer la requête avec le bon Content-Type
      await post("/cat/register", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowSuccessMessage(true);
      // Faire défiler la page vers le haut pour voir le message de succès
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Rafraîchir les données des chats dans le contexte
      try {
        await fetchCats();
      } catch (fetchError) {
        console.warn("Erreur lors de la récupération des chats après enregistrement:", fetchError);
        // Continuer même si la récupération des chats échoue
      }
      
      // Réinitialiser le formulaire quoi qu'il arrive
      setFormData({
        ...formData,
        name: "",
        breed: "",
        color: "",
        dateOfBirth: "",
        imageUrl: "", // Réinitialiser l'URL de l'image
        gender: "",
        chipNumber: "",
        furType: "",
        eyeColor: "",
        comment: "",
        statusCat: "",
        reportDate: todayForInput,
        location: {
          latitude: "",
          longitude: "",
          address: "",
          city: "",
          postalCode: ""
        }
      });

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error) {
      console.error("Error registering cat:", error);
    }
  };

  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-sm">
          <Card.Header style={{ backgroundColor: 'var(--primary-color)' }} className="text-white text-center py-3">
            <FaPaw className="me-2" size={24} />
            <h2 className="mb-0">{t('cat.register', 'Signaler un chat')}</h2>
          </Card.Header>
          <Card.Body className="p-4">
            {showSuccessMessage && (
              <Alert variant="success" className="mb-4" dismissible onClose={() => setShowSuccessMessage(false)}>
                {t('cat.registerSuccess', 'Le chat a été enregistré avec succès !')}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{t('cat.mainInfo', 'Informations principales')}</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.status', 'Statut')}*</Form.Label>
                        <Form.Select
                          name="statusCat"
                          value={formData.statusCat}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{t('cat.selectStatus', '-- Sélectionnez le statut --')}</option>
                          {statusCatOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.name', 'Nom du chat')}</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t('cat.enterName', 'Entrez le nom')}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.breed', 'Race')}</Form.Label>
                        <Select
                          name="breed"
                          value={catBreeds.find((option) => option.value === formData.breed)}
                          onChange={(selectedOption) => handleSelectChange(selectedOption, { name: 'breed' })}
                          options={catBreeds}
                          placeholder={t('cat.selectBreed', 'Sélectionnez la race')}
                          isClearable
                          className="basic-select"
                          classNamePrefix="select"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.gender', 'Genre')}*</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{t('cat.selectGender', '-- Sélectionnez le genre --')}</option>
                          {genderOptions.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Card>
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{t('cat.dates', 'Dates')}</h5>
                    </Card.Header>
                    <Card.Body>
                      {validationErrors.dateComparison && (
                        <Alert variant="danger" className="mb-3">
                          {validationErrors.dateComparison}
                        </Alert>
                      )}
                      <Row>
                        <Col sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('cat.birthDate', 'Date de naissance')}</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              max={todayForInput} // Empêche la sélection de dates futures dans le calendrier
                              isInvalid={!!validationErrors.dateOfBirth}
                            />
                            {validationErrors.dateOfBirth && (
                              <Form.Control.Feedback type="invalid">
                                {validationErrors.dateOfBirth}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('cat.reportDate', 'Date de signalement')}*</Form.Label>
                            <Form.Control
                              type="date"
                              name="reportDate"
                              value={formData.reportDate}
                              onChange={handleChange}
                              max={todayForInput} // Empêche la sélection de dates futures dans le calendrier
                              isInvalid={!!validationErrors.reportDate}
                              required
                            />
                            {validationErrors.reportDate && (
                              <Form.Control.Feedback type="invalid">
                                {validationErrors.reportDate}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{t('cat.characteristics', 'Caractéristiques')}</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.color', 'Couleur')}</Form.Label>
                        <Form.Select
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{t('cat.selectColor', '-- Sélectionnez la couleur --')}</option>
                          {colorOptions.map(option => (
                            <option key={option} value={option}>
                              {formatValue(option)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.eyeColor', 'Couleur des yeux')}</Form.Label>
                        <Form.Select
                          name="eyeColor"
                          value={formData.eyeColor}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{t('cat.selectEyeColor', '-- Sélectionnez la couleur des yeux --')}</option>
                          {eyeColorOptions.map(option => (
                            <option key={option} value={option}>
                              {formatValue(option)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.furType', 'Type de fourrure')}</Form.Label>
                        <Form.Select
                          name="furType"
                          value={formData.furType}
                          onChange={handleChange}
                        >
                          <option value="">{t('cat.selectFurType', '-- Sélectionnez le type de fourrure --')}</option>
                          {furTypeOptions.map(option => (
                            <option key={option} value={option}>
                              {formatValue(option)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('cat.chipNumber', 'Numéro de puce')}</Form.Label>
                        <Form.Control
                          type="text"
                          name="chipNumber"
                          value={formData.chipNumber}
                          onChange={handleChange}
                          placeholder={t('cat.enterChipNumber', 'Entrez le numéro de puce')}
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{t('cat.image', 'Image')}</h5>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted">{t('cat.imageHint', 'Ajoutez une photo du chat pour faciliter son identification.')}</p>
                      <Form.Group className="mb-3">
                        <ImageUploader 
                          onImageUploaded={handleImageUploaded} 
                          multiple={true} 
                          maxImages={5} 
                          onUploadStatusChange={setIsUploading}
                        />
                        {isUploading && (
                          <div className="mt-2 text-info">
                            <small>
                              <i className="fas fa-spinner fa-spin me-1"></i>
                              {t('cat.uploadingImages', 'Images en cours de chargement... Veuillez patienter avant d\'enregistrer.')}
                            </small>
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>{t('cat.description', 'Commentaire')}</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="comment"
                          value={formData.comment}
                          onChange={handleChange}
                          placeholder={t('cat.descriptionPlaceholder', 'Entrez une description du chat (signes distinctifs, comportement, etc.)')}
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Section Localisation dynamique selon le statut */}
              <Card className="mb-4">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  <h5 className="mb-0">{t('cat.location', 'Localisation du chat')}</h5>
                </Card.Header>
                <Card.Body>
                  {formData.statusCat === "OWN" ? (
                    <>
                      <p className="text-muted mb-2">{t('cat.locationUserOnly', 'L\'adresse de votre profil sera utilisée comme localisation du chat.')}</p>
                      <div className="border rounded bg-light p-3">
                        <strong>{t('cat.address', 'Adresse')} :</strong> {formData.location.address || "-"}<br />
                        <strong>{t('cat.city', 'Ville')} :</strong> {formData.location.city || "-"}<br />
                        <strong>{t('cat.postalCode', 'Code postal')} :</strong> {formData.location.postalCode || "-"}<br />
                        <strong>{t('cat.latitude', 'Latitude')} :</strong> {formData.location.latitude || "-"}<br />
                        <strong>{t('cat.longitude', 'Longitude')} :</strong> {formData.location.longitude || "-"}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-muted">{t('cat.locationHint', 'Indiquez l\'endroit où le chat a été vu pour la dernière fois.')}</p>
                      <Row>
                        <Col xs={12}>
                          <MapLocation 
                            location={formData.location}
                            onLocationChange={(longitude, latitude) => updateLocationFromCoordinates(longitude, latitude)}
                            onAddressChange={(addressData) => {
                              setFormData({
                                ...formData,
                                location: {
                                  ...formData.location,
                                  ...addressData
                                }
                              });
                            }}
                            isLocating={isLocating}
                            geoError={geoError}
                            onGeoErrorDismiss={() => setGeoError(null)}
                            onRequestCurrentLocation={handleRequestCurrentLocation}
                            mapHeight="300px"
                            disableMapClick={formData.statusCat === 'OWN'}
                          />
                          <Button variant="outline-secondary" onClick={handleRequestCurrentLocation} className="mt-3">
                            <FaMapMarkerAlt className="me-2" />
                            {t('cat.useCurrentLocation', 'Utiliser ma position actuelle')}
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card.Body>
              </Card>

              <div className="text-center mt-4">
                <p className="text-muted mb-4">* {t('common.required', 'Champs obligatoires')}</p>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="px-5"
                  style={{ ...buttonStyles, minWidth: "200px" }}
                  disabled={isUploading}
                  title={isUploading ? t('cat.waitForImages', 'Veuillez attendre que les images soient chargées') : ""}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {t('cat.loadingImages', 'Chargement des images...')}
                    </>
                  ) : (
                    t('cat.register', 'Signaler un chat')
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
}

export default RegisterCat;