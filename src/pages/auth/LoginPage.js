import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/authProvider";
import { useAxios } from "../../hooks/useAxios";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";

function LoginPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserData } = useAuth();
  const axios = useAxios();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "bibu@gmail.com", // Email préenregistré
    password: "Patamon10#",   // Mot de passe préenregistré
  });
  const [showPassword, setShowPassword] = useState(false);

  // Fonction pour décoder un token JWT
  const parseJwt = (token) => {
    try {
      // Diviser le token en ses trois parties
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error("Format de token JWT invalide");
        return null;
      }
      
      // Décoder l'en-tête (header)
      const headerBase64 = parts[0];
      const headerJson = atob(headerBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const header = JSON.parse(headerJson);
      console.log("JWT Header:", header);
      
      // Décoder la charge utile (payload)
      const payloadBase64 = parts[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      console.log("JWT Payload:", payload);
      
      return payload;
    } catch (e) {
      console.error("Erreur lors du décodage du token JWT:", e);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("auth/login", formData);
      console.log("Réponse de l'API login:", response);
      
      if (response.token) {
        sessionStorage.setItem("token", response.token);
        setIsLoggedIn(true);
        
        // Décoder le token pour extraire les informations utilisateur
        const decodedToken = parseJwt(response.token);
        console.log("Token décodé:", decodedToken);
        
        if (decodedToken) {
          // Créer un objet utilisateur avec les informations du token
          // Essayer différentes propriétés possibles pour trouver le prénom
          const userData = {
            email: decodedToken.sub || decodedToken.email || formData.email,
            firstName: decodedToken.firstName || decodedToken.given_name || decodedToken.name || formData.email.split('@')[0],
            // Ajouter d'autres champs si disponibles dans le token
            id: decodedToken.id || decodedToken.userId || decodedToken.user_id,
            role: decodedToken.role || decodedToken.roles
          };
          
          console.log("Données utilisateur extraites du token:", userData);
          setUserData(userData);
          
          // Stocker également l'email dans le localStorage pour référence future
          localStorage.setItem("userEmail", userData.email);
        }
        
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2>Connexion</h2>
                  <p className="text-muted">Accédez à votre compte WhiskerQuest</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaUser className="me-2" />
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Entrez votre email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FaLock className="me-2" />
                      Mot de passe
                    </Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Entrez votre mot de passe"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                  </Form.Group>

                  <div className="d-grid">
                    <Button variant="primary" type="submit" size="lg">
                      Se connecter
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Card className="mt-4 shadow-sm">
              <Card.Body className="p-4 text-center">
                <FaUserPlus className="text-primary mb-3" size={24} />
                <h4>Pas encore de compte ?</h4>
                <p className="text-muted mb-4">
                  Rejoignez WhiskerQuest pour profiter de toutes nos fonctionnalités
                </p>
                <Button
                  as={Link}
                  to="/register"
                  variant="outline-primary"
                  size="lg"
                  className="px-5"
                >
                  S'inscrire
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
