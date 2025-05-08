import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Tab,
} from "react-bootstrap";
import { useAuth } from "../../contexts/AuthProvider";
import { useUserContext } from "../../contexts/UserContext";
import { useCatsContext } from "../../contexts/CatsContext";
import { FaUser, FaPaw, FaLock, FaHistory, FaLink } from "react-icons/fa";
import ReportedCats from "../../components/profile/ReportedCats";
import OwnedCats from "../../components/profile/OwnedCats";
import CatDetails from "../../components/profile/CatDetails";
import PersonalInfo from "../../components/profile/PersonalInfo";
import SecuritySettings from "../../components/profile/SecuritySettings";
import OrderHistory from "../../components/profile/OrderHistory";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import PendingLinkRequests from "../../components/profile/PendingLinkRequests";

const ProfilePage = () => {
  const { loading: authLoading, userData: connectedUser } = useAuth();
  const {
    reportedCats,
    ownedCats,
    loading: catsLoading,
    handleDeleteReportedCat,
    handleEditReportedCat,
    handleEditOwnedCat,
    handleDeleteOwnedCat,
    handleReportCatAsLost,
    successMessage,
    fetchCats,
  } = useCatsContext();

  // Utiliser le UserContext pour la gestion du profil
  const {
    profileData,
    setProfileData,
    passwordForm,
    setPasswordForm,
    orders,
    ordersLoading,
    loading,
    updateSuccess,
    updateError,
    updateProfile,
    updatePassword,
    deleteAccount,
    fetchOrders,
  } = useUserContext();

  const [activeTab, setActiveTab] = useState("profile");
  const [showCatDetails, setShowCatDetails] = useState(false);
  const [selectedCatStatus, setSelectedCatStatus] = useState(null);

  // Rafraîchir les données des chats lorsque le composant est monté
  useEffect(() => {
    // Rafraîchir les données des chats au chargement de la page
    fetchCats();
  }, [fetchCats]);

  // Charger les données appropriées lorsque l'onglet change
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "reported" || activeTab === "ownedCats") {
      // Rafraîchir les données des chats lorsque l'utilisateur accède aux onglets de chats
      fetchCats();
    }
  }, [activeTab, fetchOrders, fetchCats]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await updateProfile(profileData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    await updatePassword(passwordForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
      )
    ) {
      const success = await deleteAccount();
      if (success) {
        window.location.href = "/login";
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
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
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
        <Alert variant="warning">
          Veuillez vous connecter pour accéder à votre profil.
        </Alert>
      ) : (
        <>
          {updateError && (
            <Alert variant={updateSuccess ? "success" : "danger"}>
              {updateError}
            </Alert>
          )}

          <Tab.Container
            id="profile-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
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
                          formData={profileData}
                          setFormData={setProfileData}
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
