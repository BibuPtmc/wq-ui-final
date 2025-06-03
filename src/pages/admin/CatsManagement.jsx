import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAxios } from "../../hooks/useAxios";
import { Button, Table } from "react-bootstrap";
import { Container, Card, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

import { useCatsContext } from "../../contexts/CatsContext";

const CatsManagement = () => {
  const { t } = useTranslation();
  const api = useAxios();
  const [showModal, setShowModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "MALE",
    description: "",
    available: true,
  });

  // Add state for combined cats from context
  const { reportedCats, ownedCats, loading: catsLoading } = useCatsContext();
  const [allCats, setAllCats] = useState([]);

  useEffect(() => {
    // Combine reported and owned cats and set to allCats state
    const combinedCats = [...reportedCats, ...ownedCats];
    // You might want to add logic here to ensure uniqueness if a cat could appear in both lists with isCurrent=true
    setAllCats(combinedCats);
  }, [reportedCats, ownedCats]);

  const handleOpenModal = (catStatus = null) => {
    if (catStatus) {
      setSelectedCat(catStatus);
      setFormData({
        name: catStatus.cat.name || "",
        breed: catStatus.cat.breed || "",
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
        age: "",
        gender: "MALE",
        description: "",
        available: true,
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
      age: "",
      gender: "MALE",
      description: "",
      available: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Prepare payload for update/create
      const payload = {
        catId: selectedCat ? selectedCat.cat.catId : null,
        name: formData.name,
        breed: formData.breed,
        dateOfBirth: null,
        gender: formData.gender,
        chipNumber: formData.chipNumber,
        furType: formData.furType,
        eyeColor: formData.eyeColor,
        vaccinated: formData.vaccinated,
        sterilized: formData.sterilized,
        statusCat: formData.available ? "OWN" : "LOST",
      };

      if (selectedCat) {
        await api.put(`/cat/status/${selectedCat.catStatusId}`, payload);
      } else {
        await api.post("/cat/status", payload);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleDelete = async (catId) => {
    if (
      window.confirm(
        t(
          "admin.cats.confirmDelete",
          "Êtes-vous sûr de vouloir supprimer ce chat ?"
        )
      )
    ) {
      try {
        await api.delete(`/cats/${catId}`);
      } catch (error) {
        console.error("Erreur lors de la suppression du chat:", error);
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

      <Card>
        <Card.Body>
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

          {/* Pagination */}
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {t("common.next", "Suivant")}
            </Button>
          </div>
        </Card.Body>
      </Card>

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
