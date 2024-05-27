import React, { useState } from "react";
import { Navbar, Nav, Button } from "react-bootstrap";
import Logo from "./image/log.webp"; // Importez votre composant Logo depuis son emplacement
import { buttonStyles } from "./styles";
import { useAuth } from "./hooks/authProvider";

const NavBar = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const handleLogout = () => {
    // Logique de déconnexion
    setIsLoggedIn(false);
    sessionStorage.removeItem("token");
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">
        <img
          src={Logo}
          width="70"
          className="d-inline-block align-top"
          alt="Logo"
          style={{ marginRight: "10px", marginLeft: "10px" }}
        />
      </Navbar.Brand>
      <Navbar.Toggle
        aria-controls="basic-navbar-nav"
        style={{ marginRight: "10px", marginLeft: "10px" }}
      />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/contact">Contactez-nous</Nav.Link>
          <Nav.Link href="/registerCat">Signaler</Nav.Link>
          <Nav.Link href="#lost">Perdu</Nav.Link>
          <Nav.Link href="/foundCats">Trouvé</Nav.Link>
          <Nav.Link href="/profile">Espace perso</Nav.Link>
        </Nav>
        <Nav>
          {isLoggedIn ? (
            <Button variant="light" className="me-2" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="light"
                href="/login"
                className="me-2"
                style={buttonStyles}
              >
                Login
              </Button>

              <Button
                variant="light"
                href="/register"
                className="me-2"
                style={buttonStyles}
              >
                Signup
              </Button>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
