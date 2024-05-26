import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAxios } from "./hooks/useAxios";
import { useToken } from "./hooks/useToken";
import { buttonStyles } from "./styles";

const LoginPage = () => {
  const axios = useAxios();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("/api/login", {
        userName: userName,
        password: password,
      });
      console.log("Response:", response.data);
      // Rediriger ou afficher un message de succès selon les besoins

      sessionStorage.setItem("token", response.data);
      console.log("Login successful");
      // Rediriger l'utilisateur vers une page appropriée après la connexion réussie
    } catch (error) {
      if (error.response.status === 401) {
        setError("Nom d'utilisateur ou mot de passe incorrect.");
      } else {
        setError("Une erreur s'est produite lors de la connexion.");
      }
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button
          variant="light"
          type="submit"
          style={buttonStyles}
          className="mt-3"
        >
          Login
        </Button>

        <div className="mt-2">
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </div>

        {error && <div className="mt-3 text-danger">{error}</div>}
      </Form>
    </div>
  );
};

export default LoginPage;
