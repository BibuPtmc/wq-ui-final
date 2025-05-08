import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaPaw,
  FaTrash,
  FaEdit,
  FaSearch,
  FaHistory,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaComment,
} from "react-icons/fa";
import MapLocation from "../map/MapLocation";
import useGeolocation from "../../hooks/useGeolocation";
import { reverseGeocode } from "../../utils/geocodingService.jsx";
// Utiliser les contextes centralisés
import { useCatSearch } from "../../contexts/CatSearchContext";
import { useCatsContext } from "../../contexts/CatsContext";
import ImageUploader from "../common/ImageUploader";
import { convertToEnum } from "../../utils/enumUtils";
import useEnums from "../../hooks/useEnums";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const OwnedCats = ({
  ownedCats,
  onShowCatDetails,
  onDeleteCat,
  onEditCat,
  onReportAsLost,
  successMessage,
}) => {
  const { t } = useTranslation();
  const {
    enums,
    loading: enumsLoading,
    error: enumsError,
    getEnumLabel,
  } = useEnums();
  // Utiliser les fonctions du contexte
  const { formatValue, calculateAge } = useCatSearch();
  const { fetchCats, getCatLocationHistory } = useCatsContext();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const { getCurrentPosition, isLocating, geoError, setGeoError } =
    useGeolocation();
  const [editForm, setEditForm] = useState({
    name: "",
    breed: "",
    color: "",
    eyeColor: "",
    gender: "",
    dateOfBirth: "",
    chipNumber: "",
    furType: "",
    comment: "",
    images: [],
    vaccinated: null,
    sterilized: null,
  });
  const [lostForm, setLostForm] = useState({
    comment: "",
    location: {
      latitude: null,
      longitude: null,
      address: "",
      city: "",
      postalCode: "",
    },
  });

  // Options pour les sélecteurs basées sur RegisterCat.js
  // Options et fonctions de formatage importées depuis les utilitaires centralisés

  const handleEdit = (catStatus) => {
    setSelectedCat(catStatus);
    // Formatage de la date pour l'input date
    let formattedDate = "";
    if (catStatus.cat.dateOfBirth) {
      const date = new Date(catStatus.cat.dateOfBirth);
      formattedDate = date.toISOString().split("T")[0];
    }
    // Toujours garantir images: []
    const images = catStatus.cat.imageUrls || [];
    const newFormData = {
      name: catStatus.cat.name || "",
      breed: convertToEnum(catStatus.cat.breed, "UNKNOWN"),
      color: convertToEnum(catStatus.cat.color, "AUTRE"),
      eyeColor: convertToEnum(catStatus.cat.eyeColor, "AUTRE"),
      gender: catStatus.cat.gender || "Inconnu",
      dateOfBirth: formattedDate,
      chipNumber: catStatus.cat.chipNumber || "",
      furType: convertToEnum(catStatus.cat.furType, "COURTE"),
      comment: catStatus.cat.comment || "",
      images: Array.isArray(images) ? images : [],
      vaccinated: catStatus.cat.vaccinated ?? null,
      sterilized: catStatus.cat.sterilized ?? null,
    };
    setEditForm(newFormData);
    setShowModal(true);
  };

  // Effet pour surveiller les changements de selectedCat et mettre à jour le formulaire
  useEffect(() => {
    if (selectedCat && selectedCat.cat) {
      // Formatage de la date pour l'input date
      let formattedDate = "";
      if (selectedCat.cat.dateOfBirth) {
        const date = new Date(selectedCat.cat.dateOfBirth);
        formattedDate = date.toISOString().split("T")[0];
      }
      // Toujours garantir images: []
      const images = selectedCat.cat.imageUrls || [];
      const newFormData = {
        name: selectedCat.cat.name || "",
        breed: selectedCat.cat.breed || "UNKNOWN",
        color: selectedCat.cat.color || "AUTRE",
        eyeColor: selectedCat.cat.eyeColor || "AUTRE",
        gender: selectedCat.cat.gender || "Inconnu",
        dateOfBirth: formattedDate,
        chipNumber: selectedCat.cat.chipNumber || "",
        furType: selectedCat.cat.furType || "Courte",
        comment: selectedCat.cat.comment || "",
        images: Array.isArray(images) ? images : [],
        vaccinated: selectedCat.cat.vaccinated ?? null,
        sterilized: selectedCat.cat.sterilized ?? null,
      };
      setEditForm(newFormData);
    }
  }, [selectedCat]);

  // Réinitialiser le formulaire lorsqu'un nouveau chat est sélectionné
  useEffect(() => {
    if (selectedCat) {
      // Pour le modal d'édition
      setEditForm((prev) => ({
        name: selectedCat.cat.name || "",
        breed: selectedCat.cat.breed || "",
        color: selectedCat.cat.color || "",
        eyeColor: selectedCat.cat.eyeColor || "",
        gender: selectedCat.cat.gender || "",
        dateOfBirth: selectedCat.cat.dateOfBirth
          ? selectedCat.cat.dateOfBirth.substring(0, 10)
          : "",
        chipNumber: selectedCat.cat.chipNumber || "",
        furType: selectedCat.cat.furType || "",
        comment: selectedCat.cat.comment || "",
        images: selectedCat.cat.imageUrls || [],
        vaccinated: selectedCat.cat.vaccinated ?? null,
        sterilized: selectedCat.cat.sterilized ?? null,
      }));

      // Pour le modal de signalement de perte
      if (showLostModal) {
        // Initialiser avec l'adresse de l'utilisateur si disponible
        setLostForm({
          comment: "",
          location: {
            latitude: selectedCat.location?.latitude || null,
            longitude: selectedCat.location?.longitude || null,
            address: selectedCat.location?.address || "",
            city: selectedCat.location?.city || "",
            postalCode: selectedCat.location?.postalCode || "",
          },
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
      imageUrl: images.length > 0 ? images[0] : null,
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
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour mettre à jour la localisation à partir des coordonnées
  const updateLocationFromCoordinates = useCallback(
    async (longitude, latitude) => {
      try {
        // Utiliser l'import ES6 déjà disponible
        const addressInfo = await reverseGeocode(longitude, latitude);

        setLostForm((prev) => ({
          ...prev,
          location: {
            latitude: latitude,
            longitude: longitude,
            address: addressInfo?.address || "",
            city: addressInfo?.city || "",
            postalCode: addressInfo?.postalCode || "",
          },
        }));
      } catch (error) {
        console.error("Erreur lors de la géolocalisation inverse:", error);
      }
    },
    []
  );

  // Fonction pour demander la position actuelle
  const handleRequestCurrentLocation = useCallback(async () => {
    setGeoError(null);
    try {
      const position = await getCurrentPosition();
      if (position && position.longitude && position.latitude) {
        await updateLocationFromCoordinates(
          position.longitude,
          position.latitude
        );
      }
    } catch (error) {
      setGeoError(error.message);
    }
  }, [getCurrentPosition, updateLocationFromCoordinates, setGeoError]);

  const handleShowHistory = async (catId) => {
    try {
      const history = await getCatLocationHistory(catId);
      setLocationHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
    }
  };

  if (ownedCats.length === 0) {
    return <Alert variant="info">Vous n'avez pas encore de chats.</Alert>;
  }

  return (
    <>
      <Card.Title className="mb-4">
        <FaPaw className="me-2" />
        {t("ownedCats.title", "Mes chats")}
      </Card.Title>

      {successMessage && (
        <Alert variant="success" className="mb-3">
          {t("ownedCats.success", successMessage)}
        </Alert>
      )}

      <div className="text-center mb-4">
        <Badge bg="primary" className="px-3 py-2">
          {t("ownedCats.count", {
            count: ownedCats.length,
            defaultValue: "{{count}} chats",
          })}
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
                      cat.imageUrls &&
                      Array.isArray(cat.imageUrls) &&
                      cat.imageUrls.length > 0
                        ? cat.imageUrls[0]
                        : "/noImageCat.png"
                    }
                    alt={cat.name}
                    onError={(e) => {
                      e.target.src = "/noImageCat.png";
                      e.target.onerror = null;
                    }}
                    style={{
                      height: "200px",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => onShowCatDetails(catStatus)}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">
                        {cat.name || t("ownedCats.noName", "Chat sans nom")}
                      </Card.Title>
                      <Badge
                        bg={
                          getEnumLabel(enums?.catGender, cat.gender) === "Mâle"
                            ? "primary"
                            : "danger"
                        }
                        className="ms-2"
                      >
                        {getEnumLabel(enums?.catGender, cat.gender) ||
                          t("ownedCats.unknownGender", "Inconnu")}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      {t("ownedCats.breed", "Race")}:{" "}
                      {getEnumLabel(enums?.breed, cat.breed) ||
                        t("ownedCats.unknownBreed", "Inconnue")}
                    </Card.Text>
                    <div className="d-grid mb-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onShowCatDetails(catStatus)}
                        className="w-100 cat-details-btn"
                      >
                        {t("ownedCats.details", "Voir les détails")}
                      </Button>
                    </div>
                    <div className="d-flex justify-content-center gap-2 cat-actions-row">
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleEdit(catStatus)}
                        title={t("ownedCats.edit", "Modifier")}
                        className="cat-action-btn"
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
                        title={t("ownedCats.delete", "Supprimer")}
                        className="cat-action-btn"
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
                        title={t("ownedCats.reportLost", "Signaler perdu")}
                        className="cat-action-btn"
                      >
                        <FaSearch />
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleShowHistory(cat.catId)}
                        title={t("ownedCats.history", "Historique")}
                        className="cat-action-btn"
                      >
                        <FaHistory />
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
          <Modal.Title>
            {t("ownedCats.editTitle", "Modifier les informations du chat")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t("ownedCats.name", "Nom du chat")}</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleChange}
                placeholder={t("ownedCats.namePlaceholder", "Nom du chat")}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("ownedCats.breed", "Race")}</Form.Label>
                  <Form.Select
                    name="breed"
                    value={editForm.breed}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">
                      {t("ownedCats.selectBreed", "Sélectionner une race")}
                    </option>
                    {enums &&
                      enums.breed.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("ownedCats.gender", "Genre")}</Form.Label>
                  <Form.Select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">
                      {t("ownedCats.selectGender", "Sélectionner un genre")}
                    </option>
                    {enums &&
                      enums.catGender.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("ownedCats.color", "Couleur")}</Form.Label>
                  <Form.Select
                    name="color"
                    value={editForm.color}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">
                      {t("ownedCats.selectColor", "Sélectionner une couleur")}
                    </option>
                    {enums &&
                      enums.catColor.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {t("ownedCats.eyeColor", "Couleur des yeux")}
                  </Form.Label>
                  <Form.Select
                    name="eyeColor"
                    value={editForm.eyeColor}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">
                      {t(
                        "ownedCats.selectEyeColor",
                        "Sélectionner une couleur"
                      )}
                    </option>
                    {enums &&
                      enums.eyeColor.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {t("ownedCats.furType", "Type de fourrure")}
                  </Form.Label>
                  <Form.Select
                    name="furType"
                    value={editForm.furType}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">
                      {t("ownedCats.selectFurType", "Sélectionner un type")}
                    </option>
                    {enums &&
                      enums.furType.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {t("ownedCats.dateOfBirth", "Date de naissance")}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={editForm.dateOfBirth}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {t("ownedCats.vaccinated", "Vacciné")}
                  </Form.Label>
                  <Form.Select
                    name="vaccinated"
                    value={
                      editForm.vaccinated === null
                        ? ""
                        : editForm.vaccinated
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        vaccinated:
                          e.target.value === ""
                            ? null
                            : e.target.value === "true",
                      }))
                    }
                  >
                    <option value="">
                      {t("ownedCats.notSpecified", "Non spécifié")}
                    </option>
                    <option value="true">{t("ownedCats.yes", "Oui")}</option>
                    <option value="false">{t("ownedCats.no", "Non")}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {t("ownedCats.sterilized", "Stérilisé")}
                  </Form.Label>
                  <Form.Select
                    name="sterilized"
                    value={
                      editForm.sterilized === null
                        ? ""
                        : editForm.sterilized
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        sterilized:
                          e.target.value === ""
                            ? null
                            : e.target.value === "true",
                      }))
                    }
                  >
                    <option value="">
                      {t("ownedCats.notSpecified", "Non spécifié")}
                    </option>
                    <option value="true">{t("ownedCats.yes", "Oui")}</option>
                    <option value="false">{t("ownedCats.no", "Non")}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                {t("ownedCats.chipNumber", "Numéro de puce")}
              </Form.Label>
              <Form.Control
                type="text"
                name="chipNumber"
                value={editForm.chipNumber}
                onChange={handleChange}
                placeholder={t(
                  "ownedCats.chipNumberPlaceholder",
                  "Numéro de puce (si disponible)"
                )}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("ownedCats.comment", "Commentaire")}</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                value={editForm.comment}
                onChange={handleChange}
                placeholder={t(
                  "ownedCats.commentPlaceholder",
                  "Informations supplémentaires sur votre chat"
                )}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Photos</Form.Label>
              <ImageUploader
                onImageUploaded={(urls) =>
                  setEditForm((prev) => ({ ...prev, images: urls }))
                }
                initialImage={editForm.images}
                multiple={true}
                maxImages={5}
                maxSize={5}
                allowedTypes={[
                  "image/jpeg",
                  "image/png",
                  "image/gif",
                  "image/webp",
                ]}
                onUploadStatusChange={setIsImageUploading}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t("ownedCats.cancel", "Annuler")}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isImageUploading}
              >
                {isImageUploading && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                {isImageUploading
                  ? t("ownedCats.savingImages", "Traitement des images...")
                  : t("ownedCats.save", "Enregistrer")}
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
              comment: "",
              location: {
                latitude: selectedCat.location?.latitude || null,
                longitude: selectedCat.location?.longitude || null,
                address: selectedCat.location?.address || "",
                city: selectedCat.location?.city || "",
                postalCode: selectedCat.location?.postalCode || "",
              },
            });
          }
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("ownedCats.reportLostTitle", "Signaler un chat perdu")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              onReportAsLost(selectedCat.cat.catId, lostForm);
              setShowLostModal(false);
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>{t("ownedCats.comment", "Commentaire")}</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                value={lostForm.comment}
                onChange={(e) =>
                  setLostForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder={t(
                  "ownedCats.lostCommentPlaceholder",
                  "Informations supplémentaires sur la disparition de votre chat"
                )}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("ownedCats.location", "Localisation")}</Form.Label>
              <MapLocation
                location={lostForm.location}
                onLocationChange={(longitude, latitude) =>
                  updateLocationFromCoordinates(longitude, latitude)
                }
                onAddressChange={(addressData) => {
                  setLostForm((prev) => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      ...addressData,
                    },
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
              <Button
                variant="secondary"
                onClick={() => setShowLostModal(false)}
              >
                {t("ownedCats.cancel", "Annuler")}
              </Button>
              <Button variant="primary" type="submit">
                {t("ownedCats.report", "Signaler")}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal d'historique */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FaHistory className="me-2" />
            {t("ownedCats.historyTitle", "Historique des localisations")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {locationHistory.length === 0 ? (
            <Alert variant="info">
              <FaInfoCircle className="me-2" />
              {t("ownedCats.noHistory", "Aucun historique disponible")}
            </Alert>
          ) : (
            <div className="location-history">
              {locationHistory.map((status, index) => (
                <div key={index} className="mb-4 position-relative">
                  {/* Ligne de temps verticale */}
                  {index < locationHistory.length - 1 && (
                    <div
                      className="position-absolute"
                      style={{
                        left: "20px",
                        top: "40px",
                        bottom: "-20px",
                        width: "2px",
                        backgroundColor: "#dee2e6",
                        zIndex: 0,
                      }}
                    />
                  )}

                  <div className="d-flex">
                    {/* Point sur la ligne de temps */}
                    <div
                      className="rounded-circle bg-primary"
                      style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                        marginRight: "20px",
                      }}
                    >
                      <FaHistory className="text-white" />
                    </div>

                    {/* Contenu de l'historique */}
                    <div className="flex-grow-1 bg-light rounded p-3 shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 text-primary">
                          {status.reportDate
                            ? format(
                                new Date(status.reportDate.replace(" ", "T")),
                                "dd MMMM yyyy HH:mm",
                                { locale: fr }
                              )
                            : t("ownedCats.noDate", "Date non disponible")}
                        </h6>
                        <Badge
                          bg={
                            status.statusCat === "LOST"
                              ? "danger"
                              : status.statusCat === "FOUND"
                              ? "success"
                              : "primary"
                          }
                          className="ms-2"
                        >
                          {status.statusCat === "LOST"
                            ? t("cat.lost", "Perdu")
                            : status.statusCat === "FOUND"
                            ? t("cat.found", "Trouvé")
                            : status.statusCat === "OWN"
                            ? t("ownedCats.owned", "Possédé")
                            : status.statusCat}
                        </Badge>
                      </div>

                      {status.location && (
                        <div className="mb-2">
                          <div className="d-flex align-items-center mb-1">
                            <FaMapMarkerAlt className="text-muted me-2" />
                            <strong>
                              {t("ownedCats.location", "Localisation")}:
                            </strong>
                          </div>
                          <div className="ms-4">
                            {status.location.address && (
                              <p className="mb-1">
                                <strong>
                                  {t("ownedCats.address", "Adresse")}:
                                </strong>{" "}
                                {status.location.address}
                              </p>
                            )}
                            {status.location.city && (
                              <p className="mb-1">
                                <strong>{t("ownedCats.city", "Ville")}:</strong>{" "}
                                {status.location.city}
                              </p>
                            )}
                            {status.location.postalCode && (
                              <p className="mb-1">
                                <strong>
                                  {t("ownedCats.postalCode", "Code postal")}:
                                </strong>{" "}
                                {status.location.postalCode}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {status.comment && (
                        <div className="mt-2">
                          <div className="d-flex align-items-center mb-1">
                            <FaComment className="text-muted me-2" />
                            <strong>
                              {t("ownedCats.comment", "Commentaire")}:
                            </strong>
                          </div>
                          <p className="mb-0 ms-4">{status.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button
            variant="secondary"
            onClick={() => setShowHistoryModal(false)}
          >
            {t("common.close", "Fermer")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OwnedCats;
