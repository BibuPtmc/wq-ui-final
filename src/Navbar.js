import React, { useState, useEffect } from "react";
import { Navbar, Nav, Button, Container, Dropdown } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./image/log.webp";
import { useAuth } from "./hooks/authProvider";
import { FaHome, FaEnvelope, FaExclamationTriangle, FaSearch, FaPaw, FaUser, FaSignOutAlt, FaTag } from 'react-icons/fa';
import { motion } from "framer-motion";

const NavBar = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

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
    setIsLoggedIn(false);
    sessionStorage.removeItem("token");
    navigate("/");
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
              <FaHome className="me-1" /> Accueil
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/contact" 
              style={location.pathname === '/contact' ? activeLinkStyle : linkStyle}
            >
              <FaEnvelope className="me-1" /> Contact
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/registerCat" 
              style={location.pathname === '/registerCat' ? activeLinkStyle : linkStyle}
            >
              <FaExclamationTriangle className="me-1" /> Signaler
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/lostCats" 
              style={location.pathname === '/lostCats' ? activeLinkStyle : linkStyle}
            >
              <FaSearch className="me-1" /> Perdu
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/foundCats" 
              style={location.pathname === '/foundCats' ? activeLinkStyle : linkStyle}
            >
              <FaPaw className="me-1" /> Trouvé
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/gps-collars" 
              style={location.pathname === '/gps-collars' ? activeLinkStyle : linkStyle}
            >
              <FaTag className="me-1" /> Colliers GPS
            </Nav.Link>
          </Nav>

          <Nav>
            {isLoggedIn ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" id="dropdown-basic" style={linkStyle}>
                  <FaUser className="me-1" /> Mon Compte
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" /> Profil
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Déconnexion
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-primary"
                    className="rounded-pill px-4"
                  >
                    Connexion
                  </Button>
                </motion.div>

                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    className="rounded-pill px-4"
                  >
                    Inscription
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
