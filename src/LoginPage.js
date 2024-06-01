import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAxios } from "./hooks/useAxios";
import { buttonStyles } from "./styles";
import { useAuth } from "./hooks/authProvider";

const LoginPage = () => {
  var axios = useAxios();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    axios
      .post("/auth/login", {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log("Response:", response);
        const token = response.token;

        sessionStorage.setItem("token", token);

        console.log(sessionStorage);
        console.log("Login successful");

        setIsLoggedIn(true);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        if (error.response && error.response.status === 401) {
          setError("Email or password is incorrect.");
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
      });
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
