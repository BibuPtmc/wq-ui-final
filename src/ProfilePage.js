import React, { useState, useEffect } from "react";
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

const ProfilePage = () => {
  const axios = useAxios();
  const { loading: authLoading, setIsLoggedIn } = useAuth();
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

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showMatchingPassword, setShowMatchingPassword] = useState(false);

  useEffect(() => {
    if (loading) {
      fetchUserData();
    }
  }, [axios, loading]);

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

      try {
        const reportedResponse = await axios.get("cat/reportedCats", { headers });
        setReportedCats(reportedResponse || []);
      } catch (error) {
        setReportedCats([]);
      }

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

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await axios.get('/ecommerce/orders');
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError("");
    
    try {
      const response = await axios.put("users/update", formData);
      setConnectedUser(response);
      setUpdateSuccess(true);
      setUpdateError("Profil mis à jour avec succès !");
      window.scrollTo({ top: 0, behavior: 'smooth' });

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
      setUpdateError("Votre mot de passe a été mis à jour avec succès !");
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
        setUpdateError("Une erreur est survenue lors de la mise à jour du mot de passe");
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
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la modification du chat:", error);
      setUpdateError("Erreur lors de la modification du chat: " + error.message);
      setTimeout(() => setUpdateError(""), 3000);
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
        alert("Chat supprimé avec succès.");
      } catch (error) {
        console.error("Erreur lors de la suppression du chat:", error);
        alert("Erreur lors de la suppression du chat.");
      }
    }
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
                      connectedUser={connectedUser}
                      formData={formData}
                      handleChange={handleChange}
                      handleUpdateProfile={handleUpdateProfile}
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