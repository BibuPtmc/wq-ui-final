import React, { useState } from "react";
import { Form, Button, Alert, Container } from "react-bootstrap";
import { useAxios } from "../hooks/useAxios";
import { Link } from "react-router-dom";
import { buttonStyles } from "../styles";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    matchingPassword: "",
    firstName: "",
    lastName: "",
    birthDay: "",
  });

  const [passwordsMatch, setPasswordsMatch] = useState(true); // Ajout d'un état pour indiquer si les mots de passe correspondent
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // État pour suivre si l'enregistrement a réussi
  const [passwordComplexityError, setPasswordComplexityError] = useState(false); // État pour suivre si le mot de passe ne satisfait pas la complexité
  const [error, setError] = useState(""); // État pour suivre les erreurs d'inscription

  const axios = useAxios();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setPasswordsMatch(true); // Réinitialiser l'état des mots de passe correspondants lorsque l'utilisateur modifie le champ de confirmation de mot de passe
    setRegistrationSuccess(false); // Réinitialiser l'état de la réussite de l'enregistrement à false lorsqu'une modification est apportée
    setPasswordComplexityError(false); // Réinitialiser l'état d'erreur de complexité du mot de passe
    setError(""); // Réinitialiser les erreurs d'inscription lorsque l'utilisateur modifie les champs
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifier si les mots de passe correspondent
    if (formData.password !== formData.matchingPassword) {
      setPasswordsMatch(false); // Mettre à jour l'état pour indiquer que les mots de passe ne correspondent pas
      return; // Arrêter la soumission du formulaire
    }

    const passwordRegex =
      /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (!passwordRegex.test(formData.password)) {
      setPasswordComplexityError(true); // Définir l'état d'erreur de complexité du mot de passe
      return;
    }

    axios
      .post("/api/client/register", formData)
      .then((response) => {
        console.log("Inscription réussie :", response);
        sessionStorage.setItem("token", response.data);
        setRegistrationSuccess(true);
      })
      .catch((error) => {
        console.error("Erreur lors de l'inscription :", error);
        setError(
          error.response && error.response.data
            ? error.response.data.message
            : "Une erreur inattendue s'est produite. Veuillez réessayer plus tard."
        );
      });
  };

  return (
    <Container className="mt-3">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formUserName">
          <Form.Label>Nom d'utilisateur</Form.Label>
          <Form.Control
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Entrez le nom d'utilisateur"
            required
          />
        </Form.Group>

        <Form.Group controlId="formEmail">
          <Form.Label>Adresse e-mail</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrez l'e-mail"
            required
          />
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Label>Mot de passe</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Entrez le mot de passe"
            required
            isInvalid={!passwordsMatch || passwordComplexityError} // Marquer le champ comme invalide en cas de mots de passe non correspondants ou de complexité insuffisante
          />
          <Form.Control.Feedback type="invalid">
            {passwordComplexityError &&
              "Le mot de passe doit contenir au moins 8 caractères, au moins une lettre majuscule, au moins une lettre minuscule, et au moins un chiffre ou un caractère spécial."}
            {!passwordsMatch && "Les mots de passe ne correspondent pas."}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formMatchingPassword">
          <Form.Label>Confirmer le mot de passe</Form.Label>
          <Form.Control
            type="password"
            name="matchingPassword"
            value={formData.matchingPassword}
            onChange={handleChange}
            placeholder="Confirmez le mot de passe"
            required
            isInvalid={!passwordsMatch} // Marquer le champ comme invalide si les mots de passe ne correspondent pas
          />
          {!passwordsMatch && (
            <Form.Control.Feedback type="invalid">
              Les mots de passe ne correspondent pas
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group controlId="formFirstName">
          <Form.Label>Prénom</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Entrez le prénom"
            required
          />
        </Form.Group>

        <Form.Group controlId="formLastName">
          <Form.Label>Nom de famille</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Entrez le nom de famille"
            required
          />
        </Form.Group>

        <Form.Group controlId="formBirthDay">
          <Form.Label>Date de naissance</Form.Label>
          <Form.Control
            type="date"
            name="birthDay"
            value={formData.birthDay}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            required
            label="Accepter les termes et conditions"
            feedback="Vous devez accepter avant de soumettre."
            feedbackType="invalid"
          />
        </Form.Group>
        <Button variant="light" type="submit" style={buttonStyles}>
          S'inscrire
        </Button>
        {registrationSuccess && (
          <Alert variant="success">
            Enregistrement terminé avec succès !{" "}
            <Link to="/login">Se connecter</Link>
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
      </Form>
    </Container>
  );
};

export default RegistrationForm;
