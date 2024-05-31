import React, { useContext } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useAxios } from "./hooks/useAxios";
import { useAuth } from "./hooks/authProvider";

const ProfilePage = () => {
  const axios = useAxios();
  const { user, loading } = useAuth();
  var connectedUser;
  // Vérifier si l'utilisateur est connecté
  if (!sessionStorage.getItem("token")) {
    return <p>User not logged in</p>;
  } else {
    axios.get("users/me").then(function (userGet) {
      connectedUser = userGet;
    });
  }

  const isLoggedIn = !!user; // Vérifier si l'utilisateur est connecté en fonction de la présence de l'utilisateur

  const handleDeleteAccount = async () => {
    const userId = user?.userId;

    try {
      const response = await axios.delete(`/delete?id=${userId}`);
      alert(response.data); // Message de succès
      // Rediriger l'utilisateur après la suppression du compte, par exemple vers la page de connexion
      // window.location.href = '/login';
    } catch (error) {
      alert("Error deleting account: " + error.response.data); // Message d'erreur
    }
  };

  if (loading || !connectedUser) {
    console.log(loading);

    return <p>Loading...</p>;
  }

  return (
    <Container fluid>
      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Éditer le profil</Card.Title>
              <Form>
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
                    <Form.Group controlId="formFirstName">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={connectedUser.firstName}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="formLastName">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={connectedUser.lastName}
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
                        defaultValue={connectedUser.phone}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formAddress">
                      <Form.Label>Adresse</Form.Label>
                      <Form.Control type="text" defaultValue={user.address} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formGender">
                      <Form.Label>Sexe</Form.Label>
                      <Form.Select defaultValue={user.gender}>
                        <option>Homme</option>
                        <option>Femme</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formBirthDate">
                      <Form.Label>Date de naissance</Form.Label>
                      <Form.Control type="date" defaultValue={user.birthDay} />
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
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
              <Card.Title>
                {user.firstName} {user.lastName}
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
