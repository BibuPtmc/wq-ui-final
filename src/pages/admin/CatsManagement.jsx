import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAxios } from "../../hooks/useAxios";
import { Button, Table } from "react-bootstrap";
import { Container, Card, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useNotification } from "../../contexts/NotificationContext";
import { convertToEnum } from "../../utils/enumUtils";

/**
 * Affiche une notification d'erreur API standardisée.
 * @param {function} showNotification - Fonction de notification du contexte
 * @param {string} contextMsg - Message d'intention (ex: "lors de la modification du chat")
 * @param {object} error - Objet erreur capturé
 */
function notifyApiError(showNotification, contextMsg, error) {
  showNotification(
    `Erreur ${contextMsg} : ` +
      (error?.response?.data?.message || error?.message || "Erreur inconnue"),
    "error"
  );
}

/**
 * Construit un objet catDTO pour update/create à partir de données mises à jour.
 * @param {object} formData - Données du formulaire
 * @param {object} selectedCat - Chat sélectionné (si modification)
 * @returns {object}
 */
function buildCatDTO(formData, selectedCat = null) {
  return {
    catId: selectedCat ? selectedCat.cat.catId : null,
    name: formData.name,
    breed: convertToEnum(formData.breed, selectedCat?.cat.breed || ""),
    color: convertToEnum(formData.color, selectedCat?.cat.color || ""),
    dateOfBirth: selectedCat?.cat.dateOfBirth || null,
    gender: formData.gender,
    chipNumber: formData.chipNumber || null,
    furType: convertToEnum(formData.furType, selectedCat?.cat.furType || ""),
    eyeColor: convertToEnum(formData.eyeColor, selectedCat?.cat.eyeColor || ""),
    vaccinated:
      formData.vaccinated === "" ? null : formData.vaccinated === "true",
    sterilized:
      formData.sterilized === "" ? null : formData.sterilized === "true",
    statusCat: formData.available ? "OWN" : "LOST",
  };
}

const CatsManagement = () => {
  const { t } = useTranslation();
  const axios = useAxios();
  const { showNotification } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [allCats, setAllCats] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    color: "",
    age: "",
    gender: "MALE",
    description: "",
    available: true,
    chipNumber: "",
    furType: "",
    eyeColor: "",
    vaccinated: null,
    sterilized: null,
  });

  const fetchAllCats = useCallback(async () => {
    if (!axios) {
      notifyApiError(
        showNotification,
        "de connexion à l'API",
        new Error("API non disponible")
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("/cat/admin/all-current");
      setAllCats(response || []);
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la récupération des chats",
        error
      );
      setAllCats([]);
    } finally {
      setLoading(false);
    }
  }, [axios, showNotification]);

  useEffect(() => {
    fetchAllCats();
  }, [fetchAllCats]);

  const handleOpenModal = (catStatus = null) => {
    if (catStatus) {
      setSelectedCat(catStatus);
      setFormData({
        name: catStatus.cat.name || "",
        breed: catStatus.cat.breed || "",
        color: catStatus.cat.color || "",
        age: calculateAge(catStatus.cat.dateOfBirth) || "",
        gender: catStatus.cat.gender || "MALE",
        description: catStatus.cat.description || "",
        available: catStatus.statusCat === "OWN",
        chipNumber: catStatus.cat.chipNumber || "",
        furType: catStatus.cat.furType || "",
        eyeColor: catStatus.cat.eyeColor || "",
        vaccinated: catStatus.cat.vaccinated ?? null,
        sterilized: catStatus.cat.sterilized ?? null,
      });
    } else {
      setSelectedCat(null);
      setFormData({
        name: "",
        breed: "",
        color: "",
        age: "",
        gender: "MALE",
        description: "",
        available: true,
        chipNumber: "",
        furType: "",
        eyeColor: "",
        vaccinated: null,
        sterilized: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCat(null);
    setFormData({
      name: "",
      breed: "",
      color: "",
      age: "",
      gender: "MALE",
      description: "",
      available: true,
      chipNumber: "",
      furType: "",
      eyeColor: "",
      vaccinated: null,
      sterilized: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!axios) {
      notifyApiError(
        showNotification,
        "de connexion à l'API",
        new Error("API non disponible")
      );
      return;
    }

    try {
      const payload = buildCatDTO(formData, selectedCat);

      if (selectedCat) {
        await axios.put(`/cat/status/${selectedCat.catStatusId}`, payload);
        showNotification("Le chat a été modifié avec succès !", "success");
      } else {
        await axios.post("/cat/status", payload);
        showNotification("Le chat a été créé avec succès !", "success");
      }
      await fetchAllCats();
      handleCloseModal();
    } catch (error) {
      notifyApiError(showNotification, "lors de la sauvegarde du chat", error);
    }
  };

  const handleDelete = async (catId) => {
    if (!axios) {
      notifyApiError(
        showNotification,
        "de connexion à l'API",
        new Error("API non disponible")
      );
      return;
    }

    if (window.confirm(t("admin.cats.confirmDelete"))) {
      try {
        await axios.delete(`/cat/delete?id=${catId}`);
        showNotification("Le chat a été supprimé avec succès !", "success");
        await fetchAllCats();
      } catch (error) {
        notifyApiError(
          showNotification,
          "lors de la suppression du chat",
          error
        );
      }
    }
  };

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0
      ? `${age} an${age > 1 ? "s" : ""}`
      : t("common.lessThanOneYear", "< 1 an");
  };

  const totalPages = Math.ceil((allCats?.length || 0) / itemsPerPage);
  const currentItems =
    allCats?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ) || [];

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("admin.cats.title", "Gestion des chats")}</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FiPlus className="me-2" />
          {t("admin.cats.create", "Créer un chat")}
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th>{t("admin.cats.id", "ID")}</th>
              <th>{t("admin.cats.name", "Nom")}</th>
              <th>{t("admin.cats.breed", "Race")}</th>
              <th>{t("admin.cats.color", "Couleur")}</th>
              <th>{t("admin.cats.age", "Âge")}</th>
              <th>{t("admin.cats.gender", "Genre")}</th>
              <th>{t("admin.cats.chipNumber", "Numéro de puce")}</th>
              <th>{t("admin.cats.vaccinated", "Vacciné")}</th>
              <th>{t("admin.cats.sterilized", "Stérilisé")}</th>
              <th>{t("admin.cats.status", "Statut")}</th>
              <th>{t("admin.cats.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((catStatus) => (
              <tr key={catStatus.catStatusId}>
                <td>{catStatus.cat.catId}</td>
                <td>{catStatus.cat.name}</td>
                <td>{catStatus.cat.breed}</td>
                <td>{catStatus.cat.color}</td>
                <td>{calculateAge(catStatus.cat.dateOfBirth)}</td>
                <td>
                  {t(
                    `admin.cats.genders.${catStatus.cat.gender?.toLowerCase()}`,
                    catStatus.cat.gender
                  )}
                </td>
                <td>{catStatus.cat.chipNumber || "-"}</td>
                <td>
                  <Badge bg={catStatus.cat.vaccinated ? "success" : "danger"}>
                    {catStatus.cat.vaccinated
                      ? t("common.yes", "Oui")
                      : t("common.no", "Non")}
                  </Badge>
                </td>
                <td>
                  <Badge bg={catStatus.cat.sterilized ? "success" : "danger"}>
                    {catStatus.cat.sterilized
                      ? t("common.yes", "Oui")
                      : t("common.no", "Non")}
                  </Badge>
                </td>
                <td>
                  <Badge
                    bg={
                      catStatus.statusCat === "OWN"
                        ? "success"
                        : catStatus.statusCat === "LOST"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {catStatus.statusCat === "OWN"
                      ? t("common.owned", "Possédé")
                      : catStatus.statusCat === "LOST"
                      ? t("common.lost", "Perdu")
                      : t("common.found", "Trouvé")}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenModal(catStatus)}
                  >
                    <FiEdit2 />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(catStatus.cat.catId)}
                  >
                    <FiTrash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Pagination */}
      {!loading && allCats.length > 0 && (
        <div className="d-flex justify-content-center mt-3">
          <Button
            variant="outline-primary"
            className="me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            {t("common.previous", "Précédent")}
          </Button>
          <span className="mx-2 my-auto">
            {t("common.page", "Page")} {currentPage} {t("common.of", "sur")}{" "}
            {totalPages}
          </span>
          <Button
            variant="outline-primary"
            className="ms-2"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            {t("common.next", "Suivant")}
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCat
              ? t("admin.cats.edit", "Modifier le chat")
              : t("admin.cats.create", "Créer un chat")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.cats.name", "Nom")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.cats.breed", "Race")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.cats.age", "Âge")}</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.cats.gender", "Genre")}</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="MALE">
                      {t("admin.cats.genders.male", "Mâle")}
                    </option>
                    <option value="FEMALE">
                      {t("admin.cats.genders.female", "Femelle")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>
                    {t("admin.cats.description", "Description")}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>{t("admin.cats.status", "Statut")}</Form.Label>
                  <Form.Select
                    name="available"
                    value={formData.available}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={true}>
                      {t("common.available", "Disponible")}
                    </option>
                    <option value={false}>
                      {t("common.unavailable", "Indisponible")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("common.cancel", "Annuler")}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {t("common.save", "Enregistrer")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CatsManagement;
