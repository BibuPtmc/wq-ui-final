import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAxios } from "../../hooks/useAxios";
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
} from "react-bootstrap";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const UsersManagement = () => {
  const { t } = useTranslation();
  const { api } = useAxios();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "USER",
    enabled: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/list");
      setUsers(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

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
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        enabled: user.enabled,
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
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.userId}`, formData);
      } else {
        await api.post("/users", formData);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm(t("admin.users.confirmDelete"))) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("admin.users.title", "Gestion des utilisateurs")}</h2>
        <Button variant="primary" onClick={() => handleOpenDialog()}>
          <FiPlus className="me-2" />
          {t("admin.users.create", "Créer un utilisateur")}
        </Button>
      </div>

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
                        user.role
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
              onClick={(event) => {
                event.preventDefault();
                handleChangePage(event, page - 1);
              }}
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
              onClick={(event) => {
                event.preventDefault();
                handleChangePage(event, page + 1);
              }}
            >
              {t("common.next", "Suivant")}
            </Button>
          </div>
        </Card.Body>
      </Card>

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
              <Col>
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
              <Col md={6}>
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
            {!selectedUser && (
              <Row>
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
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDialog}>
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

export default UsersManagement;
