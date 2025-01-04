import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card, Alert, InputGroup } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAxios } from "../hooks/useAxios";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCalendar, FaVenusMars, FaEye, FaEyeSlash } from "react-icons/fa";
import { buttonStyles } from "../styles";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const axios = useAxios();
  const [formData, setFormData] = useState({
    userName: "testuser", // Nom d'utilisateur par défaut
    email: "test@example.com", // Email par défaut
    password: "Password123!", // Mot de passe par défaut
    matchingPassword: "Password123!", // Confirmation du mot de passe par défaut
    firstName: "John", // Prénom par défaut
    lastName: "Doe", // Nom par défaut
    birthDay: "", // Laisser vide pour la date de naissance
    phone: "0123456789", // Numéro de téléphone par défaut
    address: "123 Rue Exemple", // Adresse par défaut
    gender: "Homme", // Genre par défaut
  });

  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordComplexityError, setPasswordComplexityError] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setPasswordsMatch(true);
    setRegistrationSuccess(false);
    setPasswordComplexityError(false);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.matchingPassword) {
      setPasswordsMatch(false);
      return;
    }

    const passwordRegex = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (!passwordRegex.test(formData.password)) {
      setPasswordComplexityError(true);
      return;
    }

    axios
      .post("/auth/signup", formData)
      .then((response) => {
        console.log("Réponse de l'API :", response);
        const token = response.token;
        if (token) {
          sessionStorage.setItem("token", token);
          setRegistrationSuccess(true);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setError("Token non trouvé dans la réponse de l'API");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'inscription :", error);
        setError(
          error.response?.data?.message ||
            "Une erreur inattendue s'est produite. Veuillez réessayer plus tard."
        );
      });
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2>Inscription</h2>
                  <p className="text-muted">Rejoignez la communauté WhiskerQuest</p>
                </div>

                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                {registrationSuccess && (
                  <Alert variant="success" className="mb-4">
                    Inscription réussie ! Redirection vers la page de connexion...
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Informations de connexion</h5>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaUser className="me-2" />
                          Nom d'utilisateur
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="userName"
                          value={formData.userName}
                          onChange={handleChange}
                          placeholder="Choisissez un nom d'utilisateur"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaEnvelope className="me-2" />
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Entrez votre email"
                          required
                        />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaLock className="me-2" />
                              Mot de passe
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Créez votre mot de passe"
                                required
                                isInvalid={!passwordsMatch || passwordComplexityError}
                              />
                              <Button 
                                variant="outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ borderColor: (!passwordsMatch || passwordComplexityError) ? '#dc3545' : '' }}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                              <Form.Control.Feedback type="invalid">
                                {passwordComplexityError &&
                                  "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre ou caractère spécial."}
                              </Form.Control.Feedback>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaLock className="me-2" />
                              Confirmer
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showConfirmPassword ? "text" : "password"}
                                name="matchingPassword"
                                value={formData.matchingPassword}
                                onChange={handleChange}
                                placeholder="Confirmez le mot de passe"
                                required
                                isInvalid={!passwordsMatch}
                              />
                              <Button 
                                variant="outline-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ borderColor: !passwordsMatch ? '#dc3545' : '' }}
                              >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                              {!passwordsMatch && (
                                <Form.Control.Feedback type="invalid">
                                  Les mots de passe ne correspondent pas
                                </Form.Control.Feedback>
                              )}
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Informations personnelles</h5>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Prénom</Form.Label>
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="Votre prénom"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Votre nom"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaCalendar className="me-2" />
                              Date de naissance
                            </Form.Label>
                            <Form.Control
                              type="date"
                              name="birthDay"
                              value={formData.birthDay}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaVenusMars className="me-2" />
                              Genre
                            </Form.Label>
                            <Form.Select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              required
                            >
                              <option value="">Sélectionnez le genre</option>
                              <option value="Homme">Homme</option>
                              <option value="Femme">Femme</option>
                              <option value="Autre">Autre</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaPhone className="me-2" />
                          Téléphone
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Votre numéro de téléphone"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Adresse</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Votre adresse complète"
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Form.Group className="mb-4">
                    <Form.Check
                      required
                      label="J'accepte les termes et conditions"
                      feedback="Vous devez accepter avant de soumettre."
                      feedbackType="invalid"
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="light"
                      type="submit"
                      size="lg"
                      style={buttonStyles}
                    >
                      S'inscrire
                    </Button>
                  </div>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    Déjà membre ?{" "}
                    <Link to="/login" className="text-primary">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegistrationForm;
