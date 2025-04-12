import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { FaUser, FaPaw, FaLock, FaHistory, FaLink } from 'react-icons/fa';

const ProfileSidebar = ({
  connectedUser,
  activeTab,
  setActiveTab,
  handleDeleteAccount
}) => {
  return (
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
        
        <ListGroup variant="flush">
          <ListGroup.Item 
            action 
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            className="d-flex align-items-center"
          >
            <FaUser className="me-3" />
            <span>Profil</span>
          </ListGroup.Item>
          <ListGroup.Item 
            action 
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            className="d-flex align-items-center"
          >
            <FaLock className="me-3" />
            <span>Sécurité</span>
          </ListGroup.Item>
          <ListGroup.Item 
            action 
            active={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            className="d-flex align-items-center"
          >
            <FaHistory className="me-3" />
            <span>Historique des commandes</span>
          </ListGroup.Item>
          <ListGroup.Item 
            action 
            active={activeTab === "reported"}
            onClick={() => setActiveTab("reported")}
            className="d-flex align-items-center"
          >
            <FaPaw className="me-3" />
            <span>Chats Signalés</span>
          </ListGroup.Item>
          <ListGroup.Item 
            action 
            active={activeTab === "ownedCats"}
            onClick={() => setActiveTab("ownedCats")}
            className="d-flex align-items-center"
          >
            <FaPaw className="me-3" />
            <span>Mes chats</span>
          </ListGroup.Item>
          <ListGroup.Item 
            action 
            active={activeTab === "pendingLinks"}
            onClick={() => setActiveTab("pendingLinks")}
            className="d-flex align-items-center"
          >
            <FaLink className="me-3" />
            <span>Demandes de liaison</span>
          </ListGroup.Item>
        </ListGroup>

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
          Supprimer mon compte
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProfileSidebar;
