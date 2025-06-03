import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
} from "react-bootstrap";
import { FiEye, FiTruck, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthProvider";
import { useAxios } from "../../hooks/useAxios";
import { useNotification } from "../../contexts/NotificationContext";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Affiche une notification d'erreur API standardisée.
 */
function notifyApiError(showNotification, contextMsg, error) {
  showNotification(
    `Erreur ${contextMsg} : ` +
      (error?.response?.data?.message || error?.message || "Erreur inconnue"),
    "error"
  );
}

const OrdersManagement = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const axios = useAxios();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    status: "",
    trackingNumber: "",
  });

  const fetchOrders = useCallback(async () => {
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
      const response = await axios.get("/ecommerce/orders");
      setOrders(response || []);
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la récupération des commandes",
        error
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [axios, showNotification]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      await axios.put(`/ecommerce/orders/${selectedOrder.id}`, formData);
      showNotification(
        "La commande a été mise à jour avec succès !",
        "success"
      );
      await fetchOrders();
      handleCloseModal();
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la mise à jour de la commande",
        error
      );
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm(t("admin.orders.confirmDelete"))) {
      try {
        await axios.delete(`/ecommerce/orders/${orderId}`);
        fetchOrders();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!axios) {
      notifyApiError(
        showNotification,
        "de connexion à l'API",
        new Error("API non disponible")
      );
      return;
    }

    try {
      await axios.put(`/ecommerce/orders/${orderId}/status`, {
        status: newStatus,
      });
      showNotification(
        "Le statut de la commande a été mis à jour avec succès !",
        "success"
      );
      await fetchOrders();
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la mise à jour du statut de la commande",
        error
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: "warning",
      PAID: "info",
      SHIPPED: "primary",
      DELIVERED: "success",
      CANCELLED: "danger",
    };

    const statusLabels = {
      PENDING: t("admin.orders.status.pending", "En attente"),
      PAID: t("admin.orders.status.paid", "Payée"),
      SHIPPED: t("admin.orders.status.shipped", "Expédiée"),
      DELIVERED: t("admin.orders.status.delivered", "Livrée"),
      CANCELLED: t("admin.orders.status.cancelled", "Annulée"),
    };

    return (
      <Badge bg={statusColors[status] || "secondary"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "0,00 €";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  // Use useTheme and useMediaQuery to detect mobile
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detects screen size up to small

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("admin.orders.title", "Gestion des commandes")}</h2>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p>{t("admin.orders.noOrders", "Aucune commande trouvée")}</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            {/* Conditional rendering based on screen size */}
            {isMobile ? (
              // Render as Cards on mobile
              <div className="order-cards-list">
                {currentItems.map((order) => (
                  <Card key={order.id} className="mb-3">
                    <Card.Body>
                      <Card.Title>#{order.id}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {formatDate(order.orderDate)}
                      </Card.Subtitle>
                      <Card.Text>
                        <strong>{t("admin.orders.customer", "Client")}:</strong>{" "}
                        {`${order.user?.firstName || ""} ${
                          order.user?.lastName || ""
                        }`}
                        <br />
                        <strong>
                          {t("admin.orders.total", "Total")}:
                        </strong>{" "}
                        {formatPrice(order.totalAmount)}
                        <br />
                        <strong>
                          {t("admin.orders.status", "Statut")}:
                        </strong>{" "}
                        {getStatusBadge(order.status)}
                      </Card.Text>
                      <div>
                        {/* Add action buttons for mobile if needed, similar to users/products */}
                        {/* Example: */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenModal(order)}
                        >
                          <FiEdit2 /> {t("admin.orders.edit", "Modifier")}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                        >
                          <FiTrash2 /> {t("admin.orders.delete", "Supprimer")}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              // Render as Table on larger screens
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>{t("admin.orders.id", "ID")}</th>
                    <th>{t("admin.orders.date", "Date")}</th>
                    <th>{t("admin.orders.customer", "Client")}</th>
                    <th>{t("admin.orders.total", "Total")}</th>
                    <th>{t("admin.orders.status", "Statut")}</th>
                    <th>{t("admin.orders.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{`${order.user?.firstName || ""} ${
                        order.user?.lastName || ""
                      }`}</td>
                      <td>{formatPrice(order.totalAmount)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenModal(order)}
                          title={t("admin.orders.view", "Voir les détails")}
                        >
                          <FiEye />
                        </Button>
                        {order.status === "PAID" && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(order.id, "SHIPPED")
                            }
                            title={t(
                              "admin.orders.ship",
                              "Marquer comme expédiée"
                            )}
                          >
                            <FiTruck />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

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
      )}

      {/* Modal de détails de la commande */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {t("admin.orders.details", "Détails de la commande")} #
            {selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>
                    {t("admin.orders.customerInfo", "Informations client")}
                  </h5>
                  <p>
                    <strong>{t("admin.orders.name", "Nom")}:</strong>{" "}
                    {`${selectedOrder.user?.firstName || ""} ${
                      selectedOrder.user?.lastName || ""
                    }`}
                  </p>
                  <p>
                    <strong>{t("admin.orders.email", "Email")}:</strong>{" "}
                    {selectedOrder.user?.email}
                  </p>
                  {selectedOrder.user?.phone && (
                    <p>
                      <strong>{t("admin.orders.phone", "Téléphone")}:</strong>{" "}
                      {selectedOrder.user.phone}
                    </p>
                  )}
                </Col>
                <Col md={6}>
                  <h5>
                    {t("admin.orders.orderInfo", "Informations commande")}
                  </h5>
                  <p>
                    <strong>{t("admin.orders.date", "Date")}:</strong>{" "}
                    {formatDate(selectedOrder.orderDate)}
                  </p>
                  <p>
                    <strong>{t("admin.orders.status", "Statut")}:</strong>{" "}
                    {getStatusBadge(selectedOrder.status)}
                  </p>
                  <p>
                    <strong>{t("admin.orders.total", "Total")}:</strong>{" "}
                    {formatPrice(selectedOrder.totalAmount)}
                  </p>
                </Col>
              </Row>

              <h5>{t("admin.orders.items", "Articles commandés")}</h5>
              <Table responsive>
                <thead>
                  <tr>
                    <th>{t("admin.orders.product", "Produit")}</th>
                    <th>{t("admin.orders.quantity", "Quantité")}</th>
                    <th>{t("admin.orders.price", "Prix unitaire")}</th>
                    <th>{t("admin.orders.subtotal", "Sous-total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product?.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td>{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end">
                      <strong>{t("admin.orders.total", "Total")}:</strong>
                    </td>
                    <td>
                      <strong>{formatPrice(selectedOrder.totalAmount)}</strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>

              <Form className="mt-4">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {t("admin.orders.status", "Statut")}
                      </Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="PENDING">
                          {t("admin.orders.status.pending", "En attente")}
                        </option>
                        <option value="PROCESSING">
                          {t("admin.orders.status.processing", "En traitement")}
                        </option>
                        <option value="SHIPPED">
                          {t("admin.orders.status.shipped", "Expédiée")}
                        </option>
                        <option value="DELIVERED">
                          {t("admin.orders.status.delivered", "Livrée")}
                        </option>
                        <option value="CANCELLED">
                          {t("admin.orders.status.cancelled", "Annulée")}
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {t("admin.orders.trackingNumber", "Numéro de suivi")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="trackingNumber"
                        value={formData.trackingNumber}
                        onChange={handleInputChange}
                        placeholder={t(
                          "admin.orders.trackingNumberPlaceholder",
                          "Entrez le numéro de suivi"
                        )}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("common.close", "Fermer")}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {t("common.save", "Enregistrer")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrdersManagement;
