import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Tab } from "react-bootstrap";
import { useAxios } from "../../hooks/useAxios";
import { useAuth } from "../../hooks/authProvider";
import { useCats } from '../../hooks/useCats';
import { FaUser, FaPaw, FaLock, FaHistory, FaLink } from 'react-icons/fa';
import ReportedCats from '../../components/profile/ReportedCats';
import OwnedCats from '../../components/profile/OwnedCats';
import CatDetails from '../../components/profile/CatDetails';
import PersonalInfo from '../../components/profile/PersonalInfo';
import SecuritySettings from '../../components/profile/SecuritySettings';
import OrderHistory from '../../components/profile/OrderHistory';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import PendingLinkRequests from '../../components/profile/PendingLinkRequests';

const ProfilePage = () => {
  const axios = useAxios();
  const { loading: authLoading, setIsLoggedIn, fetchUserData } = useAuth();
  const { 
    reportedCats, 
    ownedCats, 
    loading: catsLoading,
    handleDeleteReportedCat,
    handleEditReportedCat,
    handleEditOwnedCat,
    handleDeleteOwnedCat,
    handleReportCatAsLost,
    successMessage
  } = useCats();
  
  const [connectedUser, setConnectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showCatDetails, setShowCatDetails] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);

  // State pour le formulaire de mise à jour
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    latitude: null,
    longitude: null,
    gender: "",
    birthDay: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    matchingPassword: ""
  });

  // État pour suivre si les commandes ont déjà été chargées
  const [ordersLoaded, setOrdersLoaded] = useState(false);

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
          address: response.address?.address || "",
          city: response.address?.city || "",
          postalCode: response.address?.postalCode || "",
          latitude: response.address?.latitude || null,
          longitude: response.address?.longitude || null,
          gender: response.gender || "",
          birthDay: response.birthDay || "",
          phone: response.phone || "",
        });
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
  const fetchOrders = useCallback(async () => {
    // Ne charger les commandes que si l'onglet est actif et qu'elles n'ont pas déjà été chargées
    if (activeTab === 'orders' && !ordersLoaded) {
      setOrdersLoading(true);
      try {
        const response = await axios.get('/ecommerce/orders');
        setOrders(response);
        // Marquer les commandes comme chargées
        setOrdersLoaded(true);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Marquer comme chargé même en cas d'erreur pour éviter les boucles
        setOrdersLoaded(true);
      } finally {
        setOrdersLoading(false);
      }
    }
  }, [activeTab, axios, ordersLoaded]);

  // Réinitialiser l'état lorsque l'onglet change
  useEffect(() => {
    if (activeTab !== 'orders') {
      setOrdersLoaded(false);
    }
  }, [activeTab]);

  // Charger les commandes lorsque nécessaire
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError("");
    
    // Vérification de la date de naissance
    if (formData.birthDay) {
      const selectedDate = new Date(formData.birthDay);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > currentDate) {
        setUpdateError("La date de naissance ne peut pas être dans le futur");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    // Validation du numéro de téléphone si présent
    if (formData.phone) {
      const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,4}[- ]?\d{1,4}$/;
      if (!phoneRegex.test(formData.phone)) {
        setUpdateError("Le format du numéro de téléphone n'est pas valide");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
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

  const handleCloseCatDetails = () => setShowCatDetails(false);

  const handleShowCatDetails = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShowCatDetails(true);
  };

  if (authLoading || loading || catsLoading) {
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
                <ProfileSidebar
                  connectedUser={connectedUser}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  handleDeleteAccount={handleDeleteAccount}
                />
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
                          <FaHistory className="me-2" />
                          Historique des commandes
                        </Card.Title>
                        <OrderHistory 
                          orders={orders}
                          ordersLoading={ordersLoading}
                        />
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
                          onCatClick={(cat) => {
                            setSelectedCatStatus(cat);
                            setShowCatDetails(true);
                          }}
                          onDelete={handleDeleteReportedCat}
                          onEdit={handleEditReportedCat}
                          successMessage={successMessage}
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
                          onEditCat={handleEditOwnedCat}
                          onReportAsLost={handleReportCatAsLost}
                          successMessage={successMessage}
                        />
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                  
                  <Tab.Pane active={activeTab === "pendingLinks"}>
                    <Card className="shadow-sm mb-4">
                      <Card.Body>
                        <Card.Title className="mb-4">
                          <FaLink className="me-2" />
                          Demandes de liaison en attente
                        </Card.Title>
                        <PendingLinkRequests />
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