import React from 'react';
import { Card, Nav, Button } from 'react-bootstrap';
import { FaUser, FaPaw, FaLock, FaHistory, FaTrash } from 'react-icons/fa';

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
              className="text-start mb-2"
            >
              <FaPaw className="me-2" />
              Chats Signalés
              {/* voir pourquoi chats signalés ce trouve la et pas dans reportedCats */}
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
  );
};

export default ProfileSidebar;
