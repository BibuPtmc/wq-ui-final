import React, { useEffect, useState } from "react";
import {
  Modal,
  Row,
  Col,
  Badge,
  Card,
  Button,
  Carousel,
} from "react-bootstrap";
import {
  FaPaw,
  FaBirthdayCake,
  FaCalendarAlt,
  FaInfoCircle,
  FaComments,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
} from "react-icons/fa";
import { useCatSearch } from "../../contexts/CatSearchContext";
import { useCatsContext } from "../../contexts/CatsContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthProvider";
import { FaSyringe, FaLeaf, FaPalette } from "react-icons/fa";

function CatDetails({
  selectedCatStatus,
  handleClose,
  show,
  hideContactInfo = false,
}) {
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
    const updatedReportedCat = reportedCats.find(
      (cat) => cat.catStatusId === currentCatStatus.catStatusId
    );

    // Vérifier si le chat est dans ownedCats (si son statut a changé pour OWN)
    const updatedOwnedCat = ownedCats.find(
      (cat) => cat.cat.catId === currentCatStatus.cat.catId
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
  const isLostCat = currentCatStatus.statusCat === "LOST";
  const isFoundCat = currentCatStatus.statusCat === "FOUND";
  const isOwnedCat = currentCatStatus.statusCat === "OWN";

  // Déterminer les informations de contact en fonction du type de chat
  const getUserContactInfo = () => {
    if (!isLoggedIn) {
      return null;
    }

    // Pour les chats trouvés, l'info utilisateur est dans currentCatStatus.user
    if (isFoundCat && currentCatStatus.user) {
      return {
        phone: currentCatStatus.user.phone || "+32 484 934 747",
        email: currentCatStatus.user.email || "contact@example.com",
      };
    }
    // Pour les chats perdus, l'info utilisateur est dans currentCatStatus.user
    if (isLostCat && currentCatStatus.user) {
      return {
        phone: currentCatStatus.user.phone || "+32 484 934 747",
        email: currentCatStatus.user.email || "contact@example.com",
      };
    }
    // Valeurs par défaut
    return {
      phone: "+32 484 934 747",
      email: "contact@example.com",
    };
  };

  const contactInfo = getUserContactInfo();

  // Fonction pour ouvrir le client email par défaut
  const handleEmailContact = () => {
    if (!isLoggedIn) {
      return;
    }

    const subject = isFoundCat
      ? t(
          "cat.emailSubjectFound",
          { name: cat.name || t("cat.noName", "Sans nom") },
          "À propos de votre chat trouvé: {{name}}"
        )
      : t(
          "cat.emailSubjectLost",
          { name: cat.name || t("cat.noName", "Sans nom") },
          "À propos de votre chat perdu: {{name}}"
        );

    const body = isFoundCat
      ? t(
          "cat.emailBodyFound",
          "Bonjour,\n\nJ'ai vu votre annonce concernant un chat trouvé et je pense qu'il pourrait s'agir du mien.\n\nCordialement,"
        )
      : t(
          "cat.emailBodyLost",
          "Bonjour,\n\nJ'ai vu votre annonce concernant un chat perdu et je pense avoir vu un chat qui lui ressemble.\n\nCordialement,"
        );

    window.location.href = `mailto:${
      contactInfo.email
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return t("common.invalid", "Inconnue");
    return new Date(dateString).toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center">
          <FaPaw className="me-2" style={{ color: "#8B4513" }} />
          {isFoundCat
            ? t("cat.found", "Chat trouvé")
            : t("cat.lost", "Chat perdu")}
          : {cat.name || t("cat.noName", "Sans nom")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="cat-details-modal">
          {/* Carrousel d'images */}
          <div className="cat-carousel-wrapper bg-light p-3 mb-3">
            <Carousel
              interval={5000}
              indicators={true}
              prevIcon={<FaChevronLeft className="text-dark fs-4" />}
              nextIcon={<FaChevronRight className="text-dark fs-4" />}
            >
              {(() => {
                const images = [];
                if (cat.imageUrl)
                  images.push({ url: cat.imageUrl, alt: cat.name || "Chat" });
                if (cat.imageUrls && cat.imageUrls.length > 0) {
                  cat.imageUrls.forEach((url, index) => {
                    if (url)
                      images.push({
                        url,
                        alt: `${cat.name || "Chat"} #${index + 1}`,
                      });
                  });
                }
                if (images.length === 0) {
                  return (
                    <Carousel.Item>
                      <img
                        className="d-block w-100 rounded"
                        src="/noImageCat.png"
                        alt="Aucune image"
                        style={{
                          maxHeight: 350,
                          objectFit: "cover",
                          margin: "0 auto",
                        }}
                      />
                    </Carousel.Item>
                  );
                }
                return images.map((img, idx) => (
                  <Carousel.Item key={idx}>
                    <img
                      className="d-block w-100 rounded"
                      src={img.url}
                      alt={img.alt}
                      style={{
                        maxHeight: 350,
                        objectFit: "cover",
                        margin: "0 auto",
                      }}
                    />
                  </Carousel.Item>
                ));
              })()}
            </Carousel>
          </div>

          {/* En-tête fiche d'identité */}
          <div className="text-center mt-3 mb-4">
            <h2 className="fw-bold mb-2">
              {cat.name || t("cat.noName", "Sans nom")}
            </h2>
            <Badge
              bg={isLostCat ? "danger" : isFoundCat ? "success" : "secondary"}
              className="mx-1"
            >
              {isLostCat
                ? t("cat.lost", "Perdu")
                : isFoundCat
                ? t("cat.found", "Trouvé")
                : t("cat.owned", "Possédé")}
            </Badge>
            <Badge bg="accent" className="mx-1">
              {cat.breed}
            </Badge>
            <Badge bg="primary" className="mx-1">
              {cat.gender}
            </Badge>
          </div>

          <Row className="g-4 px-4">
            {/* Colonne gauche : Caractéristiques */}
            <Col xs={12} md={6}>
              <div className="mb-4">
                <h5 className="mb-3 border-bottom pb-2 text-uppercase text-secondary">
                  <FaInfoCircle
                    className="me-2"
                    style={{ color: "var(--primary-color)" }}
                  />
                  {t("cat.characteristics", "Caractéristiques")}
                </h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FaBirthdayCake className="me-2 text-secondary" />
                    <strong>
                      {t("cat.birthDate", "Date de naissance")}:
                    </strong>{" "}
                    {cat.dateOfBirth
                      ? formatDate(cat.dateOfBirth)
                      : t("common.unknown", "Inconnue")}{" "}
                    {cat.dateOfBirth &&
                      `(${t("cat.age", "Âge")}: ${calculateAge(
                        cat.dateOfBirth
                      )})`}
                  </li>
                  <li className="mb-2">
                    <FaPalette className="me-2 text-secondary" />
                    <strong>{t("cat.color", "Couleur")}:</strong>{" "}
                    {formatValue(cat.color) || t("common.unknown")}
                  </li>
                  <li className="mb-2">
                    <FaEye className="me-2 text-secondary" />
                    <strong>{t("cat.eyeColor", "Yeux")}:</strong>{" "}
                    {formatValue(cat.eyeColor) || t("common.unknown")}
                  </li>
                  <li className="mb-2">
                    <FaLeaf className="me-2 text-secondary" />
                    <strong>{t("cat.furType", "Pelage")}:</strong>{" "}
                    {formatValue(cat.furType) || t("common.unknown")}
                  </li>
                  <li className="mb-2">
                    <FaSyringe className="me-2 text-secondary" />
                    <strong>Vacciné :</strong>{" "}
                    <Badge
                      bg={
                        cat.vaccinated === true
                          ? "success"
                          : cat.vaccinated === false
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {cat.vaccinated === true
                        ? "Oui"
                        : cat.vaccinated === false
                        ? "Non"
                        : "Non spécifié"}
                    </Badge>
                  </li>
                  <li className="mb-2">
                    <FaPaw className="me-2 text-secondary" />
                    <strong>Stérilisé :</strong>{" "}
                    <Badge
                      bg={
                        cat.sterilized === true
                          ? "success"
                          : cat.sterilized === false
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {cat.sterilized === true
                        ? "Oui"
                        : cat.sterilized === false
                        ? "Non"
                        : "Non spécifié"}
                    </Badge>
                  </li>
                </ul>
              </div>
              <div className="mb-4">
                <h5 className="mb-3 border-bottom pb-2 text-uppercase text-secondary">
                  <FaMapMarkerAlt
                    className="me-2"
                    style={{ color: "var(--primary-color)" }}
                  />
                  {t("cat.location", "Lieu")}
                </h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>{t("cat.address", "Adresse")}:</strong>{" "}
                    {currentCatStatus.location?.address ||
                      `${currentCatStatus.location?.city || ""} ${
                        currentCatStatus.location?.postalCode || ""
                      }` ||
                      t("common.unknown", "Inconnu")}
                  </li>
                  <li className="mb-2">
                    <FaCalendarAlt className="me-2 text-secondary" />
                    <strong>
                      {isFoundCat
                        ? t("cat.foundOn", "Trouvé le")
                        : isLostCat
                        ? t("cat.lostOn", "Perdu le")
                        : t("cat.statusDate", "Date")}
                      :
                    </strong>{" "}
                    {formatDate(currentCatStatus.reportDate)}
                  </li>
                </ul>
              </div>
            </Col>

            {/* Colonne droite : Description et Contact */}
            <Col xs={12} md={6}>
              {cat.comment && (
                <div className="bg-light rounded p-3 mb-4 shadow-sm">
                  <h5 className="mb-2 text-uppercase text-secondary">
                    <FaInfoCircle
                      className="me-2"
                      style={{ color: "var(--primary-color)" }}
                    />
                    {t("cat.description", "Description")}
                  </h5>
                  <div className="mt-2">{cat.comment}</div>
                </div>
              )}

              {(isFoundCat || isLostCat) && !hideContactInfo && (
                <div className="bg-white border rounded p-3 shadow-sm">
                  <h5 className="mb-2 text-uppercase text-secondary">
                    <FaComments
                      className="me-2"
                      style={{ color: "var(--primary-color)" }}
                    />
                    {t("cat.contact", "Contact")}
                  </h5>
                  {isLoggedIn ? (
                    <div className="mb-2">
                      <Button
                        variant="outline-primary"
                        className="mx-2 mb-2"
                        onClick={handleEmailContact}
                      >
                        <FaEnvelope className="me-1" /> {contactInfo.email}
                      </Button>
                      <Button
                        variant="outline-success"
                        className="mx-2 mb-2"
                        href={`tel:${contactInfo.phone}`}
                      >
                        <FaPhone className="me-1" /> {contactInfo.phone}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="mx-2 mb-2"
                        onClick={() =>
                          navigator.clipboard.writeText(contactInfo.email)
                        }
                      >
                        Copier l'email
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="mb-3">
                        {t(
                          "cat.loginRequired",
                          "Veuillez vous connecter pour voir les informations de contact."
                        )}
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => (window.location.href = "/login")}
                      >
                        {t("common.login", "Se connecter")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={handleClose}>
          {t("common.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CatDetails;
