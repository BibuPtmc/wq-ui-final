import React, { useEffect, useState } from 'react';
import { Modal, Row, Col, Badge, Card, Button, Carousel } from 'react-bootstrap';
import { FaPaw, FaBirthdayCake, FaCalendarAlt, FaInfoCircle, FaComments, FaMapMarkerAlt, FaEnvelope, FaPhone, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCatSearch } from '../../contexts/CatSearchContext';
import { useCatsContext } from '../../contexts/CatsContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/authProvider';

function CatDetails({ selectedCatStatus, handleClose, show, hideContactInfo=false }) {
  // Utiliser les fonctions du contexte
  const { formatValue, calculateAge } = useCatSearch();
  const { userAddress, reportedCats, ownedCats } = useCatsContext();
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useAuth();
  
  // État local pour stocker les données du chat sélectionné
  const [currentCatStatus, setCurrentCatStatus] = useState(selectedCatStatus);

  // Mettre à jour l'état local lorsque selectedCatStatus change
  useEffect(() => {
    if (selectedCatStatus) {
      setCurrentCatStatus(selectedCatStatus);
    }
  }, [selectedCatStatus]);

  // Rafraîchir les données du chat lorsque reportedCats ou ownedCats changent
  useEffect(() => {
    if (!currentCatStatus) return;
    
    // Vérifier si le chat est dans reportedCats
    const updatedReportedCat = reportedCats.find(cat => 
      cat.catStatusId === currentCatStatus.catStatusId
    );
    
    // Vérifier si le chat est dans ownedCats (si son statut a changé pour OWN)
    const updatedOwnedCat = ownedCats.find(cat => 
      cat.cat.catId === currentCatStatus.cat.catId
    );
    
    // Mettre à jour avec les données les plus récentes
    if (updatedReportedCat) {
      setCurrentCatStatus(updatedReportedCat);
    } else if (updatedOwnedCat) {
      setCurrentCatStatus(updatedOwnedCat);
    }
  }, [reportedCats, ownedCats, currentCatStatus]);

  if (!currentCatStatus || !currentCatStatus.cat) {
    return null;
  }

  const cat = currentCatStatus.cat;
  const isLostCat = currentCatStatus.statusCat === 'LOST';
  const isFoundCat = currentCatStatus.statusCat === 'FOUND';
  const isOwnedCat = currentCatStatus.statusCat === 'OWN';
  
  // Déterminer les informations de contact en fonction du type de chat
  const getUserContactInfo = () => {
    if (!isLoggedIn) {
      return null;
    }
    
    // Pour les chats trouvés, l'info utilisateur est dans currentCatStatus.user
    if (isFoundCat && currentCatStatus.user) {
      return {
        phone: currentCatStatus.user.phone || "+32 484 934 747",
        email: currentCatStatus.user.email || "contact@example.com"
      };
    }
    // Pour les chats perdus, l'info utilisateur est dans currentCatStatus.user
    if (isLostCat && currentCatStatus.user) {
      return {
        phone: currentCatStatus.user.phone || "+32 484 934 747",
        email: currentCatStatus.user.email || "contact@example.com"
      };
    }
    // Valeurs par défaut
    return {
      phone: "+32 484 934 747",
      email: "contact@example.com"
    };
  };
  
  const contactInfo = getUserContactInfo();

  // Fonction pour ouvrir le client email par défaut
  const handleEmailContact = () => {
    if (!isLoggedIn) {
      return;
    }
    
    const subject = isFoundCat 
      ? t('cat.emailSubjectFound', { name: cat.name || t('cat.noName', 'Sans nom') }, 'À propos de votre chat trouvé: {{name}}')
      : t('cat.emailSubjectLost', { name: cat.name || t('cat.noName', 'Sans nom') }, 'À propos de votre chat perdu: {{name}}');
    
    const body = isFoundCat
      ? t('cat.emailBodyFound', 'Bonjour,\n\nJ\'ai vu votre annonce concernant un chat trouvé et je pense qu\'il pourrait s\'agir du mien.\n\nCordialement,')
      : t('cat.emailBodyLost', 'Bonjour,\n\nJ\'ai vu votre annonce concernant un chat perdu et je pense avoir vu un chat qui lui ressemble.\n\nCordialement,');
    
    window.location.href = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return t('common.invalid', 'Inconnue');
    return new Date(dateString).toLocaleDateString(i18n.language, {
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
          {isFoundCat ? t('cat.found', 'Chat trouvé') : t('cat.lost', 'Chat perdu')}: {cat.name || t('cat.noName', 'Sans nom')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="position-relative">
          {/* Utiliser un carrousel pour afficher plusieurs images */}
          <Carousel 
            interval={5000} 
            indicators={true}
            prevIcon={<FaChevronLeft className="text-white fs-4" />}
            nextIcon={<FaChevronRight className="text-white fs-4" />}
          >
            {/* Logique d'affichage des images */}
            {(() => {
              // Collecter toutes les images valides
              const images = [];
              
              // Ajouter l'image principale si elle existe
              if (cat.imageUrl) {
                images.push({
                  url: cat.imageUrl,
                  alt: cat.name || 'Chat'
                });
              }
              
              // Ajouter les images supplémentaires si elles existent
              if (cat.imageUrls && cat.imageUrls.length > 0) {
                cat.imageUrls.forEach((url, index) => {
                  if (url) {
                    images.push({
                      url: url,
                      alt: `${cat.name || 'Chat'} #${index + 1}`
                    });
                  }
                });
              }
              
              // Si aucune image valide n'est trouvée, afficher l'image par défaut
              if (images.length === 0) {
                return (
                  <Carousel.Item>
                    <img
                      src="/noImageCat.png"
                      alt={t('cat.noImage', 'Aucune donnée')}
                      className="w-100"
                      style={{ height: "300px", objectFit: "cover" }}
                    />
                  </Carousel.Item>
                );
              }
              
              // Sinon, afficher toutes les images valides
              return images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-100"
                    style={{ height: "300px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "/noImageCat.png";
                      e.target.onerror = null;
                    }}
                  />
                </Carousel.Item>
              ));
            })()}
          </Carousel>
          
          {/* Overlay avec les informations du chat */}
          <div 
            className="position-absolute bottom-0 start-0 w-100 p-3"
            style={{ 
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: 'white',
              zIndex: 10 // S'assurer que l'overlay est au-dessus du carrousel
            }}
          >
            <h3 className="mb-0">{cat.name || t('cat.noName', 'Chat sans nom')}</h3>
            <div className="d-flex align-items-center mt-1">
              <Badge
                bg={cat.gender === t('cat.male', { defaultValue: 'Mâle' }) ? "primary" : "danger"}
                className="me-2"
              >
                {formatValue(cat.gender) || t('cat.unknownGender', 'Genre inconnu')}
              </Badge>
              <small>{t('cat.breed', 'Race')}: {formatValue(cat.breed) || t('common.unknown', 'Inconnue')}</small>
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
                    {t('cat.generalInfo', 'Informations générales')}
                  </h5>
                  <Row className="g-3">
                    <Col xs={12}>
                      <div className="d-flex align-items-center">
                        <FaBirthdayCake className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">{t('cat.birthDate', 'Date de naissance')}</div>
                          <div className="fw-semibold">
                            {formatDate(cat.dateOfBirth)}
                            {cat.dateOfBirth && ` (${t('cat.age', 'Âge')}: ${calculateAge(cat.dateOfBirth)})`}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{ width: '16px', height: '16px', backgroundColor: cat.color || '#ccc', borderRadius: '50%' }}></div>
                        <div>
                          <div className="text-muted small">{t('cat.color')}</div>
                          <div className="fw-semibold">
                            {formatValue(cat.color) || t('common.unknown')}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{ width: '16px', height: '16px', backgroundColor: cat.eyeColor || '#ccc', borderRadius: '50%' }}></div>
                        <div>
                          <div className="text-muted small">{t('cat.eyeColor')}</div>
                          <div className="fw-semibold">
                            {formatValue(cat.eyeColor) || t('common.unknown')}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="d-flex align-items-center">
                        <FaPaw className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">{t('cat.furType')}</div>
                          <div className="fw-semibold">
                            {formatValue(cat.furType) || t('common.unknown')}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <FaPaw className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">Vacciné</div>
                          <div className="fw-semibold">
                            {currentCatStatus.cat.vaccinated === true
                              ? 'Oui'
                              : currentCatStatus.cat.vaccinated === false
                                ? 'Non'
                                : 'Non spécifié'}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <FaPaw className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">Stérilisé</div>
                          <div className="fw-semibold">
                            {currentCatStatus.cat.sterilized === true
                              ? 'Oui'
                              : currentCatStatus.cat.sterilized === false
                                ? 'Non'
                                : 'Non spécifié'}
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
                    {t('cat.status')}
                  </h5>
                  <Row className="g-3">
                    <Col xs={12}>
                      <div className="d-flex align-items-center">
                        <FaCalendarAlt className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">
                            {isFoundCat ? t('cat.foundOn') : t('cat.lostOn')}
                          </div>
                          <div className="fw-semibold">
                            {formatDate(currentCatStatus.reportDate)}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2" style={{ color: '#8B4513' }} />
                        <div>
                          <div className="text-muted small">{t('cat.location')}</div>
                          <div className="fw-semibold">
                            {isOwnedCat && userAddress ? (
                              // Si le chat est possédé, afficher l'adresse de l'utilisateur
                              userAddress.address || `${userAddress.city || ''} ${userAddress.postalCode || ''}`
                            ) : currentCatStatus.location ? (
                              // Sinon, afficher l'adresse du chat
                              currentCatStatus.location.address || 
                              `${currentCatStatus.location.city || ''} ${currentCatStatus.location.postalCode || ''}`
                            ) : (
                              t('cat.addressNotAvailable')
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {currentCatStatus.cat.comment && (
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">
                  <FaComments className="me-2" style={{ color: '#8B4513' }} />
                  {t('cat.description')}
                </h5>
                <p className="mb-0">{currentCatStatus.cat.comment}</p>
              </Card.Body>
            </Card>
          )}

          {(isFoundCat || isLostCat) && !hideContactInfo && (
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">
                  <FaInfoCircle className="me-2" style={{ color: '#8B4513' }} />
                  {t('cat.contact')}
                </h5>
                {isLoggedIn ? (
                  <>
                    <p className="mb-3">
                      {isFoundCat 
                        ? t('cat.contactFoundMessage')
                        : t('cat.contactLostMessage')}
                    </p>
                    
                    <Row className="g-3 mb-3">
                      {/* Afficher le numéro de téléphone */}
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center">
                          <FaPhone className="me-2" style={{ color: '#8B4513' }} />
                          <div>
                            <div className="text-muted small">{t('cat.phone')}</div>
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
                            <div className="text-muted small">{t('cat.email')}</div>
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
                      {t('cat.sendEmail')}
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="mb-3">
                      {t('cat.loginRequired', 'Veuillez vous connecter pour voir les informations de contact.')}
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={() => window.location.href = '/login'}
                    >
                      {t('common.login', 'Se connecter')}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={handleClose}>
          {t('common.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CatDetails;