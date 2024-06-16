import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useAxios } from "./hooks/useAxios";
import { useAuth } from "./hooks/authProvider";

const ProfilePage = () => {
  const axios = useAxios();
  const { user, loading: authLoading, setIsLoggedIn } = useAuth();
  const [connectedUser, setConnectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State pour le formulaire de mise à jour
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    gender: "",
    birthDay: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!sessionStorage.getItem("token")) {
        setLoading(false);
        return;
      }

      try {
        var headers = sessionStorage.getItem("token")
          ? { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
          : {};
        const response = await axios.get("users/me", { headers: headers });
        setConnectedUser(response);
        setFormData({
          firstName: response.firstName,
          lastName: response.lastName,
          address: response.address,
          gender: response.gender,
          birthDay: response.birthDay,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      fetchUserData();
    }
  }, [axios, loading]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("users/update", formData);
      alert("Profil mis à jour avec succès");
      // Mettez à jour l'utilisateur connecté dans l'état local si nécessaire
    } catch (error) {
      alert(
        "Erreur lors de la mise à jour du profil: " + error.response.message
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        `auth/delete?id=${connectedUser.userId}`
      );
      alert(response); // Message de succès
      sessionStorage.removeItem("token");
      setIsLoggedIn(false);
      // Rediriger l'utilisateur après la suppression du compte, par exemple vers la page de connexion
      window.location.href = "/login";
    } catch (error) {
      alert("Error deleting account: " + error.response); // Message d'erreur
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    let cleaned = ("" + phoneNumber).replace(/\D/g, "");
    if (cleaned.startsWith("32")) {
      cleaned = "+" + cleaned;
    } else {
      cleaned = "+32" + cleaned;
    }
    if (cleaned.startsWith("+320")) {
      cleaned = cleaned.replace("+320", "+32");
    }
    return cleaned;
  };

  if (authLoading || loading) {
    return <p>Loading...</p>;
  }

  if (!connectedUser) {
    return <p>User not logged in</p>;
  }

  return (
    <Container fluid>
      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Éditer le profil</Card.Title>
              <Form onSubmit={handleUpdateProfile}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formEmail">
                      <Form.Label>Adresse e-mail</Form.Label>
                      <Form.Control
                        type="email"
                        defaultValue={connectedUser.email}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="firstName">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="lastName">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formPhone">
                      <Form.Label>Numéro de téléphone</Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={formatPhoneNumber(connectedUser.phone)}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="address">
                      <Form.Label>Adresse</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="gender">
                      <Form.Label>Sexe</Form.Label>
                      <Form.Select
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option>Homme</option>
                        <option>Femme</option>
                        <option>Autre</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="birthDay">
                      <Form.Label>Date de naissance</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.birthDay}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit">
                  Mettre à jour
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8} className="mt-4">
          <Card>
            <Card.Body>
              <Card.Title>Modifier le mot de passe</Card.Title>
              <Form>
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group controlId="formCurrentPassword">
                      <Form.Label>Mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Mot de passe"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formNewPassword">
                      <Form.Label>Nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Nouveau mot de passe"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formConfirmPassword">
                      <Form.Label>Confirmation mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirmation mot de passe"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit">
                  Mettre à jour
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mt-4">
          <Card>
            <Card.Body className="text-center">
              <div
                className="profile-avatar"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "36px",
                  margin: "0 auto 10px",
                }}
              >
                {connectedUser.firstName.charAt(0)}
                {connectedUser.lastName.charAt(0)}
              </div>
              <Card.Title>
                {connectedUser.firstName} {connectedUser.lastName}
              </Card.Title>
              <Card.Text>Particulier</Card.Text>
              <Button variant="danger" onClick={handleDeleteAccount}>
                Supprimer mon compte
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
