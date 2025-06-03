import React, { useState, useEffect } from "react";
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

const OrdersManagement = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { api } = useAxios();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    trackingNumber: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/ecommerce/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
    }
  };

  const handleOpenModal = (order = null) => {
    if (order) {
      setSelectedOrder(order);
      setFormData({
        status: order.status,
        trackingNumber: order.trackingNumber || "",
      });
    } else {
      setSelectedOrder(null);
      setFormData({
        status: "",
        trackingNumber: "",
      });
    }
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
    try {
      await api.put(`/ecommerce/orders/${selectedOrder.orderId}`, formData);
      fetchOrders();
      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm(t("admin.orders.confirmDelete"))) {
      try {
        await api.delete(`/ecommerce/orders/${orderId}`);
        fetchOrders();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "warning",
      PROCESSING: "info",
      SHIPPED: "primary",
      DELIVERED: "success",
      CANCELLED: "danger",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {t(`admin.orders.status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
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

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("admin.orders.title", "Gestion des commandes")}</h2>
      </div>

      <Card>
        <Card.Body>
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
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>{order.customerName}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(order)}
                    >
                      <FiEye />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(order.orderId)}
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
            {t("admin.orders.details", "Détails de la commande")} #
            {selectedOrder?.orderId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>
                    {t("admin.orders.customerInfo", "Informations client")}
                  </h5>
                  <p>
                    <strong>{t("admin.orders.name", "Nom")}:</strong>{" "}
                    {selectedOrder.customerName}
                    <br />
                    <strong>{t("admin.orders.email", "Email")}:</strong>{" "}
                    {selectedOrder.customerEmail}
                    <br />
                    <strong>
                      {t("admin.orders.phone", "Téléphone")}:
                    </strong>{" "}
                    {selectedOrder.customerPhone}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>
                    {t(
                      "admin.orders.shippingInfo",
                      "Informations de livraison"
                    )}
                  </h5>
                  <p>
                    <strong>{t("admin.orders.address", "Adresse")}:</strong>
                    <br />
                    {selectedOrder.shippingAddress}
                  </p>
                </Col>
              </Row>

              <h5 className="mb-3">{t("admin.orders.items", "Articles")}</h5>
              <Table responsive>
                <thead>
                  <tr>
                    <th>{t("admin.orders.product", "Produit")}</th>
                    <th>{t("admin.orders.quantity", "Quantité")}</th>
                    <th>{t("admin.orders.price", "Prix")}</th>
                    <th>{t("admin.orders.subtotal", "Sous-total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.productName}</td>
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
                      <strong>{formatPrice(selectedOrder.total)}</strong>
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
