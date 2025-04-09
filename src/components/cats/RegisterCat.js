import React, { useState, useEffect,useCallback  } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert, Card, Row, Col } from "react-bootstrap";
import { useAxios } from "../../hooks/useAxios";
import Select from "react-select";
import { motion } from "framer-motion";
import { FaPaw, FaCamera, FaMapMarkerAlt  } from "react-icons/fa";
import { buttonStyles } from "../../styles/styles";
import catBreeds from "../../CatBreeds";
import { useAuth } from "../../hooks/authProvider";
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import useGeolocation from "../../hooks/useGeolocation";
import MapLocation from "../map/MapLocation";
import { reverseGeocode } from "../../utils/geocodingService";
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function RegisterCat() {
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
    name: "Mittens", // Nom par défaut
    breed: "SIAMESE", // Race par défaut
    color: "BLANC", // Couleur par défaut
    dateOfBirth: "", // Laisser vide
    photo: "",
    gender: "Femelle", // Genre par défaut
    chipNumber: "123456789", // Numéro de puce par défaut
    furType: "Courte", // Type de fourrure par défaut
    eyeColor: "BLEU", // Couleur des yeux par défaut
    comment: "Chat très amical et joueur.", // Commentaire par défaut
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
  
  // État pour gérer les erreurs de validation
  const [validationErrors, setValidationErrors] = useState({
    dateOfBirth: "",
    reportDate: "",
    dateComparison: "" // Pour les erreurs de comparaison entre dates
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [preview, setPreview] = useState(null);
  const [mapError, setMapError] = useState(null);


  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const axios = useAxios();
  const [showLoginAlert, setShowLoginAlert] = useState(!isLoggedIn);

  // Utiliser le hook de géolocalisation
  const { getCurrentPosition, isLocating, geoError, setGeoError } = useGeolocation();

  const updateLocationFromCoordinates = useCallback(async (longitude, latitude) => {
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
      console.error("Erreur lors de la récupération de l'adresse:", error);
      setMapError("Erreur lors de la récupération de l'adresse");
    }
  }, [setFormData, setMapError]);

  // Initialisation avec la position actuelle
  useEffect(() => {
    if (isLoggedIn) {
      getCurrentPosition()
        .then(position => {
          updateLocationFromCoordinates(position.longitude, position.latitude);
        })
        .catch(error => {
          console.log("Utilisation de la position par défaut:", error.message);
        });
    }
  }, [isLoggedIn, getCurrentPosition, updateLocationFromCoordinates]);

  // Gérer la demande de localisation actuelle par l'utilisateur
  const handleRequestCurrentLocation = () => {
    getCurrentPosition()
      .then(position => {
        updateLocationFromCoordinates(position.longitude, position.latitude);
      });
  };

  // Si l'utilisateur n'est pas connecté, afficher une alerte
  if (!isLoggedIn) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h2 className="mb-4">Connexion requise</h2>
            <p className="text-muted mb-4">
              Vous devez être connecté pour signaler un chat perdu ou trouvé.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button 
                variant="primary" 
                onClick={() => navigate("/login")}
                className="px-4"
              >
                Se connecter
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate("/register")}
                className="px-4"
              >
                S'inscrire
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

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
          newValidationErrors.dateOfBirth = "La date de naissance ne peut pas être dans le futur";
        } else {
          newValidationErrors.dateOfBirth = "";
        }
        
        // Vérifier la cohérence avec la date de signalement
        if (updatedFormData.reportDate) {
          const reportDate = new Date(updatedFormData.reportDate);
          if (selectedDate > reportDate) {
            newValidationErrors.dateComparison = "La date de naissance ne peut pas être postérieure à la date de signalement";
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
          newValidationErrors.reportDate = "La date de signalement ne peut pas être dans le futur";
        } else {
          newValidationErrors.reportDate = "";
        }
        
        // Vérifier la cohérence avec la date de naissance
        if (updatedFormData.dateOfBirth) {
          const birthDate = new Date(updatedFormData.dateOfBirth);
          if (birthDate > selectedDate) {
            newValidationErrors.dateComparison = "La date de signalement ne peut pas être antérieure à la date de naissance";
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
  
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [name]: value
      }
    });
  };

  const handleSelectChange = (selectedOption, action) => {
    setFormData({
      ...formData,
      [action.name]: selectedOption ? selectedOption.value : "",
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        // Get base64 string without the data:image/xxx;base64, prefix
        const base64String = reader.result.split(',')[1];
        setFormData({
          ...formData,
          type: file.type,
          photo: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier s'il y a des erreurs de validation
    if (validationErrors.dateOfBirth || validationErrors.reportDate || validationErrors.dateComparison) {
      return; // Ne pas soumettre le formulaire s'il y a des erreurs
    }
    
    // Vérifier si le nom du chat est vide
    const name = formData.name.trim() === "" ? "Inconnu" : formData.name;
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
        imageCatData: formData.photo,
        type: formData.type,
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
      const response = await axios.post("/cat/register", catStatus);
      console.log(response);
      setShowSuccessMessage(true);
      // Faire défiler la page vers le haut pour voir le message de succès
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setFormData({
        ...formData,
        name: "",
        breed: "",
        color: "",
        dateOfBirth: "",
        photo: "",
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

      setPreview(null);

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
            <h2 className="mb-0">Signaler un chat</h2>
          </Card.Header>
          <Card.Body className="p-4">
            {showSuccessMessage && (
              <Alert variant="success" className="mb-4" dismissible onClose={() => setShowSuccessMessage(false)}>
                Le chat a été enregistré avec succès !
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Informations principales</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Statut*</Form.Label>
                        <Form.Select
                          name="statusCat"
                          value={formData.statusCat}
                          onChange={handleChange}
                          required
                        >
                          <option value="">-- Sélectionnez le statut --</option>
                          <option value="OWN">Propriétaire</option>
                          <option value="FOUND">Trouvé</option>
                          <option value="LOST">Perdu</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Nom du chat</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Entrez le nom"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Race</Form.Label>
                        <Select
                          name="breed"
                          value={catBreeds.find((option) => option.value === formData.breed)}
                          onChange={handleSelectChange}
                          options={catBreeds}
                          placeholder="Sélectionnez la race"
                          isClearable
                          className="basic-select"
                          classNamePrefix="select"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Genre*</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">-- Sélectionnez le genre --</option>
                          <option value="Mâle">Mâle</option>
                          <option value="Femelle">Femelle</option>
                          <option value="Inconnu">Inconnu</option>
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Card>
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Dates</h5>
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
                            <Form.Label>Date de naissance</Form.Label>
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
                            <Form.Label>Date de signalement*</Form.Label>
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
                      <h5 className="mb-0">Caractéristiques physiques</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Couleur*</Form.Label>
                        <Form.Select
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          required
                        >
                          <option value="">-- Sélectionnez la couleur --</option>
                          <option value="NOIR">Noir</option>
                          <option value="BLANC">Blanc</option>
                          <option value="GRIS">Gris</option>
                          <option value="ROUX">Roux</option>
                          <option value="MIXTE">Mixte</option>
                          <option value="AUTRE">Autre</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Type de fourrure</Form.Label>
                        <Form.Select
                          name="furType"
                          value={formData.furType}
                          onChange={handleChange}
                        >
                          <option value="">-- Sélectionnez le type de fourrure --</option>
                          <option value="Courte">Courte</option>
                          <option value="Moyenne">Moyenne</option>
                          <option value="Longue">Longue</option>
                          <option value="Sans poils">Sans poils</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Couleur des yeux*</Form.Label>
                        <Form.Select
                          name="eyeColor"
                          value={formData.eyeColor}
                          onChange={handleChange}
                          required
                        >
                          <option value="">-- Sélectionnez la couleur des yeux --</option>
                          <option value="BLEU">Bleu</option>
                          <option value="VERT">Vert</option>
                          <option value="JAUNE">Jaune</option>
                          <option value="MARRON">Marron</option>
                          <option value="NOISETTE">Noisette</option>
                          <option value="AUTRE">Autre</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Numéro de puce</Form.Label>
                        <Form.Control
                          type="text"
                          name="chipNumber"
                          value={formData.chipNumber}
                          onChange={handleChange}
                          placeholder="Entrez le numéro de puce"
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Photo et commentaires</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Photo du chat</Form.Label>
                        <div className="position-relative">
                          {preview ? (
                            <div className="mb-3">
                              <img
                                src={preview}
                                alt="Aperçu"
                                className="img-fluid rounded"
                                style={{ maxHeight: "200px", objectFit: "cover" }}
                              />
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-2"
                                onClick={() => {
                                  setPreview(null);
                                  setFormData({ ...formData, photo: "" });
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center p-4 bg-light rounded mb-3">
                              <FaCamera size={24} className="mb-2" />
                              <p className="mb-0">Cliquez pour ajouter une photo</p>
                            </div>
                          )}
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className={preview ? "d-none" : ""}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Commentaire</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="comment"
                          value={formData.comment}
                          onChange={handleChange}
                          placeholder="Ajoutez des informations supplémentaires..."
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Section Localisation avec Mapbox */}
              <Card className="mb-4">
                <Card.Header className="bg-light d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2" />
                  <h5 className="mb-0">Localisation du chat</h5>
                </Card.Header>
                <Card.Body>
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
                      />
                      </Col>
                  </Row>
                </Card.Body>
              </Card>

              <div className="text-center mt-4">
                <p className="text-muted mb-4">* Champs obligatoires</p>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="px-5"
                  style={{ ...buttonStyles, minWidth: "200px" }}
                >
                  Enregistrer le chat
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
