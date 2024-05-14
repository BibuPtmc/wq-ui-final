import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneAlt,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter,
  faGoogle,
  faInstagram,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-light text-muted">
      <Container>
        <Row className="justify-content-center justify-content-lg-between py-2 border-bottom">
          <Col
            xs="12"
            lg="5"
            className="text-center text-lg-start mb-2 mb-lg-0"
          >
            <span>Get connected with us on social networks:</span>
          </Col>
          <Col xs="12" lg="5" className="text-center text-lg-end">
            <a href="/" className="me-2 me-lg-4 text-reset">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="/" className="me-2 me-lg-4 text-reset">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="/" className="me-2 me-lg-4 text-reset">
              <FontAwesomeIcon icon={faGoogle} />
            </a>
            <a href="/" className="me-2 me-lg-4 text-reset">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="/" className="me-2 me-lg-4 text-reset">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a href="/" className="me-2 me-lg-4 text-reset">
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </Col>
        </Row>
        <Row className="py-2">
          <Col
            xs="12"
            md="6"
            lg="3"
            className="text-center text-md-start mb-2 mb-md-0"
          >
            <h6 className="text-uppercase fw-bold mb-2">Whisquer Quest</h6>
          </Col>
          <Col
            xs="12"
            md="6"
            lg="3"
            className="text-center text-md-start mb-2 mb-md-0"
          >
            {/* Contenu supplémentaire */}
          </Col>
          <Col
            xs="12"
            md="6"
            lg="3"
            className="text-center text-md-start mb-2 mb-md-0"
          >
            {/* Contenu supplémentaire */}
          </Col>
          <Col xs="12" md="6" lg="3" className="text-center text-md-start">
            <h6 className="text-uppercase fw-bold mb-2">Contact</h6>
            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
              Braine L'Alleud, 1420, BE
            </p>
            <p>
              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
              <a href="mailto:info@whiskerquest.be" className="text-reset">
                info@whiskerquest.be
              </a>
            </p>
            <p>
              <FontAwesomeIcon icon={faPhoneAlt} className="me-2" />
              <a href="tel:+32493963375" className="text-reset">
                +32 493 96 33 75
              </a>
            </p>
          </Col>
        </Row>
      </Container>
      <div
        className="text-center p-2"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
      >
        © {new Date().getFullYear()} Copyright: Développé par MOTQUIN Anaïs
      </div>
    </footer>
  );
};

export default Footer;
