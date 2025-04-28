import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Card, Badge, Alert, Button, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPaw, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import MapLocation from '../map/MapLocation';
import useGeolocation from "../../hooks/useGeolocation";
import { reverseGeocode } from "../../utils/geocodingService.jsx";
// Utiliser les contextes centralisés
import { useCatSearch } from "../../contexts/CatSearchContext";
import { useCatsContext } from "../../contexts/CatsContext";
import ImageUploader from "../common/ImageUploader";
import { breedOptions, colorOptions, eyeColorOptions, genderOptions, furTypeOptions } from "../../utils/enumOptions";
import { convertToEnum } from "../../utils/enumUtils";

const OwnedCats = ({ ownedCats, onShowCatDetails, onDeleteCat, onEditCat, onReportAsLost, successMessage }) => {
  const { t } = useTranslation();
  // Utiliser les fonctions du contexte
  const { formatValue, calculateAge } = useCatSearch();
  const { fetchCats } = useCatsContext();
  const [isImageUploading, setIsImageUploading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const { getCurrentPosition, isLocating, geoError, setGeoError } = useGeolocation();
  const [editForm, setEditForm] = useState({
    name: '',
    breed: '',
    color: '',
    eyeColor: '',
    gender: '',
    dateOfBirth: '',
    chipNumber: '',
    furType: '',
    comment: '',
    images: [] // Toujours initialisé à []
  });
  const [lostForm, setLostForm] = useState({
    comment: '',
    location: {
      latitude: null,
      longitude: null,
      address: '',
      city: '',
      postalCode: ''
    }
  });

  // Options pour les sélecteurs basées sur RegisterCat.js
  // Options et fonctions de formatage importées depuis les utilitaires centralisés

  const handleEdit = (catStatus) => {
    setSelectedCat(catStatus);
    // Formatage de la date pour l'input date
    let formattedDate = '';
    if (catStatus.cat.dateOfBirth) {
      const date = new Date(catStatus.cat.dateOfBirth);
      formattedDate = date.toISOString().split('T')[0];
    }
    // Toujours garantir images: []
    const images = catStatus.cat.imageUrls || [];
    const newFormData = {
      name: catStatus.cat.name || '',
      breed: convertToEnum(catStatus.cat.breed, 'UNKNOWN'),
      color: convertToEnum(catStatus.cat.color, 'AUTRE'),
      eyeColor: convertToEnum(catStatus.cat.eyeColor, 'AUTRE'),
      gender: catStatus.cat.gender || 'Inconnu',
      dateOfBirth: formattedDate,
      chipNumber: catStatus.cat.chipNumber || '',
      furType: convertToEnum(catStatus.cat.furType, 'COURTE'),
      comment: catStatus.cat.comment || '',
      images: Array.isArray(images) ? images : []
    };
    setEditForm(newFormData);
    setShowModal(true);
  };

  // Effet pour surveiller les changements de selectedCat et mettre à jour le formulaire
  useEffect(() => {
    if (selectedCat && selectedCat.cat) {
      // Formatage de la date pour l'input date
      let formattedDate = '';
      if (selectedCat.cat.dateOfBirth) {
        const date = new Date(selectedCat.cat.dateOfBirth);
        formattedDate = date.toISOString().split('T')[0];
      }
      // Toujours garantir images: []
      const images = selectedCat.cat.imageUrls || [];
      const newFormData = {
        name: selectedCat.cat.name || '',
        breed: selectedCat.cat.breed || 'UNKNOWN',
        color: selectedCat.cat.color || 'AUTRE',
        eyeColor: selectedCat.cat.eyeColor || 'AUTRE',
        gender: selectedCat.cat.gender || 'Inconnu',
        dateOfBirth: formattedDate,
        chipNumber: selectedCat.cat.chipNumber || '',
        furType: selectedCat.cat.furType || 'Courte',
        comment: selectedCat.cat.comment || '',
        images: Array.isArray(images) ? images : []
      };
      setEditForm(newFormData);
    }
  }, [selectedCat]);

  // Réinitialiser le formulaire lorsqu'un nouveau chat est sélectionné
  useEffect(() => {
    if (selectedCat) {
      // Pour le modal d'édition
      setEditForm(prev => ({
        name: selectedCat.cat.name || '',
        breed: selectedCat.cat.breed || '',
        color: selectedCat.cat.color || '',
        eyeColor: selectedCat.cat.eyeColor || '',
        gender: selectedCat.cat.gender || '',
        dateOfBirth: selectedCat.cat.dateOfBirth ? selectedCat.cat.dateOfBirth.substring(0, 10) : '',
        chipNumber: selectedCat.cat.chipNumber || '',
        furType: selectedCat.cat.furType || '',
        comment: selectedCat.cat.comment || '',
        images: selectedCat.cat.imageUrls || []
      }));

      // Pour le modal de signalement de perte
      if (showLostModal) {
        // Initialiser avec l'adresse de l'utilisateur si disponible
        setLostForm({
          comment: '',
          location: {
            latitude: selectedCat.location?.latitude || null,
            longitude: selectedCat.location?.longitude || null,
            address: selectedCat.location?.address || '',
            city: selectedCat.location?.city || '',
            postalCode: selectedCat.location?.postalCode || ''
          }
        });
      }
    }
  }, [selectedCat, showLostModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("editForm", editForm);
    console.log("selectedCat", selectedCat);
    // Nettoyage du payload : on retire 'images' avant l'envoi
    const { images, ...rest } = editForm;
    const payload = {
      ...rest,
      imageUrls: images,
      imageUrl: images.length > 0 ? images[0] : null
    };
    console.log("payload", payload);
    const success = await onEditCat(selectedCat.cat.catId, payload);
    console.log("edit success", success);
    setShowModal(false);
    if (success) {
      // Rafraîchir les données après l'édition
      await fetchCats();
      console.log("Cats fetched");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Log supprimé pour améliorer les performances
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour mettre à jour la localisation à partir des coordonnées
  const updateLocationFromCoordinates = useCallback(async (longitude, latitude) => {
    try {
      // Utiliser l'import ES6 déjà disponible
      const addressInfo = await reverseGeocode(longitude, latitude);
      
      setLostForm(prev => ({
        ...prev,
        location: {
          latitude: latitude,
          longitude: longitude,
          address: addressInfo?.address || '',
          city: addressInfo?.city || '',
          postalCode: addressInfo?.postalCode || ''
        }
      }));
    } catch (error) {
      console.error("Erreur lors de la géolocalisation inverse:", error);
    }
  }, []);

  // Fonction pour demander la position actuelle
  const handleRequestCurrentLocation = useCallback(async () => {
    setGeoError(null);
    try {
      const position = await getCurrentPosition();
      if (position && position.longitude && position.latitude) {
        await updateLocationFromCoordinates(position.longitude, position.latitude);
      }
    } catch (error) {
      setGeoError(error.message);
    }
  }, [getCurrentPosition, updateLocationFromCoordinates, setGeoError]);

  if (ownedCats.length === 0) {
    return (
      <Alert variant="info">Vous n'avez pas encore de chats.</Alert>
    );
  }

  return (
    <>
      <Card.Title className="mb-4">
        <FaPaw className="me-2" />
        {t('ownedCats.title', 'Mes chats')}
      </Card.Title>
      
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {t('ownedCats.success', successMessage)}
        </Alert>
      )}

      <div className="text-center mb-4">
        <Badge bg="primary" className="px-3 py-2">
          {t('ownedCats.count', {count: ownedCats.length, defaultValue: '{{count}} chats'})}
        </Badge>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {ownedCats.map((catStatus) => {
          const cat = catStatus.cat;
          return (
            <Col key={cat.catId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="cat-card shadow-sm h-100">
                  <Card.Img
                    variant="top"
                    src={
                      (cat.imageUrls && Array.isArray(cat.imageUrls) && cat.imageUrls.length > 0)
                        ? cat.imageUrls[0]
                        : "/noImageCat.png"
                    }
                    alt={cat.name}
                    onError={(e) => {
                      e.target.src = "/noImageCat.png";
                      e.target.onerror = null;
                    }}
                    style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
                    onClick={() => onShowCatDetails(catStatus)}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">{cat.name || t('ownedCats.noName', 'Chat sans nom')}</Card.Title>
                      <Badge
                        bg={cat.gender === "Mâle" ? "primary" : "danger"}
                        className="ms-2"
                      >
                        {cat.gender || t('ownedCats.unknownGender', 'Inconnu')}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      {t('ownedCats.breed', 'Race')}: {formatValue(cat.breed) || t('ownedCats.unknownBreed', 'Inconnue')}
                      {cat.dateOfBirth && (
                        <span className="ms-2">
                          {t('ownedCats.age', 'Âge')}: {calculateAge(cat.dateOfBirth)}
                        </span>
                      )}
                    </Card.Text>
                    <div className="d-flex gap-2 mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => onShowCatDetails(catStatus)}
                      >
                        {t('ownedCats.details', 'Voir les détails')}
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleEdit(catStatus)}
                        title={t('ownedCats.edit', 'Modifier')}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCat(cat.catId);
                        }}
                        title={t('ownedCats.delete', 'Supprimer')}
                      >
                        <FaTrash />
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLostModal(true);
                          setSelectedCat(catStatus);
                        }}
                        title={t('ownedCats.reportLost', 'Signaler perdu')}
                      >
                        <FaSearch />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      {/* Modal d'édition */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        onShow={() => {}}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('ownedCats.editTitle', 'Modifier les informations du chat')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('ownedCats.name', 'Nom du chat')}</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleChange}
                placeholder={t('ownedCats.namePlaceholder', 'Nom du chat')}
              />
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('ownedCats.breed', 'Race')}</Form.Label>
                  <Form.Select
                    name="breed"
                    value={editForm.breed}
                    onChange={handleChange}
                  >
                    <option value="">{t('ownedCats.selectBreed', 'Sélectionner une race')}</option>
                    {breedOptions.map(option => (
                      <option key={option} value={option}>
                        {formatValue(option)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('ownedCats.gender', 'Genre')}</Form.Label>
                  <Form.Select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleChange}
                  >
                    <option value="">{t('ownedCats.selectGender', 'Sélectionner un genre')}</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('ownedCats.color', 'Couleur')}</Form.Label>
                  <Form.Select
                    name="color"
                    value={editForm.color}
                    onChange={handleChange}
                  >
                    <option value="">{t('ownedCats.selectColor', 'Sélectionner une couleur')}</option>
                    {colorOptions.map(option => (
                      <option key={option} value={option}>
                        {option === 'AUTRE' ? t('ownedCats.otherColor', 'Autre') : formatValue(option)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('ownedCats.eyeColor', 'Couleur des yeux')}</Form.Label>
                  <Form.Select
                    name="eyeColor"
                    value={editForm.eyeColor}
                    onChange={handleChange}
                  >
                    <option value="">{t('ownedCats.selectEyeColor', 'Sélectionner une couleur')}</option>
                    {eyeColorOptions.map(option => (
                      <option key={option} value={option}>
                        {option === 'AUTRE' ? t('ownedCats.otherEyeColor', 'Autre') : formatValue(option)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('ownedCats.furType', 'Type de fourrure')}</Form.Label>
                  <Form.Select
                    name="furType"
                    value={editForm.furType}
                    onChange={handleChange}
                  >
                    <option value="">{t('ownedCats.selectFurType', 'Sélectionner un type')}</option>
                    {furTypeOptions.map(option => (
                      <option key={option} value={option}>
                        {formatValue(option)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('ownedCats.dateOfBirth', 'Date de naissance')}</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={editForm.dateOfBirth}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('ownedCats.chipNumber', 'Numéro de puce')}</Form.Label>
              <Form.Control
                type="text"
                name="chipNumber"
                value={editForm.chipNumber}
                onChange={handleChange}
                placeholder={t('ownedCats.chipNumberPlaceholder', 'Numéro de puce (si disponible)')}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('ownedCats.comment', 'Commentaire')}</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                value={editForm.comment}
                onChange={handleChange}
                placeholder={t('ownedCats.commentPlaceholder', 'Informations supplémentaires sur votre chat')}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Photos</Form.Label>
              <ImageUploader
                onImageUploaded={urls => setEditForm(prev => ({ ...prev, images: urls }))}
                initialImage={editForm.images}
                multiple={true}
                maxImages={5}
                maxSize={5}
                allowedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
                onUploadStatusChange={setIsImageUploading}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t('ownedCats.cancel', 'Annuler')}
              </Button>
              <Button variant="primary" type="submit" disabled={isImageUploading}>
                {isImageUploading && (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                )}
                {isImageUploading
                  ? t('ownedCats.savingImages', 'Traitement des images...')
                  : t('ownedCats.save', 'Enregistrer')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal pour signaler un chat perdu */}
      <Modal 
        show={showLostModal} 
        onHide={() => setShowLostModal(false)}
        onShow={() => {
          if (selectedCat) {
            // Initialiser avec l'adresse du chat sélectionné
            setLostForm({
              comment: '',
              location: {
                latitude: selectedCat.location?.latitude || null,
                longitude: selectedCat.location?.longitude || null,
                address: selectedCat.location?.address || '',
                city: selectedCat.location?.city || '',
                postalCode: selectedCat.location?.postalCode || ''
              }
            });
          }
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('ownedCats.reportLostTitle', 'Signaler un chat perdu')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            onReportAsLost(selectedCat.cat.catId, lostForm);
            setShowLostModal(false);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>{t('ownedCats.comment', 'Commentaire')}</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                value={lostForm.comment}
                onChange={(e) => setLostForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={t('ownedCats.lostCommentPlaceholder', 'Informations supplémentaires sur la disparition de votre chat')}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('ownedCats.location', 'Localisation')}</Form.Label>
              <MapLocation 
                location={lostForm.location}
                onLocationChange={(longitude, latitude) => updateLocationFromCoordinates(longitude, latitude)}
                onAddressChange={(addressData) => {
                  setLostForm(prev => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      ...addressData
                    }
                  }));
                }}
                isLocating={isLocating}
                geoError={geoError}
                onGeoErrorDismiss={() => setGeoError(null)}
                onRequestCurrentLocation={handleRequestCurrentLocation}
                mapHeight="300px"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowLostModal(false)}>
                {t('ownedCats.cancel', 'Annuler')}
              </Button>
              <Button variant="primary" type="submit">
                {t('ownedCats.report', 'Signaler')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OwnedCats;
