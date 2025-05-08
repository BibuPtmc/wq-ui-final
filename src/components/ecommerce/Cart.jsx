import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, ListGroup, Form, Badge } from "react-bootstrap";
import { useCartContext } from "../../contexts/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { useAxios } from "../../hooks/useAxios";
import { useAuth } from "../../contexts/AuthProvider";
import { BsCart3 } from "react-icons/bs";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const { t } = useTranslation();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotal,
    clearCart,
    stripePublicKey,
  } = useCartContext();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Initialize Stripe with the public key from context
  const stripePromise = useMemo(() => {
    try {
      if (!stripePublicKey) {
        console.error("La clé publique Stripe n'est pas définie");
        return null;
      }
      return loadStripe(stripePublicKey);
    } catch (err) {
      console.error("Erreur d'initialisation de Stripe:", err);
      return null;
    }
  }, [stripePublicKey]);

  // Si l'utilisateur n'est pas connecté, on ne rend pas le composant
  if (!isLoggedIn) {
    return null;
  }

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error(
          "La configuration de Stripe n'est pas complète. Veuillez réessayer plus tard."
        );
      }

      console.log("Cart items before sending:", cartItems);

      // Formater les données pour le serveur
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      console.log("Formatted order items:", orderItems);

      // Création de la commande
      const orderResponse = await axiosInstance.post("/ecommerce/orders", {
        items: orderItems,
      });

      console.log("Order created:", orderResponse);

      // Création de la session Stripe
      const stripeResponse = await axiosInstance.post(
        `/ecommerce/create-checkout-session?orderId=${orderResponse.id}`
      );

      console.log("Stripe session:", stripeResponse);

      if (!stripeResponse || !stripeResponse.sessionId) {
        throw new Error("Impossible de créer la session de paiement");
      }

      // Redirection vers la page de paiement
      const { error } = await stripe.redirectToCheckout({
        sessionId: stripeResponse.sessionId,
      });

      if (error) {
        console.error("Stripe redirect error:", error);
        throw new Error(
          error.message ||
            "Erreur lors de la redirection vers la page de paiement"
        );
      }
    } catch (err) {
      console.error("Erreur lors du paiement:", err);
      let errorMessage = "Une erreur est survenue lors du paiement. ";

      if (err.response) {
        // Le serveur a répondu avec un status code hors de la plage 2xx
        errorMessage +=
          err.response.data.message || "Erreur de réponse du serveur.";
      } else if (err.request) {
        // La requête a été faite mais pas de réponse reçue
        errorMessage += "Impossible de se connecter au serveur de paiement.";
      } else {
        // Erreur lors de la configuration de la requête
        errorMessage += "Erreur de configuration de la requête.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: "inline-block" }}
      >
        <Button
          variant="outline-primary"
          className="rounded-pill position-relative"
          onClick={() => setShowModal(true)}
        >
          <BsCart3 size={20} />
          {totalItems > 0 && (
            <Badge
              bg="danger"
              className="position-absolute top-0 start-100 translate-middle rounded-pill"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </motion.div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("cart.title", "Votre Panier")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.length === 0 ? (
            <div className="text-center py-4">
              <span style={{ fontSize: "2.5rem", color: "#ccc" }}>🛒</span>
              <p className="mt-3">{t("cart.empty", "Votre panier est vide")}</p>
              <Button
                variant="outline-primary"
                onClick={() => {
                  setShowModal(false);
                  navigate("/gps-collars");
                }}
              >
                {t("cart.backToShop", "Retourner à la boutique")}
              </Button>
            </div>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item.product.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{item.product.name}</h6>
                      <p className="mb-0 text-primary">
                        {item.product.price.toFixed(2)} €
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.product.id,
                            parseInt(e.target.value)
                          )
                        }
                        style={{ width: "70px" }}
                        className="text-center"
                      />
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {cartItems.length > 0 && (
            <div className="mt-4 text-end">
              <h5>
                {t("cart.total", "Total")}: {getTotal().toFixed(2)} €
              </h5>
            </div>
          )}
          {error && (
            <div className="alert alert-danger mt-3">
              {t("cart.error", "Erreur")}: {error}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("cart.close", "Fermer")}
          </Button>
          {cartItems.length > 0 && (
            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading
                ? t("cart.loading", "Chargement...")
                : t("cart.pay", "Payer")}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Cart;
