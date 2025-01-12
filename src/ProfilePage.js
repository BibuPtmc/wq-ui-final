import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, Nav, Tab } from "react-bootstrap";
import { useAxios } from "./hooks/useAxios";
import { useAuth } from "./hooks/authProvider";
import { FaUser,FaPaw, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaLock, FaHistory, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import ReportedCats from './ReportedCats'; // Importez votre composant ici

const ProfilePage = () => {
  const axios = useAxios();
  const { loading: authLoading, setIsLoggedIn, fetchUserData } = useAuth();
  const [connectedUser, setConnectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [reportedCats, setReportedCats] = useState([]); // État pour les chats signalés

  // State pour le formulaire de mise à jour
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    gender: "",
    birthDay: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    matchingPassword: ""
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showMatchingPassword, setShowMatchingPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!sessionStorage.getItem("token")) {
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${sessionStorage.getItem("token")}` };
        const response = await axios.get("users/me", { headers });
        setConnectedUser(response);
        setFormData({
          firstName: response.firstName || "",
          lastName: response.lastName || "",
          address: response.address || "",
          gender: response.gender || "",
          birthDay: response.birthDay || "",
        });

        // Récupérer les chats signalés ici
        try {
          const reportedResponse = await axios.get("cat/reportedCats", { headers });
          setReportedCats(reportedResponse || []); // Assurez-vous d'utiliser .data
        } catch (error) {
          // Ne pas afficher d'erreur si aucun chat n'est trouvé
          setReportedCats([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUpdateError("Erreur lors du chargement des données utilisateur");
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
    setUpdateSuccess(false);
    setUpdateError("");
    
    try {
      await axios.put("users/update", formData);
      setUpdateSuccess(true);
      setUpdateError("Profil mis à jour avec succès !");
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Faire disparaître le message après 5 secondes
      setTimeout(() => {
        setUpdateSuccess(false);
        setUpdateError("");
      }, 5000);

    } catch (error) {
      setUpdateSuccess(false);
      setUpdateError(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.id]: e.target.value });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError("");

    // Vérifier que les mots de passe correspondent
    if (passwordForm.newPassword !== passwordForm.matchingPassword) {
      setUpdateError("Les nouveaux mots de passe ne correspondent pas");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const updatedData = {
        ...formData,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        matchingPassword: passwordForm.newPassword,
        password: passwordForm.newPassword
      };

      const response = await axios.put("users/update", updatedData);
      
      // Mettre à jour les données locales avec la réponse
      if (response.data) {
        setConnectedUser(response.data);
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        matchingPassword: ""
      });
      // Un seul message de succès en vert qui disparaît après 5 secondes
      setUpdateSuccess(true);
      setUpdateError("Votre mot de passe a été mis à jour avec succès ! Vous devrez utiliser ce nouveau mot de passe lors de votre prochaine connexion.");
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Faire disparaître le message après 3 secondes
      setTimeout(() => {
        setUpdateSuccess(false);
        setUpdateError("");
      }, 5000);

    } catch (error) {
      // Messages d'erreur plus spécifiques
      setUpdateSuccess(false);
      if (error.response?.status === 401) {
        setUpdateError("Le mot de passe actuel est incorrect");
      } else if (error.response?.data?.message) {
        setUpdateError(error.response.data.message);
      } else {
        setUpdateError("Une erreur est survenue lors de la mise à jour du mot de passe. Veuillez réessayer.");
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      try {
        await axios.delete(`users/delete?id=${connectedUser.userId}`);
        alert("Votre compte a été supprimé avec succès.");
        sessionStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/login";
      } catch (error) {
        setUpdateError("Erreur lors de la suppression du compte: " + error.message);
      }
    }
  };

  const handleDeleteReportedCat = async (catStatusId) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };
      // Utilisez l'URL de suppression correcte
      await axios.delete(`cat/delete?id=${catStatusId}`, { headers });
      setReportedCats(prevCats => prevCats.filter(cat => cat.catStatusId !== catStatusId));
      alert("Chat signalé supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression du chat signalé:", error);
      alert("Erreur lors de la suppression du chat signalé.");
    }
  };

  const handleEditReportedCat = async (catStatusId, updatedData) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };

      // Trouver le chat dans l'état actuel
      const currentCat = reportedCats.find(cat => cat.catStatusId === catStatusId);
      if (!currentCat) {
        throw new Error("Chat non trouvé");
      }

      // Créer le CatDTO avec toutes les informations existantes
      const catDTO = {
        catId: currentCat.cat.catId,
        name: updatedData.name,
        color: currentCat.cat.color,
        eyeColor: currentCat.cat.eyeColor,
        breed: currentCat.cat.breed,
        furType: currentCat.cat.furType,
        gender: currentCat.cat.gender,
        chipNumber: currentCat.cat.chipNumber,
        type: currentCat.cat.type,
        dateOfBirth: currentCat.cat.dateOfBirth,
        comment: currentCat.cat.comment,
        imageCatData: currentCat.cat.imageCatData // Ajout de l'image
      };

      // Mettre à jour le chat
      await axios.put(`cat/update`, catDTO, { headers });

      // Créer le CatStatusDTO pour la mise à jour du statut
      const catStatusDTO = {
        catStatusId: catStatusId,
        statusCat: updatedData.statusCat,
        comment: updatedData.comment,
        cat: {
          catId: currentCat.cat.catId
        }
      };

      // Mettre à jour le statut du chat
      await axios.put(`cat/updateStatus`, catStatusDTO, { headers });
      
      // Mettre à jour l'état local
      setReportedCats(prevCats => prevCats.map(cat => 
        cat.catStatusId === catStatusId 
          ? { 
              ...cat,
              cat: { ...cat.cat, name: updatedData.name },
              statusCat: updatedData.statusCat,
              comment: updatedData.comment
            }
          : cat
      ));
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la modification du chat:", error);
      setUpdateError("Erreur lors de la modification du chat: " + error.message);
      setTimeout(() => setUpdateError(""), 3000);
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    let cleaned = ("" + phoneNumber).replace(/\D/g, "");
    return cleaned.startsWith("32") ? "+" + cleaned : "+32" + cleaned;
  };

  if (authLoading || loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );
  }

  if (!connectedUser) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Vous devez être connecté pour accéder à cette page
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-5 bg-light">
      {updateSuccess && updateError && (
        <Row className="justify-content-center mb-4">
          <Col md={8}>
            <Alert variant="success" onClose={() => setUpdateSuccess(false)} dismissible>
              {updateError}
            </Alert>
          </Col>
        </Row>
      )}
      
      {updateSuccess === false && updateError && (
        <Row className="justify-content-center mb-4">
          <Col md={8}>
            <Alert variant="danger" onClose={() => setUpdateError("")} dismissible>
              {updateError}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="justify-content-center">
        <Col md={4} lg={3} className="mb-4">
          <Card className="shadow-sm sticky-top" style={{ top: "2rem" }}>
            <Card.Body className="text-center">
              <div
                className="profile-avatar mb-4"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "40px",
                  margin: "0 auto",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {connectedUser.firstName.charAt(0)}
                {connectedUser.lastName.charAt(0)}
              </div>
              <Card.Title className="mb-3">
                {connectedUser.firstName} {connectedUser.lastName}
              </Card.Title>
              <Card.Text className="text-muted mb-4">Particulier</Card.Text>
              
              <Nav variant="pills" className="flex-column mb-4">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "profile"}
                    onClick={() => setActiveTab("profile")}
                    className="text-start mb-2"
                  >
                    <FaUser className="me-2" />
                    Profil
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "security"}
                    onClick={() => setActiveTab("security")}
                    className="text-start mb-2"
                  >
                    <FaLock className="me-2" />
                    Sécurité
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "history"}
                    onClick={() => setActiveTab("history")}
                    className="text-start"
                  >
                    <FaHistory className="me-2" />
                    Historique
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === "reported"}
                    onClick={() => setActiveTab("reported")}
                    className="text-start"
                  >
                    <FaPaw className="me-2" />
                    Chats Signalés
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Button
                variant="outline-danger"
                size="sm"
                className="w-100 mt-3"
                onClick={handleDeleteAccount}
                style={{
                  color: '#dc3545',
                  borderColor: '#dc3545',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc3545';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#dc3545';
                }}
              >
                <FaTrash className="me-2" />
                Supprimer mon compte
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8} lg={7}>
          <Tab.Content>
            <Tab.Pane active={activeTab === "profile"}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <Card.Title className="mb-4">
                    <FaUser className="me-2" />
                    Informations personnelles
                  </Card.Title>
                  <Form onSubmit={handleUpdateProfile}>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="formEmail">
                          <Form.Label className="text-muted">
                            <FaEnvelope className="me-2" />
                            Email
                          </Form.Label>
                          <Form.Control
                            type="email"
                            defaultValue={connectedUser.email}
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="formPhone">
                          <Form.Label className="text-muted">
                            <FaPhone className="me-2" />
                            Téléphone
                          </Form.Label>
                          <Form.Control
                            type="text"
                            defaultValue={formatPhoneNumber(connectedUser.phone)}
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="firstName">
                          <Form.Label>Prénom</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="border-0 shadow-sm"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="lastName">
                          <Form.Label>Nom</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="border-0 shadow-sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="address">
                      <Form.Label className="text-muted">
                        <FaMapMarkerAlt className="me-2" />
                        Adresse
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        className="border-0 shadow-sm"
                      />
                    </Form.Group>

                    <Row className="mb-4">
                      <Col md={6}>
                        <Form.Group controlId="gender">
                          <Form.Label className="text-muted">
                            <FaVenusMars className="me-2" />
                            Genre
                          </Form.Label>
                          <Form.Select
                            value={formData.gender}
                            onChange={handleChange}
                            className="border-0 shadow-sm"
                          >
                            <option>Homme</option>
                            <option>Femme</option>
                            <option>Autre</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="birthDay">
                          <Form.Label className="text-muted">
                            <FaBirthdayCake className="me-2" />
                            Date de naissance
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.birthDay}
                            onChange={handleChange}
                            className="border-0 shadow-sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="rounded-pill"
                      >
                        Mettre à jour le profil
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Tab.Pane>

            <Tab.Pane active={activeTab === "security"}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="mb-4">
                    <FaLock className="me-2" />
                    Modifier le mot de passe
                  </Card.Title>
                  <Form onSubmit={handleUpdatePassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mot de passe actuel</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showCurrentPassword ? "text" : "password"}
                          id="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Nouveau mot de passe</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showNewPassword ? "text" : "password"}
                          id="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showMatchingPassword ? "text" : "password"}
                          id="matchingPassword"
                          value={passwordForm.matchingPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowMatchingPassword(!showMatchingPassword)}
                        >
                          {showMatchingPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        variant="outline-primary"
                        type="submit"
                        size="lg"
                        className="rounded-pill"
                      >
                        Mettre à jour le mot de passe
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Tab.Pane>

            <Tab.Pane active={activeTab === "reported"}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <Card.Title className="mb-4">
                    <FaPaw className="me-2" />
                    Chats Signalés
                  </Card.Title>
              <ReportedCats 
                reportedCats={reportedCats} 
                onDelete={handleDeleteReportedCat}
                onEdit={handleEditReportedCat}
              />
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;