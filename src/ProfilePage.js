import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, Nav, Tab } from "react-bootstrap";
import { useAxios } from "./hooks/useAxios";
import { useAuth } from "./hooks/authProvider";
import { FaUser, FaPaw, FaLock, FaHistory, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import ReportedCats from './ReportedCats';
import OwnedCats from './components/profile/OwnedCats';
import CatDetails from './CatDetails';
import PersonalInfo from './components/profile/PersonalInfo';
import SecuritySettings from './components/profile/SecuritySettings';

const ProfilePage = () => {
  const axios = useAxios();
  const { loading: authLoading, setIsLoggedIn, fetchUserData } = useAuth();
  const [connectedUser, setConnectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [reportedCats, setReportedCats] = useState([]);
  const [ownedCats, setOwnedCats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showCatDetails, setShowCatDetails] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);

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
          setReportedCats(reportedResponse || []); 
        } catch (error) {
          // Ne pas afficher d'erreur si aucun chat n'est trouvé
          setReportedCats([]);
        }

        // Fetch owned cats
        try {
          const ownedResponse = await axios.get("cat/ownedCats", { headers });
          setOwnedCats(ownedResponse || []);
        } catch (error) {
          setOwnedCats([]);
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

  // Fonction pour récupérer les commandes
  const fetchOrders = async () => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      try {
        const response = await axios.get('/ecommerce/orders');
        setOrders(response);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError("");
    
    try {
      const response = await axios.put("users/update", formData);
      // Mettre à jour les données locales et globales
      setConnectedUser(response);
      await fetchUserData();
      
      setUpdateSuccess(true);
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

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError("");

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
      
      if (response.data) {
        setConnectedUser(response.data);
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        matchingPassword: ""
      });

      setUpdateSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        setUpdateSuccess(false);
        setUpdateError("");
      }, 5000);

    } catch (error) {
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

  const handleDeleteOwnedCat = async (catId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chat ?")) {
      try {
        await axios.delete(`cat/delete?id=${catId}`);
        setOwnedCats(prevCats => prevCats.filter(cat => cat.cat.catId !== catId));
        alert("Chat supprimé avec succès.");
      } catch (error) {
        console.error("Erreur lors de la suppression du chat:", error);
        alert("Erreur lors de la suppression du chat.");
      }
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    let cleaned = ("" + phoneNumber).replace(/\D/g, "");
    return cleaned.startsWith("32") ? "+" + cleaned : "+32" + cleaned;
  };

  const handleCloseCatDetails = () => setShowCatDetails(false);
  const handleShowCatDetails = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShowCatDetails(true);
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
    <Container className="mt-4">
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : !connectedUser ? (
        <Alert variant="warning">Veuillez vous connecter pour accéder à votre profil.</Alert>
      ) : (
        <>
          {updateError && <Alert variant={updateSuccess ? "success" : "danger"}>{updateError}</Alert>}
          
          <Tab.Container id="profile-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
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
                          active={activeTab === "orders"}
                          onClick={() => setActiveTab("orders")}
                          className="text-start mb-2"
                        >
                          <FaHistory className="me-2" />
                          Historique des commandes
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
                      <Nav.Item>
                        <Nav.Link 
                          active={activeTab === "ownedCats"}
                          onClick={() => setActiveTab("ownedCats")}
                          className="text-start"
                        >
                          <FaPaw className="me-2" />
                          Mes chats
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
                        <PersonalInfo 
                          formData={formData}
                          setFormData={setFormData}
                          handleSubmit={handleUpdateProfile}
                          updateSuccess={updateSuccess}
                          updateError={updateError}
                        />
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
                        <SecuritySettings
                          passwordForm={passwordForm}
                          setPasswordForm={setPasswordForm}
                          handleSubmit={handleUpdatePassword}
                          updateSuccess={updateSuccess}
                          updateError={updateError}
                        />
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane active={activeTab === "orders"}>
                    <Card className="shadow-sm mb-4">
                      <Card.Body>
                        <Card.Title className="mb-4">
                          <h5 className="mb-0">Historique des commandes</h5>
                        </Card.Title>
                        {ordersLoading ? (
                          <div className="text-center">
                            <Spinner animation="border" />
                          </div>
                        ) : orders.length === 0 ? (
                          <Alert variant="info">
                            Vous n'avez pas encore passé de commande.
                          </Alert>
                        ) : (
                          <div className="orders-list">
                            {orders.map((order) => (
                              <Card key={order.id} className="mb-3">
                                <Card.Header>
                                  <strong>Commande #{order.id}</strong>
                                  <span className="float-end">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                  </span>
                                </Card.Header>
                                <Card.Body>
                                  <div className="order-items">
                                    {order.orderItems.map((item, index) => (
                                      <div key={index} className="d-flex justify-content-between mb-2">
                                        <span>{item.product.name} x{item.quantity}</span>
                                        <span>{item.product.price.toFixed(2)} €</span>
                                      </div>
                                    ))}
                                  </div>
                                  <hr />
                                  <div className="d-flex justify-content-between">
                                    <strong>Statut:</strong>
                                    <span className={`badge bg-${order.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                                      {order.status === 'COMPLETED' ? 'Payée' : 'En attente'}
                                    </span>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        )}
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

                  <Tab.Pane active={activeTab === "ownedCats"}>
                    <Card className="shadow-sm mb-4">
                      <Card.Body>
                        <OwnedCats 
                          ownedCats={ownedCats}
                          onShowCatDetails={handleShowCatDetails}
                          onDeleteCat={handleDeleteOwnedCat}
                        />
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>

          <CatDetails
            selectedCatStatus={selectedCatStatus}
            handleClose={handleCloseCatDetails}
            show={showCatDetails}
          />
        </>
      )}
    </Container>
  );
};

export default ProfilePage;