import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAxios } from "../../hooks/useAxios";
import { useNotification } from "../../contexts/NotificationContext";
import {
  Button,
  Table,
  Container,
  Card,
  Badge,
  Modal,
  Form,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

/**
 * Affiche une notification d'erreur API standardisée.
 * @param {function} showNotification - Fonction de notification du contexte
 * @param {string} contextMsg - Message d'intention (ex: "lors de la modification de l'utilisateur")
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
 * Construit un objet userDTO pour update/create à partir de données mises à jour.
 * @param {object} formData - Données du formulaire
 * @param {object} selectedUser - Utilisateur sélectionné (si modification)
 * @returns {object}
 */
function buildUserDTO(formData, selectedUser = null) {
  return {
    userId: selectedUser ? selectedUser.userId : null,
    userName: formData.userName,
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    role: formData.role,
    enabled: formData.enabled === "true" || formData.enabled === true,
    password: !selectedUser ? formData.password : undefined,
    birthDay: formData.birthDay,
    phone: formData.phone || null,
    gender: formData.gender,
    address: formData.address
      ? {
          street: formData.address.street,
          number: formData.address.number,
          city: formData.address.city,
          postalCode: formData.address.postalCode,
          country: formData.address.country,
        }
      : null,
  };
}

const UsersManagement = () => {
  const { t } = useTranslation();
  const axios = useAxios();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "USER",
    enabled: true,
    password: "",
    birthDay: "",
    phone: "",
    gender: "MALE",
    address: {
      street: "",
      number: "",
      city: "",
      postalCode: "",
      country: "Belgique",
    },
  });

  const fetchUsers = useCallback(async () => {
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
      const response = await axios.get("/users/");
      setUsers(response || []);
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la récupération des utilisateurs",
        error
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [axios, showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        userName: user.userName || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role || "USER",
        enabled: user.enabled ?? true,
        password: "",
        birthDay: user.birthDay
          ? new Date(user.birthDay).toISOString().split("T")[0]
          : "",
        phone: user.phone || "",
        gender: user.gender || "MALE",
        address: user.address
          ? {
              street: user.address.street || "",
              number: user.address.number || "",
              city: user.address.city || "",
              postalCode: user.address.postalCode || "",
              country: user.address.country || "Belgique",
            }
          : {
              street: "",
              number: "",
              city: "",
              postalCode: "",
              country: "Belgique",
            },
      });
    } else {
      setSelectedUser(null);
      setFormData({
        userName: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "USER",
        enabled: true,
        password: "",
        birthDay: "",
        phone: "",
        gender: "MALE",
        address: {
          street: "",
          number: "",
          city: "",
          postalCode: "",
          country: "Belgique",
        },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      userName: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "USER",
      enabled: true,
      password: "",
      birthDay: "",
      phone: "",
      gender: "MALE",
      address: {
        street: "",
        number: "",
        city: "",
        postalCode: "",
        country: "Belgique",
      },
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
      const payload = buildUserDTO(formData, selectedUser);

      if (selectedUser) {
        await axios.put("/users/update", payload);
        showNotification(
          "L'utilisateur a été modifié avec succès !",
          "success"
        );
      } else {
        showNotification(
          "La création d'utilisateur n'est pas encore implémentée",
          "warning"
        );
        return;
      }
      await fetchUsers();
      handleCloseDialog();
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la sauvegarde de l'utilisateur",
        error
      );
    }
  };

  const handleDelete = async (userId) => {
    if (!axios) {
      notifyApiError(
        showNotification,
        "de connexion à l'API",
        new Error("API non disponible")
      );
      return;
    }

    if (window.confirm(t("admin.users.confirmDelete"))) {
      try {
        await axios.delete(`/users/delete?id=${userId}`);
        showNotification(
          "L'utilisateur a été supprimé avec succès !",
          "success"
        );
        await fetchUsers();
      } catch (error) {
        notifyApiError(
          showNotification,
          "lors de la suppression de l'utilisateur",
          error
        );
      }
    }
  };

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("admin.users.title", "Gestion des utilisateurs")}</h2>
        <Button variant="primary" disabled title="Non implémenté">
          <FiPlus className="me-2" />
          {t("admin.users.create", "Créer un utilisateur")}
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>{t("admin.users.name", "Nom")}</th>
                  <th>{t("admin.users.email", "Email")}</th>
                  <th>{t("admin.users.role", "Rôle")}</th>
                  <th>{t("admin.users.status", "Statut")}</th>
                  <th>{t("admin.users.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <tr key={user.userId}>
                      <td>{`${user.firstName} ${user.lastName}`}</td>
                      <td>{user.email}</td>
                      <td>
                        {t(
                          `admin.users.roles.${user.role.toLowerCase()}`,
                          user.role === "ADMIN"
                            ? "Administrateur"
                            : "Utilisateur"
                        )}
                      </td>
                      <td>
                        <Badge bg={user.enabled ? "success" : "danger"}>
                          {user.enabled
                            ? t("common.active", "Actif")
                            : t("common.inactive", "Inactif")}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <FiEdit2 />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(user.userId)}
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
                disabled={page === 0}
                onClick={() => handleChangePage(null, page - 1)}
              >
                {t("common.previous", "Précédent")}
              </Button>
              <span className="mx-2 my-auto">
                {t("common.page", "Page")} {page + 1} {t("common.of", "sur")}{" "}
                {Math.ceil(users.length / rowsPerPage)}
              </span>
              <Button
                variant="outline-primary"
                className="ms-2"
                disabled={page >= Math.ceil(users.length / rowsPerPage) - 1}
                onClick={() => handleChangePage(null, page + 1)}
              >
                {t("common.next", "Suivant")}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal */}
      <Modal show={openDialog} onHide={handleCloseDialog} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser
              ? t("admin.users.edit", "Modifier l'utilisateur")
              : t("admin.users.create", "Créer un utilisateur")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {t("admin.users.firstName", "Prénom")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.lastName", "Nom")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {t("admin.users.userName", "Nom d'utilisateur")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.email", "Email")}</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {t("admin.users.birthDay", "Date de naissance")}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.phone", "Téléphone")}</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.gender", "Genre")}</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="MALE">
                      {t("common.gender.male", "Homme")}
                    </option>
                    <option value="FEMALE">
                      {t("common.gender.female", "Femme")}
                    </option>
                    <option value="OTHER">
                      {t("common.gender.other", "Autre")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.users.role", "Rôle")}</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="USER">
                      {t("admin.users.roles.user", "Utilisateur")}
                    </option>
                    <option value="ADMIN">
                      {t("admin.users.roles.admin", "Administrateur")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>{t("admin.users.status", "Statut")}</Form.Label>
                  <Form.Select
                    name="enabled"
                    value={formData.enabled}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={true}>{t("common.active", "Actif")}</option>
                    <option value={false}>
                      {t("common.inactive", "Inactif")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Card className="mb-3">
              <Card.Header>{t("admin.users.address", "Adresse")}</Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>
                        {t("admin.users.address.street", "Rue")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        {t("admin.users.address.number", "Numéro")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address.number"
                        value={formData.address.number}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        {t("admin.users.address.city", "Ville")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        {t("admin.users.address.postalCode", "Code postal")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address.postalCode"
                        value={formData.address.postalCode}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>
                        {t("admin.users.address.country", "Pays")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {!selectedUser && (
              <>
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>
                        {t("admin.users.password", "Mot de passe")}
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Alert variant="warning">
                  {t(
                    "admin.users.creationNotImplemented",
                    "La création d'utilisateur n'est pas encore implémentée"
                  )}
                </Alert>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDialog}>
            {t("common.cancel", "Annuler")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedUser}
          >
            {t("common.save", "Enregistrer")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersManagement;
