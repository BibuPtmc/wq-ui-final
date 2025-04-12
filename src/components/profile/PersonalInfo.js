import React, { useCallback, useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { FaUser, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaPhone } from 'react-icons/fa';
import MapLocation from '../map/MapLocation';
import { reverseGeocode } from '../../utils/geocodingService';

const PersonalInfo = ({ 
  formData, 
  setFormData, 
  handleSubmit, 
  updateSuccess, 
  updateError 
}) => {
  const [birthDayError, setBirthDayError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  // Format today's date as YYYY-MM-DD for the date input max attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Fonction pour formater le numéro de téléphone pendant la saisie
  const formatPhoneNumber = (phoneNumber) => {
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
  
  // Fonction pour valider le format du numéro de téléphone
  const validatePhone = (phone) => {
    // Accepte les formats: 0123456789, 0493 96 33 75, 01-23-45-67-89, +32123456789, etc.
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,4}$/;
    
    if (!phone) {
      // Le téléphone n'est pas obligatoire
      setPhoneError("");
      return true;
    }
    
    if (!phoneRegex.test(phone)) {
      setPhoneError("Le format du numéro de téléphone n'est pas valide");
      return false;
    }
    
    setPhoneError("");
    return true;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour le numéro de téléphone
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
      validatePhone(formattedPhone);
    } 
    // Validation de la date de naissance
    else if (name === 'birthDay') {
      if (value) {
        const selectedDate = new Date(value);
        const currentDate = new Date();
        
        // Réinitialiser les heures, minutes, secondes pour comparer uniquement les dates
        currentDate.setHours(0, 0, 0, 0);
        
        if (selectedDate > currentDate) {
          setBirthDayError("La date de naissance ne peut pas être dans le futur");
        } else {
          setBirthDayError("");
        }
      } else {
        setBirthDayError("");
      }
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } 
    // Autres champs
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const updateLocationFromCoordinates = useCallback(async (longitude, latitude) => {
    try {
      const addressInfo = await reverseGeocode(longitude, latitude);
      
      setFormData(prev => ({
        ...prev,
        longitude,
        latitude,
        address: addressInfo?.address || prev.address,
        city: addressInfo?.city || prev.city,
        postalCode: addressInfo?.postalCode || prev.postalCode
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse:", error);
    }
  }, [setFormData]);

  const handleLocationChange = (longitude, latitude) => {
    // Appeler la fonction de géocodage inverse pour obtenir l'adresse
    updateLocationFromCoordinates(longitude, latitude);
  };

  const handleAddressChange = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.address || prev.address,
      city: addressData.city || prev.city,
      postalCode: addressData.postalCode || prev.postalCode
    }));
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-4">
      {updateSuccess && (
        <Alert variant="success" className="mb-3">
          Vos informations ont été mises à jour avec succès !
        </Alert>
      )}
      {updateError && (
        <Alert variant="danger" className="mb-3">
          {updateError}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaUser className="me-2" />
              Prénom
            </Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Votre prénom"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaUser className="me-2" />
              Nom
            </Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Votre nom"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label>
          <FaMapMarkerAlt className="me-2" />
          Adresse
        </Form.Label>
        <MapLocation
          location={{
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            latitude: formData.latitude,
            longitude: formData.longitude
          }}
          onLocationChange={handleLocationChange}
          onAddressChange={handleAddressChange}
          mapHeight="300px"
        />
      </Form.Group>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaVenusMars className="me-2" />
              Genre
            </Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Sélectionnez votre genre</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaBirthdayCake className="me-2" />
              Date de naissance
            </Form.Label>
            <Form.Control
              type="date"
              name="birthDay"
              value={formData.birthDay}
              onChange={handleChange}
              max={today}
              isInvalid={!!birthDayError}
            />
            {birthDayError && (
              <Form.Control.Feedback type="invalid">
                {birthDayError}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaPhone className="me-2" />
              Téléphone
            </Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Ex: 0493 96 33 75"
              isInvalid={!!phoneError}
            />
            {phoneError && (
              <Form.Control.Feedback type="invalid">
                {phoneError}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <div className="d-grid gap-2">
        <Button variant="primary" type="submit" className="mt-3">
          Mettre à jour mes informations
        </Button>
      </div>
    </Form>
  );
};

export default PersonalInfo;
