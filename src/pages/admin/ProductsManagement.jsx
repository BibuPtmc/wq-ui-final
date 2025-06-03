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
} from "react-bootstrap";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAxios } from "../../hooks/useAxios";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * Affiche une notification d'erreur API standardisée.
 * @param {function} showNotification - Fonction de notification du contexte
 * @param {string} contextMsg - Message d'intention (ex: "lors de la modification du produit")
 * @param {object} error - Objet erreur capturé
 */
function notifyApiError(showNotification, contextMsg, error) {
  showNotification(
    `Erreur ${contextMsg} : ` +
      (error?.response?.data?.message || error?.message || "Erreur inconnue"),
    "error"
  );
}

const ProductsManagement = () => {
  const { t } = useTranslation();
  const axios = useAxios();
  const { showNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  const fetchProducts = useCallback(async () => {
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
      const response = await axios.get("/ecommerce/products");
      setProducts(response || []);
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la récupération des produits",
        error
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [axios, showNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        imageUrl: product.imageUrl || "",
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
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
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stock),
      };

      if (selectedProduct) {
        await axios.put(
          `/ecommerce/products/${selectedProduct.id}`,
          productData
        );
        showNotification("Le produit a été modifié avec succès !", "success");
      } else {
        await axios.post("/ecommerce/products", productData);
        showNotification("Le produit a été créé avec succès !", "success");
      }
      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      notifyApiError(
        showNotification,
        "lors de la sauvegarde du produit",
        error
      );
    }
  };

  const handleDelete = async (productId) => {
    if (!axios) {
      notifyApiError(
        showNotification,
        "de connexion à l'API",
        new Error("API non disponible")
      );
      return;
    }

    if (
      window.confirm(
        t(
          "admin.products.confirmDelete",
          "Êtes-vous sûr de vouloir supprimer ce produit ?"
        )
      )
    ) {
      try {
        await axios.delete(`/ecommerce/products/${productId}`);
        showNotification("Le produit a été supprimé avec succès !", "success");
        await fetchProducts();
      } catch (error) {
        notifyApiError(
          showNotification,
          "lors de la suppression du produit",
          error
        );
      }
    }
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
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{t("admin.products.title", "Gestion des produits")}</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FiPlus className="me-2" />
          {t("admin.products.create", "Ajouter un produit")}
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>{t("admin.products.name", "Nom")}</th>
                <th>{t("admin.products.description", "Description")}</th>
                <th>{t("admin.products.price", "Prix")}</th>
                <th>{t("admin.products.stock", "Stock")}</th>
                <th>{t("admin.products.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stockQuantity}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(product)}
                      title={t("admin.products.edit", "Modifier")}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      title={t("admin.products.delete", "Supprimer")}
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
            {selectedProduct
              ? t("admin.products.edit", "Modifier le produit")
              : t("admin.products.create", "Ajouter un produit")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>{t("admin.products.name", "Nom")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={t(
                      "admin.products.namePlaceholder",
                      "Entrez le nom du produit"
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>
                    {t("admin.products.description", "Description")}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder={t(
                      "admin.products.descriptionPlaceholder",
                      "Entrez la description du produit"
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.products.price", "Prix")}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder={t(
                      "admin.products.pricePlaceholder",
                      "Entrez le prix"
                    )}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t("admin.products.stock", "Stock")}</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="stockQuantity"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder={t(
                      "admin.products.stockPlaceholder",
                      "Entrez la quantité en stock"
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>
                    {t("admin.products.imageUrl", "URL de l'image")}
                  </Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder={t(
                      "admin.products.imageUrlPlaceholder",
                      "Entrez l'URL de l'image du produit"
                    )}
                  />
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

export default ProductsManagement;
