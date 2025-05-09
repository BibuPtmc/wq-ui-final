import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { useAxios } from "../../hooks/useAxios";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthProvider";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [matchingPassword, setMatchingPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showMatchingPassword, setShowMatchingPassword] = useState(false);
  const navigate = useNavigate();
  const axios = useAxios();
  const { setIsLoggedIn, setUserData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== matchingPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      const response = await axios.post("auth/reset-password", {
        token,
        newPassword,
        matchingPassword,
      });
      setMessage(response);
      setError("");

      // Déconnecter l'utilisateur
      setIsLoggedIn(false);
      setUserData(null);
      sessionStorage.removeItem("token");
      localStorage.removeItem("userEmail");

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data || "Une erreur est survenue");
      setMessage("");
    }
  };

  if (!token) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Token de réinitialisation manquant ou invalide. Veuillez demander un
          nouveau lien de réinitialisation.
        </Alert>
        <Link to="/forgot-password" className="btn btn-primary">
          <FaArrowLeft className="me-2" />
          Retour à la page de mot de passe oublié
        </Link>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">
                  <FaLock className="me-2" />
                  Réinitialisation du mot de passe
                </h2>

                {message && (
                  <Alert variant="success" className="mb-4">
                    {message}
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nouveau mot de passe</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirmer le mot de passe</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showMatchingPassword ? "text" : "password"}
                        value={matchingPassword}
                        onChange={(e) => setMatchingPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y"
                        onClick={() =>
                          setShowMatchingPassword(!showMatchingPassword)
                        }
                      >
                        {showMatchingPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                  >
                    Réinitialiser le mot de passe
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      <FaArrowLeft className="me-2" />
                      Retour à la connexion
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
