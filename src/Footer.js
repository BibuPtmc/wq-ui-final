import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPaw,
  FaHeart
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FaFacebookF />, url: "https://facebook.com", label: "Facebook" },
    { icon: <FaTwitter />, url: "https://twitter.com", label: "Twitter" },
    { icon: <FaInstagram />, url: "https://instagram.com", label: "Instagram" },
    { icon: <FaLinkedin />, url: "https://linkedin.com", label: "LinkedIn" }
  ];

  const footerStyle = {
    backgroundColor: "#fff",
    borderTop: "1px solid var(--secondary-color)",
    marginTop: "2rem"
  };

  const socialIconStyle = {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color)",
    color: "#fff",
    fontSize: "1rem",
    transition: "all 0.3s ease"
  };

  const sectionTitleStyle = {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "var(--primary-color)",
    position: "relative",
    paddingBottom: "0.5rem"
  };

  const linkStyle = {
    color: "var(--dark-text)",
    textDecoration: "none",
    transition: "color 0.3s ease",
    display: "block",
    marginBottom: "0.5rem"
  };

  return (
    <footer style={footerStyle}>
      <Container>
        <Row className="py-4">
          <Col lg={4} md={6} className="mb-4 mb-lg-0">
            <h5 style={sectionTitleStyle}>WhiskerQuest</h5>
            <p className="mb-4" style={{ color: "var(--dark-text)" }}>
              Votre compagnon de confiance pour retrouver les chats perdus.
            </p>
            <div className="d-flex gap-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialIconStyle}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "var(--secondary-color)"
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </Col>

          <Col lg={4} md={6} className="mb-4 mb-lg-0">
            <h5 style={sectionTitleStyle}>Navigation</h5>
            <nav>
              <Link to="/" style={linkStyle}>
                <FaHome className="me-2" />
                Accueil
              </Link>
              <Link to="/lostCats" style={linkStyle}>
                <FaPaw className="me-2" />
                Chats Perdus
              </Link>
              <Link to="/foundCats" style={linkStyle}>
                <FaPaw className="me-2" />
                Chats Trouvés
              </Link>
              <Link to="/contact" style={linkStyle}>
                <FaEnvelope className="me-2" />
                Contact
              </Link>
            </nav>
          </Col>

          <Col lg={4} md={12}>
            <h5 style={sectionTitleStyle}>Contact</h5>
            <div style={{ color: "var(--dark-text)" }}>
              <p className="d-flex align-items-center mb-2">
                <FaMapMarkerAlt className="me-2" />
                Braine L'Alleud, 1420, BE
              </p>
              <p className="mb-2">
                <a 
                  href="mailto:info@whiskerquest.be" 
                  style={linkStyle}
                  className="d-flex align-items-center"
                >
                  <FaEnvelope className="me-2" />
                  info@whiskerquest.be
                </a>
              </p>
              <p className="mb-2">
                <a 
                  href="tel:+32493963375" 
                  style={linkStyle}
                  className="d-flex align-items-center"
                >
                  <FaPhone className="me-2" />
                  +32 493 96 33 75
                </a>
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          <Col className="text-center py-3" style={{ borderTop: "1px solid var(--secondary-color)" }}>
            <p className="mb-0">
              {currentYear} WhiskerQuest - Développé avec{''}
              <span style={{ color: '#dc3545' }}>❤</span> par MOTQUIN Anaïs
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
