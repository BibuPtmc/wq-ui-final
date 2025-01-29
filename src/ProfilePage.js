import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Tab } from "react-bootstrap";
import { useAxios } from "./hooks/useAxios";
import { useAuth } from "./hooks/authProvider";
import { FaUser, FaPaw, FaLock } from 'react-icons/fa';
import ReportedCats from './ReportedCats';
import CatDetails from './CatDetails';
import PersonalInfo from './components/profile/PersonalInfo';
import SecuritySettings from './components/profile/SecuritySettings';
import OrderHistory from './components/profile/OrderHistory';
import OwnedCats from './components/profile/OwnedCats';
import ProfileSidebar from './components/profile/ProfileSidebar';

const ALERT_TIMEOUT = 5000;

const ProfilePage = () => {
  const axios = useAxios();
  const { loading: authLoading, setIsLoggedIn } = useAuth();
  const [connectedUser, setConnectedUser] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    profile: false,
    password: false,
    deleteAccount: false,
    userData: true,
    reportedCats: true,
    ownedCats: true,
    orders: true
  });
  const [alert, setAlert] = useState({ show: false, message: "", variant: "info" });
  const [activeTab, setActiveTab] = useState("profile");
  const [reportedCats, setReportedCats] = useState([]);
  const [ownedCats, setOwnedCats] = useState([]);
  const [orders, setOrders] = useState([]);
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

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showMatchingPassword, setShowMatchingPassword] = useState(false);

  const setLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const showAlert = useCallback((message, variant = "info") => {
    setAlert({ show: true, message, variant });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlert({ show: false, message: "", variant: "info" }), ALERT_TIMEOUT);
  }, []);

  const handleError = useCallback((error, defaultMessage) => {
    const errorMessage = error.response?.data?.message || defaultMessage;
    showAlert(errorMessage, "danger");
  }, [showAlert]);

  const fetchUserData = useCallback(async () => {
    if (!sessionStorage.getItem("token")) {
      setLoading('userData', false);
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

      try {
        const reportedResponse = await axios.get("cat/reportedCats", { headers });
        setReportedCats(reportedResponse || []);
        setLoading('reportedCats', false);
      } catch (error) {
        setReportedCats([]);
        setLoading('reportedCats', false);
      }

      try {
        const ownedResponse = await axios.get("cat/ownedCats", { headers });
        setOwnedCats(ownedResponse || []);
        setLoading('ownedCats', false);
      } catch (error) {
        setOwnedCats([]);
        setLoading('ownedCats', false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showAlert("Erreur lors du chargement des données utilisateur", "danger");
    } finally {
      setLoading('userData', false);
    }
  }, [axios, setLoading, setConnectedUser, setFormData, setReportedCats, setOwnedCats, showAlert]);

  const fetchOrders = useCallback(async () => {
    setLoading('orders', true);
    try {
      const response = await axios.get('/ecommerce/orders');
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showAlert("Erreur lors du chargement des commandes", "danger");
    } finally {
      setLoading('orders', false);
    }
  }, [axios, setLoading, setOrders, showAlert]);

  useEffect(() => {
    if (loadingStates.userData) {
      fetchUserData();
    }
  }, [loadingStates.userData, fetchUserData]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading('profile', true);
    
    try {
      const response = await axios.put("users/update", formData);
      setConnectedUser(response);
      showAlert("Profil mis à jour avec succès !", "success");
    } catch (error) {
      handleError(error, "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading('profile', false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.id]: e.target.value });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading('password', true);

    if (passwordForm.newPassword !== passwordForm.matchingPassword) {
      showAlert("Les nouveaux mots de passe ne correspondent pas", "danger");
      setLoading('password', false);
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

      showAlert("Votre mot de passe a été mis à jour avec succès !", "success");
    } catch (error) {
      if (error.response?.status === 401) {
        showAlert("Le mot de passe actuel est incorrect", "danger");
      } else {
        handleError(error, "Une erreur est survenue lors de la mise à jour du mot de passe");
      }
    } finally {
      setLoading('password', false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      setLoading('deleteAccount', true);
      try {
        await axios.delete(`users/delete?id=${connectedUser.userId}`);
        showAlert("Votre compte a été supprimé avec succès.", "success");
        sessionStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/login";
      } catch (error) {
        handleError(error, "Erreur lors de la suppression du compte");
      } finally {
        setLoading('deleteAccount', false);
      }
    }
  };

  const handleDeleteReportedCat = async (catStatusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chat ? Cette action est irréversible.")) {
      try {
        const headers = {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        };
        await axios.delete(`cat/delete?id=${catStatusId}`, { headers });
        setReportedCats(prevCats => prevCats.filter(cat => cat.catStatusId !== catStatusId));
        showAlert("Chat signalé supprimé avec succès.", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression du chat signalé:", error);
        handleError(error, "Erreur lors de la suppression du chat signalé");
      }
    }
  };

  const handleEditReportedCat = async (catStatusId, updatedData) => {
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      };

      const currentCat = reportedCats.find(cat => cat.catStatusId === catStatusId);
      if (!currentCat) {
        throw new Error("Chat non trouvé");
      }

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
        imageCatData: currentCat.cat.imageCatData
      };

      await axios.put(`cat/update`, catDTO, { headers });

      const catStatusDTO = {
        catStatusId: catStatusId,
        statusCat: updatedData.statusCat,
        comment: updatedData.comment,
        cat: {
          catId: currentCat.cat.catId
        }
      };

      await axios.put(`cat/updateStatus`, catStatusDTO, { headers });
      
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
      
      showAlert("Chat signalé mis à jour avec succès !", "success");
    } catch (error) {
      console.error("Erreur lors de la modification du chat:", error);
      showAlert("Erreur lors de la modification du chat", "danger");
    }
  };

  const handleDeleteOwnedCat = async (catStatusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chat ? Cette action est irréversible.")) {
      try {
        const headers = {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        };
        await axios.delete(`cat/delete?id=${catStatusId}`, { headers });
        setOwnedCats(prevCats => prevCats.filter(cat => cat.catStatusId !== catStatusId));
        showAlert("Chat supprimé avec succès.", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression du chat:", error);
        handleError(error, "Erreur lors de la suppression du chat");
      }
    }
  };

  const handleCloseCatDetails = () => setShowCatDetails(false);
  const handleShowCatDetails = (catStatus) => {
    setSelectedCatStatus(catStatus);
    setShowCatDetails(true);
  };

  if (authLoading || loadingStates.userData || loadingStates.reportedCats || loadingStates.ownedCats) {
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
      {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
      
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
                      connectedUser={connectedUser}
                      formData={formData}
                      handleChange={handleChange}
                      handleUpdateProfile={handleUpdateProfile}
                      loading={loadingStates.profile}
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
                      handlePasswordChange={handlePasswordChange}
                      handleUpdatePassword={handleUpdatePassword}
                      showCurrentPassword={showCurrentPassword}
                      showNewPassword={showNewPassword}
                      showMatchingPassword={showMatchingPassword}
                      setShowCurrentPassword={setShowCurrentPassword}
                      setShowNewPassword={setShowNewPassword}
                      setShowMatchingPassword={setShowMatchingPassword}
                      loading={loadingStates.password}
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
                    <OrderHistory
                      orders={orders}
                      ordersLoading={loadingStates.orders}
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
                      onDelete={handleDeleteReportedCat}
                      onEdit={handleEditReportedCat}
                    />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane active={activeTab === "ownedCats"}>
                <Card className="shadow-sm mb-4">
                  <Card.Body>
                    <Card.Title className="mb-4">
                      <FaPaw className="me-2" />
                      Mes chats
                    </Card.Title>
                    <OwnedCats
                      ownedCats={ownedCats}
                      handleShowCatDetails={handleShowCatDetails}
                      handleDeleteOwnedCat={handleDeleteOwnedCat}
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
    </Container>
  );
};

export default ProfilePage;