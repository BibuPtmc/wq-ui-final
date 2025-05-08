import React, { useState, useEffect } from "react";
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
import { FaTimes, FaPaw } from "react-icons/fa";
// Nous utilisons maintenant useCatSearch qui contient toutes les fonctions nécessaires
import MatchingResults from "../cats/MatchingResults";
import { CatLinkRequestButton } from "../cats/CatLinkRequest";
import CatDetails from "./CatDetails";
// Utiliser les contextes centralisés
import { useCatSearch } from "../../contexts/CatSearchContext";
import { useCatsContext } from "../../contexts/CatsContext";
import { convertToEnum } from "../../utils/enumUtils";
import { useTranslation } from "react-i18next";
import ImageUploader from "../common/ImageUploader";
import useEnums from "../../hooks/useEnums";

const ReportedCats = ({ reportedCats, onDelete, onEdit, successMessage }) => {
  const { t } = useTranslation();
  const {
    enums,
    loading: enumsLoading,
    error: enumsError,
    getEnumLabel,
  } = useEnums();
  // Utiliser les fonctions du contexte
  const {
    formatValue,
    calculateAge,
    findPotentialFoundCats,
    findPotentialLostCats,
  } = useCatSearch();
  const { fetchCats } = useCatsContext();

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchCounts, setMatchCounts] = useState({});
  const [loadingMatches, setLoadingMatches] = useState({});
  const [wasInMatchesView, setWasInMatchesView] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    statusCat: "",
    comment: "",
    breed: "",
    color: "",
    dateOfBirth: "",
    gender: "",
    chipNumber: "",
    furType: "",
    eyeColor: "",
    images: [],
    vaccinated: null,
    sterilized: null,
  });
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Filtres et tri
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = plus récent, 'asc' = plus ancien

  // Utilisation de la fonction formatEnumValue centralisée

  useEffect(() => {
    const fetchMatchCounts = async () => {
      // Skip if no cats or if we're already loading matches
      if (
        reportedCats.length === 0 ||
        Object.values(loadingMatches).some((isLoading) => isLoading)
      ) {
        return;
      }

      // Check if we already have match counts for all cats
      const allCatsHaveMatchCounts = reportedCats.every(
        (catStatus) => typeof matchCounts[catStatus.cat.catId] !== "undefined"
      );

      // Skip if we already have all match counts
      if (allCatsHaveMatchCounts) {
        return;
      }

      // Only fetch for cats that don't have match counts yet
      const catsToFetch = reportedCats.filter(
        (catStatus) => typeof matchCounts[catStatus.cat.catId] === "undefined"
      );

      if (catsToFetch.length === 0) {
        return;
      }

      const counts = { ...matchCounts };
      const loading = { ...loadingMatches };

      // Set loading state for cats we're about to fetch
      catsToFetch.forEach((catStatus) => {
        loading[catStatus.cat.catId] = true;
      });
      setLoadingMatches(loading);

      // Fetch match counts sequentially to avoid too many simultaneous requests
      for (const catStatus of catsToFetch) {
        const catId = catStatus.cat.catId;
        try {
          if (catStatus.statusCat === "LOST") {
            const matchResults = await findPotentialFoundCats(catId);
            counts[catId] = matchResults.length;
          } else if (catStatus.statusCat === "FOUND") {
            const matchResults = await findPotentialLostCats(catId);
            counts[catId] = matchResults.length;
          } else {
            counts[catId] = 0; // Set to 0 for other statuses
          }

          loading[catId] = false;

          // Update state after each fetch to show progress
          setMatchCounts({ ...counts });
          setLoadingMatches({ ...loading });
        } catch (error) {
          console.error(`Error fetching matches for cat ${catId}:`, error);
          counts[catId] = 0;
          loading[catId] = false;
        }
      }
    };

    fetchMatchCounts();
  }, [
    reportedCats,
    matchCounts,
    loadingMatches,
    findPotentialFoundCats,
    findPotentialLostCats,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (catStatusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chat ?")) {
      const success = await onDelete(catStatusId);
      if (success) {
        // Rafraîchir les données après la suppression
        await fetchCats();
      }
    }
  };

  const handleEdit = (catStatus) => {
    setSelectedCat(catStatus);
    setEditForm({
      name: catStatus.cat.name || "",
      statusCat: catStatus.statusCat || "",
      comment: catStatus.cat.comment || "", // Utiliser le commentaire du chat au lieu du commentaire du statut
      breed: convertToEnum(catStatus.cat.breed, "") || "",
      color: convertToEnum(catStatus.cat.color, "") || "",
      dateOfBirth: catStatus.cat.dateOfBirth || "",
      gender: catStatus.cat.gender || "",
      chipNumber: catStatus.cat.chipNumber || "",
      furType: convertToEnum(catStatus.cat.furType, "") || "",
      eyeColor: convertToEnum(catStatus.cat.eyeColor, "") || "",
      images: catStatus.cat.imageUrls || [],
      vaccinated: catStatus.cat.vaccinated ?? null,
      sterilized: catStatus.cat.sterilized ?? null,
    });
    setShowModal(true);
  };

  const handleViewDetails = (catStatus) => {
    setSelectedCat(catStatus);
    setShowDetailsModal(true);
    // Sauvegarder l'état actuel des correspondances
    setWasInMatchesView(showMatches);
    // Ne pas fermer les correspondances, mais les cacher temporairement
    setShowMatches(false);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    // Réafficher les correspondances uniquement si l'utilisateur était dans la vue des correspondances
    if (wasInMatchesView && matches.length > 0) {
      setShowMatches(true);
    }
    setWasInMatchesView(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Préparer le payload avec images comme dans OwnedCats
    const payload = {
      ...editForm,
      imageUrls: editForm.images,
      imageUrl: editForm.images.length > 0 ? editForm.images[0] : null,
      vaccinated: editForm.vaccinated,
      sterilized: editForm.sterilized,
    };
    const success = await onEdit(selectedCat.catStatusId, payload);
    setShowModal(false);
    if (success) {
      // Rafraîchir les données après l'édition
      await refreshCats();
    }
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handler pour la mise à jour des images
  const handleImageUploaded = (imageData) => {
    if (Array.isArray(imageData)) {
      setEditForm((prev) => ({
        ...prev,
        images: imageData,
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        images: imageData ? [imageData] : [],
      }));
    }
  };

  const handleShowMatches = async (cat) => {
    const matchResults = await findPotentialFoundCats(cat.catId);
    setMatches(matchResults);
    setShowMatches(true);
  };

  const handleShowMatchesLost = async (cat) => {
    const matchResults = await findPotentialLostCats(cat.catId);
    setMatches(matchResults);
    setShowMatches(true);
  };

  const handleCloseMatches = () => {
    setShowMatches(false);
  };

  const refreshCats = async () => {
    // Utiliser fetchCats du contexte pour rafraîchir les données sans recharger la page
    await fetchCats();
  };

  if (reportedCats.length === 0) {
    return (
      <Alert variant="info">
        {t("reportedCats.none", "Vous n'avez pas de chats signalés.")}
      </Alert>
    );
  }

  // Application des filtres et du tri
  const filteredCats = reportedCats
    .filter(
      (catStatus) => !statusFilter || catStatus.statusCat === statusFilter
    )
    .sort((a, b) => {
      const dateA = new Date(a.reportDate);
      const dateB = new Date(b.reportDate);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <>
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}

      <div className="d-flex flex-wrap gap-3 align-items-center justify-content-center mb-4">
        <div>
          <Form.Label className="me-2 mb-0">Filtrer par statut :</Form.Label>
          <Form.Select
            size="sm"
            style={{ width: 160, display: "inline-block" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous</option>
            <option value="LOST">Perdu</option>
            <option value="FOUND">Trouvé</option>
          </Form.Select>
        </div>
        <div>
          <Form.Label className="me-2 mb-0">Trier :</Form.Label>
          <Form.Check
            inline
            label="Plus récent"
            type="radio"
            id="sort-desc"
            name="sortOrder"
            checked={sortOrder === "desc"}
            onChange={() => setSortOrder("desc")}
          />
          <Form.Check
            inline
            label="Plus ancien"
            type="radio"
            id="sort-asc"
            name="sortOrder"
            checked={sortOrder === "asc"}
            onChange={() => setSortOrder("asc")}
          />
        </div>
        <Badge bg="primary" className="px-3 py-2">
          {t("reportedCats.count", {
            count: filteredCats.length,
            defaultValue: `${filteredCats.length} chats signalés`,
          })}
        </Badge>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredCats.map((catStatus) => {
          const cat = catStatus.cat;
          return (
            <Col key={catStatus.catStatusId}>
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
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">
                        {cat.name || t("reportedCats.noName", "Chat sans nom")}
                      </Card.Title>
                      <Badge
                        bg={
                          cat.gender ===
                          t("reportedCats.male", { defaultValue: "Mâle" })
                            ? "primary"
                            : "danger"
                        }
                        className="ms-2"
                      >
                        {formatValue(cat.gender) ||
                          t("reportedCats.unknownGender", "Genre inconnu")}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      {t("reportedCats.breed", "Race")}:{" "}
                      {formatValue(cat.breed) ||
                        t("reportedCats.unknownBreed", "Inconnue")}
                      {cat.dateOfBirth && (
                        <span className="ms-2">
                          {t("reportedCats.age", "Âge")}:{" "}
                          {calculateAge(cat.dateOfBirth)}
                        </span>
                      )}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      {t("reportedCats.status", "Statut")}:{" "}
                      {getEnumLabel(enums?.statusCat, catStatus.statusCat) ||
                        t("reportedCats.notSpecified", "Non spécifié")}{" "}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      {t("reportedCats.reportedOn", "Signalé le")}:{" "}
                      {new Date(catStatus.reportDate).toLocaleDateString()}
                    </Card.Text>
                    {catStatus.comment && (
                      <Card.Text className="text-muted small">
                        {t("reportedCats.comment", "Commentaire")}:{" "}
                        {catStatus.comment}
                      </Card.Text>
                    )}
                    <div className="d-grid mb-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-100 cat-details-btn"
                        onClick={() => handleViewDetails(catStatus)}
                      >
                        {t("reportedCats.details", "Voir détails")}
                      </Button>
                    </div>
                    <div className="d-flex justify-content-center gap-2 cat-actions-row">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(catStatus)}
                        className="cat-action-btn"
                        title={t("reportedCats.edit", "Modifier")}
                      >
                        <i className="fa fa-edit"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(catStatus.catStatusId)}
                        className="cat-action-btn"
                        title={t("reportedCats.delete", "Supprimer")}
                      >
                        <FaTimes />
                      </Button>
                    </div>

                    {/* Bouton pour lier un chat perdu à un chat trouvé */}
                    {catStatus.statusCat === "LOST" && (
                      <div
                        className="mt-2"
                        key={`link-request-${catStatus.catStatusId}`}
                      >
                        <CatLinkRequestButton
                          lostCatStatusId={catStatus.catStatusId}
                          onSuccess={refreshCats}
                        />
                      </div>
                    )}

                    {/* Afficher l'ID unique pour les chats trouvés */}
                    {catStatus.statusCat === "FOUND" && (
                      <div
                        className="mt-2 text-center"
                        key={`found-id-${catStatus.catStatusId}`}
                      >
                        <Badge bg="info" className="px-3 py-2">
                          {t("reportedCats.id", "ID")}: #{catStatus.catStatusId}
                        </Badge>
                        <div className="small text-muted mt-1">
                          {t(
                            "reportedCats.idHelp",
                            "Communiquez cet ID au propriétaire"
                          )}
                        </div>
                      </div>
                    )}

                    {catStatus.statusCat === "LOST" && (
                      <Button
                        key={`lost-match-button-${catStatus.catStatusId}`}
                        variant="outline-info"
                        size="sm"
                        className="w-100 mt-2"
                        onClick={() => handleShowMatches(cat)}
                        disabled={loadingMatches[cat.catId]}
                      >
                        <FaPaw className="me-2" />
                        {loadingMatches[cat.catId]
                          ? t(
                              "reportedCats.loadingMatches",
                              "Chargement des correspondances..."
                            )
                          : matchCounts[cat.catId]
                          ? t("reportedCats.matchCount", {
                              count: matchCounts[cat.catId],
                              defaultValue: `${
                                matchCounts[cat.catId]
                              } correspondance(s)`,
                            })
                          : t(
                              "reportedCats.noMatches",
                              "Aucune correspondance"
                            )}
                      </Button>
                    )}
                    {catStatus.statusCat === "FOUND" && (
                      <Button
                        key={`found-match-button-${catStatus.catStatusId}`}
                        variant="outline-info"
                        size="sm"
                        className="w-100 mt-2"
                        onClick={() => handleShowMatchesLost(cat)}
                        disabled={loadingMatches[cat.catId]}
                      >
                        <FaPaw className="me-2" />
                        {loadingMatches[cat.catId]
                          ? t(
                              "reportedCats.loadingMatches",
                              "Chargement des correspondances..."
                            )
                          : matchCounts[cat.catId]
                          ? t("reportedCats.matchCount", {
                              count: matchCounts[cat.catId],
                              defaultValue: `${
                                matchCounts[cat.catId]
                              } correspondance(s)`,
                            })
                          : t(
                              "reportedCats.noMatches",
                              "Aucune correspondance"
                            )}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {t("reportedCats.editTitle", "Modifier les informations du chat")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {t("reportedCats.name", "Nom du chat")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("reportedCats.status", "Statut")}</Form.Label>
                  <Form.Select
                    name="statusCat"
                    value={editForm.statusCat}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option key="empty" value="">
                      {t("reportedCats.selectStatus", "Sélectionner un statut")}
                    </option>
                    {enums &&
                      enums.statusCat.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                  {enumsError && (
                    <div className="text-danger">
                      Erreur lors du chargement des statuts
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("reportedCats.breed", "Race")}</Form.Label>
                  <Form.Select
                    name="breed"
                    value={editForm.breed}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">Sélectionner une race</option>
                    {enums &&
                      enums.breed.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                  {enumsError && (
                    <div className="text-danger">
                      Erreur lors du chargement des races
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t("reportedCats.color", "Couleur")}</Form.Label>
                  <Form.Select
                    name="color"
                    value={editForm.color}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">Sélectionner une couleur</option>
                    {enums &&
                      enums.catColor.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                  {enumsError && (
                    <div className="text-danger">
                      Erreur lors du chargement des couleurs
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de naissance</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={editForm.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Genre</Form.Label>
                  <Form.Select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">Sélectionner un genre</option>
                    {enums &&
                      enums.catGender.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                  {enumsError && (
                    <div className="text-danger">
                      Erreur lors du chargement des genres
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vacciné</Form.Label>
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
                      setEditForm({
                        ...editForm,
                        vaccinated:
                          e.target.value === ""
                            ? null
                            : e.target.value === "true",
                      })
                    }
                  >
                    <option value="">Non spécifié</option>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stérilisé</Form.Label>
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
                      setEditForm({
                        ...editForm,
                        sterilized:
                          e.target.value === ""
                            ? null
                            : e.target.value === "true",
                      })
                    }
                  >
                    <option value="">Non spécifié</option>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Numéro de puce</Form.Label>
                  <Form.Control
                    type="text"
                    name="chipNumber"
                    value={editForm.chipNumber}
                    onChange={handleChange}
                    placeholder="Optionnel"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de pelage</Form.Label>
                  <Form.Select
                    name="furType"
                    value={editForm.furType}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">Sélectionner un type de pelage</option>
                    {enums &&
                      enums.furType.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                  {enumsError && (
                    <div className="text-danger">
                      Erreur lors du chargement des types de pelage
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Couleur des yeux</Form.Label>
                  <Form.Select
                    name="eyeColor"
                    value={editForm.eyeColor}
                    onChange={handleChange}
                    disabled={enumsLoading || enumsError}
                  >
                    <option value="">Sélectionner une couleur d'yeux</option>
                    {enums &&
                      enums.eyeColor.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                  {enumsError && (
                    <div className="text-danger">
                      Erreur lors du chargement des couleurs d'yeux
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Commentaire</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="comment"
                    value={editForm.comment}
                    onChange={handleChange}
                    style={{ height: "100px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Photos</Form.Label>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
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

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
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
                {isImageUploading ? "Traitement des images..." : "Enregistrer"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <CatDetails
        selectedCatStatus={selectedCat}
        show={showDetailsModal}
        handleClose={handleCloseDetails}
        hideContactInfo={true}
      />

      <MatchingResults
        matches={matches}
        show={showMatches}
        handleClose={handleCloseMatches}
        onViewDetails={(catStatus) => {
          handleCloseMatches();
          handleViewDetails(catStatus);
        }}
      />
    </>
  );
};

export default ReportedCats;
