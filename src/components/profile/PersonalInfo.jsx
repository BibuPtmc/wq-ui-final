import React, { useCallback, useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { FaUser, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaPhone } from 'react-icons/fa';
import MapLocation from '../map/MapLocation';
import { reverseGeocode } from '../../utils/geocodingService';
import { useTranslation } from 'react-i18next';
import { formatPhoneNumber, validatePhone } from '../../utils/validationUtils';
import useEnums from '../../hooks/useEnums';

const PersonalInfo = ({ 
  formData, 
  setFormData, 
  handleSubmit, 
  updateSuccess, 
  updateError 
}) => {
  const { t } = useTranslation();
  const [birthDayError, setBirthDayError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { enums, loading: enumsLoading, error: enumsError } = useEnums();


  // Format today's date as YYYY-MM-DD for the date input max attribute
  const today = new Date().toISOString().split('T')[0];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour le numéro de téléphone
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
      const { isValid, errorMessage } = validatePhone(formattedPhone);
      setPhoneError(errorMessage);
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
          {t('personalInfo.success', 'Vos informations ont été mises à jour avec succès !')}
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
              {t('personalInfo.firstName', 'Prénom')}
            </Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t('personalInfo.firstNamePlaceholder', 'Votre prénom')}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaUser className="me-2" />
              {t('personalInfo.lastName', 'Nom')}
            </Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t('personalInfo.lastNamePlaceholder', 'Votre nom')}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label>
          <FaMapMarkerAlt className="me-2" />
          {t('personalInfo.address', 'Adresse')}
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
              {t('personalInfo.gender', 'Genre')}
            </Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={enumsLoading || enumsError}
            >
              <option value="">{t('personalInfo.genderSelect', 'Sélectionnez votre genre')}</option>
              {enums && enums.gender.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            {enumsError && <div className="text-danger">Erreur lors du chargement des genres</div>}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaBirthdayCake className="me-2" />
              {t('personalInfo.birthDay', 'Date de naissance')}
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
              {t('personalInfo.phone', 'Téléphone')}
            </Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder={t('personalInfo.phonePlaceholder', 'Ex: 0493 96 33 75')}
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
          {t('personalInfo.updateButton', 'Mettre à jour mes informations')}
        </Button>
      </div>
    </Form>
  );
};

export default PersonalInfo;
