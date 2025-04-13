import React from 'react';
import { Modal, Row, Col, Badge, Card, Button } from 'react-bootstrap';
import { FaPaw, FaBirthdayCake, FaCalendarAlt, FaInfoCircle, FaComments, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { formatEnumValue } from "../../utils/enumUtils";

function CatDetails({ selectedCatStatus, handleClose, show }) {
  // Utilisation de la fonction formatEnumValue centralisée

  if (!selectedCatStatus || !selectedCatStatus.cat) {
    return null;
  }

  const cat = selectedCatStatus.cat;
  const isLostCat = selectedCatStatus.statusCat === 'LOST';
  const isFoundCat = selectedCatStatus.statusCat === 'FOUND';
  
  // Déterminer les informations de contact en fonction du type de chat
  const getUserContactInfo = () => {
    // Pour les chats trouvés, l'info utilisateur est dans selectedCatStatus.user
    if (isFoundCat && selectedCatStatus.user) {
      return {
        phone: selectedCatStatus.user.phone || "+32 484 934 747",
        email: selectedCatStatus.user.email || "contact@example.com"
      };
    }
    
    // Pour les chats perdus, l'info utilisateur est dans cat.user (le propriétaire)
    if (isLostCat) {
      // Essayer d'abord cat.user
      if (cat.user) {
        return {
          phone: cat.user.phone || "+32 484 934 747",
          email: cat.user.email || "contact@example.com"
        };
      }
      
      // Essayer ensuite selectedCatStatus.user
      if (selectedCatStatus.user) {
        return {
          phone: selectedCatStatus.user.phone || "+32 484 934 747",
          email: selectedCatStatus.user.email || "contact@example.com"
        };
      }
      
      // Essayer selectedCatStatus.owner
      if (selectedCatStatus.owner) {
        return {
          phone: selectedCatStatus.owner.phone || "+32 484 934 747",
          email: selectedCatStatus.owner.email || "contact@example.com"
        };
      }
      
      // Essayer directement dans selectedCatStatus
      if (selectedCatStatus.phone || selectedCatStatus.email) {
        return {
          phone: selectedCatStatus.phone || "+32 484 934 747",
          email: selectedCatStatus.email || "contact@example.com"
        };
      }
    }
    
    // Valeurs par défaut si aucune info n'est trouvée
    console.log("Aucune information de contact trouvée, utilisation des valeurs par défaut");
    return {
      phone: "+32 484 934 747",
      email: "contact@example.com"
    };
  };
  
  const contactInfo = getUserContactInfo();

  // Fonction pour ouvrir le client email par défaut
  const handleEmailContact = () => {
    const subject = isFoundCat 
      ? `À propos de votre chat trouvé: ${cat.name || "Sans nom"}`
      : `À propos de votre chat perdu: ${cat.name || "Sans nom"}`;
    
    const body = isFoundCat
      ? `Bonjour,\n\nJ'ai vu votre annonce concernant un chat trouvé et je pense qu'il pourrait s'agir du mien.\n\nCordialement,`
      : `Bonjour,\n\nJ'ai vu votre annonce concernant un chat perdu et je pense avoir vu un chat qui lui ressemble.\n\nCordialement,`;
    
    window.location.href = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Inconnue";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <FaPaw className="me-2" style={{ color: '#8B4513' }} />
          {isFoundCat ? "Chat trouvé" : "Chat perdu"}: {cat.name || "Sans nom"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="position-relative">
          <img
            src={`data:${cat.type};base64,${cat.imageCatData}`}
            alt={cat.name}
            className="w-100"
            style={{ height: "300px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "/images/noImageCat.png";
              e.target.onerror = null;
            }}
          />
          <div 
            className="position-absolute bottom-0 start-0 w-100 p-3"
            style={{ 
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: 'white'
            }}
          >
            <h3 className="mb-0">{cat.name || "Chat sans nom"}</h3>
            <div className="d-flex align-items-center mt-1">
              <Badge
                bg={cat.gender === "Mâle" ? "primary" : "danger"}
                className="me-2"
              >
                {formatEnumValue(cat.gender)}
              </Badge>
              <small>Race: {formatEnumValue(cat.breed) || "Inconnue"}</small>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">
                    <FaInfoCircle className="me-2" style={{ color: '#8B4513' }} />
                    Informations générales
                  </h5>
                  <Row className="g-3">
                    <Col xs={12}>
                      <div className="d-flex align-items-center">
                        <FaBirthdayCake className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">Date de naissance</div>
                          <div className="fw-semibold">
                            {formatDate(cat.dateOfBirth)}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{ width: '16px', height: '16px', backgroundColor: cat.color || '#ccc', borderRadius: '50%' }}></div>
                        <div>
                          <div className="text-muted small">Couleur</div>
                          <div className="fw-semibold">
                            {formatEnumValue(cat.color) || "Inconnue"}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{ width: '16px', height: '16px', backgroundColor: cat.eyeColor || '#ccc', borderRadius: '50%' }}></div>
                        <div>
                          <div className="text-muted small">Couleur des yeux</div>
                          <div className="fw-semibold">
                            {formatEnumValue(cat.eyeColor) || "Inconnue"}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="d-flex align-items-center">
                        <FaPaw className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">Pelage</div>
                          <div className="fw-semibold">
                            {formatEnumValue(cat.furType) || "Inconnu"}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">
                    <FaCalendarAlt className="me-2" style={{ color: '#8B4513' }} />
                    Statut
                  </h5>
                  <Row className="g-3">
                    <Col xs={12}>
                      <div className="d-flex align-items-center">
                        <FaCalendarAlt className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">
                            {isFoundCat ? "Trouvé le" : "Perdu le"}
                          </div>
                          <div className="fw-semibold">
                            {formatDate(selectedCatStatus.reportDate)}
                          </div>
                        </div>
                      </div>
                    </Col>
                    {selectedCatStatus.location && (
                      <Col xs={12}>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2" style={{ color: '#8B4513' }} />
                          <div>
                            <div className="text-muted small">Localisation</div>
                            <div className="fw-semibold">
                              {selectedCatStatus.location.address || 
                                `${selectedCatStatus.location.city || ''} ${selectedCatStatus.location.postalCode || ''}`}
                            </div>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {selectedCatStatus.cat.comment && (
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">
                  <FaComments className="me-2" style={{ color: '#8B4513' }} />
                  Description
                </h5>
                <p className="mb-0">{selectedCatStatus.cat.comment}</p>
              </Card.Body>
            </Card>
          )}

          {(isFoundCat || isLostCat) && (
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">
                  <FaInfoCircle className="me-2" style={{ color: '#8B4513' }} />
                  Contact
                </h5>
                <p className="mb-3">
                  {isFoundCat 
                    ? "Vous avez perdu un chat qui pourrait correspondre à cette description? Contactez la personne qui l'a trouvé:"
                    : "Vous avez vu ce chat perdu? Contactez son propriétaire:"}
                </p>
                
                <Row className="g-3 mb-3">
                  {/* Afficher le numéro de téléphone */}
                  <Col xs={12} md={6}>
                    <div className="d-flex align-items-center">
                      <FaPhone className="me-2" style={{ color: '#8B4513' }} />
                      <div>
                        <div className="text-muted small">Téléphone</div>
                        <div className="fw-semibold">
                          {contactInfo.phone}
                        </div>
                      </div>
                    </div>
                  </Col>
                  
                  {/* Afficher l'email avec un bouton pour envoyer un message */}
                  <Col xs={12} md={6}>
                    <div className="d-flex align-items-center">
                      <FaEnvelope className="me-2" style={{ color: '#8B4513' }} />
                      <div>
                        <div className="text-muted small">Email</div>
                        <div className="fw-semibold">
                          {contactInfo.email}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={handleEmailContact}
                >
                  <FaEnvelope className="me-2" />
                  Envoyer un email
                </Button>
              </Card.Body>
            </Card>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CatDetails;