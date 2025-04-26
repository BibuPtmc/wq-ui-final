import React, { useState, useEffect } from "react";
import { Navbar, Nav, Button, Container, Dropdown } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../image/log.webp";
import { useAuth } from "../../contexts/authProvider";
import { FaHome, FaEnvelope, FaExclamationTriangle, FaSearch, FaPaw, FaUser, FaSignOutAlt, FaTag } from 'react-icons/fa';
import { motion } from "framer-motion";
import Cart from '../ecommerce/Cart';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const { isLoggedIn, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    if (window.confirm(t('auth.logoutConfirm', 'Êtes-vous sûr de vouloir vous déconnecter ?'))) {
      logout();
    }
  };

  const navbarStyle = {
    backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease-in-out',
    boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
  };

  const linkStyle = {
    position: 'relative',
    color: '#666',
    fontSize: '0.95rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    transition: 'color 0.3s ease',
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: '#007bff',
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <Navbar expand="lg" fixed="top" style={navbarStyle}>
      <Container>
        <Navbar.Brand as={Link} to="/">
          <motion.img
            src={Logo}
            width="70"
            className="d-inline-block align-top"
            alt="Logo"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              style={location.pathname === '/' ? activeLinkStyle : linkStyle}
            >
              <FaHome className="me-1" /> {t('navbar.home', 'Accueil')}
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/contact" 
              style={location.pathname === '/contact' ? activeLinkStyle : linkStyle}
            >
              <FaEnvelope className="me-1" /> {t('navbar.contact', 'Contact')}
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/registerCat" 
              style={location.pathname === '/registerCat' ? activeLinkStyle : linkStyle}
            >
              <FaExclamationTriangle className="me-1" /> {t('navbar.report', 'Signaler')}
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/lostCats" 
              style={location.pathname === '/lostCats' ? activeLinkStyle : linkStyle}
            >
              <FaSearch className="me-1" /> {t('navbar.lost', 'Perdu')}
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/foundCats" 
              style={location.pathname === '/foundCats' ? activeLinkStyle : linkStyle}
            >
              <FaPaw className="me-1" /> {t('navbar.found', 'Trouvé')}
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/gps-collars" 
              style={location.pathname === '/gps-collars' ? activeLinkStyle : linkStyle}
            >
              <FaTag className="me-1" /> {t('navbar.gpsCollars', 'Colliers GPS')}
            </Nav.Link>
          </Nav>

          <Nav>
            {isLoggedIn ? (
              <>
                <div className="me-3">
                  <Cart />
                </div>
                <LanguageSwitcher className="me-2" />
                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" id="dropdown-basic" style={linkStyle}>
                    <FaUser className="me-1" /> {userData ? `${t('navbar.hello', 'Bonjour')} ${userData.firstName}` : t('navbar.hello', 'Bonjour')}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      <FaUser className="me-2" /> {t('navbar.profile', 'Profil')}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" /> {t('navbar.logout', 'Déconnexion')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <div className="d-flex gap-2 align-items-center">
                <LanguageSwitcher className="me-2" />
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-primary"
                    className="rounded-pill px-4"
                  >
                    {t('navbar.login', 'Connexion')}
                  </Button>
                </motion.div>

                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    className="rounded-pill px-4"
                  >
                    {t('navbar.register', 'Inscription')}
                  </Button>
                </motion.div>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
