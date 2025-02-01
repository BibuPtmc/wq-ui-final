import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container"; // Importez Container depuis react-bootstrap
import { buttonStyles } from "../../styles";

export const ContactUs = () => {
  const form = useRef();
  const [messageSent, setMessageSent] = useState(false); // État pour suivre si le message a été envoyé

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm("service_3pki1lg", "template_8r6u2xo", form.current, {
        publicKey: "PVmqeNzi9d6uUKAP0",
      })
      .then(
        () => {
          console.log("SUCCESS!");
          setMessageSent(true); // Mettre à jour l'état pour indiquer que le message a été envoyé
          setTimeout(() => setMessageSent(false), 5000); // Réinitialiser l'état après 5 secondes
          form.current.reset(); // Réinitialiser le formulaire
        },
        (error) => {
          console.log("FAILED...", error.text);
        }
      );
  };

  return (
    <Container className="mt-3">
      {messageSent && (
        <div className="alert alert-success">Message envoyé!</div>
      )}{" "}
      {/* Afficher le message "Message envoyé" si le message a été envoyé avec succès */}
      <Form ref={form} onSubmit={sendEmail}>
        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="user_name"
            placeholder="Entrer votre Nom"
            required
          />{" "}
          {/* Champ nom obligatoire */}
        </Form.Group>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="user_email"
            placeholder="Entrer votre Email"
            required
          />{" "}
          {/* Champ email obligatoire */}
        </Form.Group>
        <Form.Group controlId="formMessage">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            name="message"
            placeholder="Entrez votre message"
            rows={3}
            required
          />{" "}
          {/* Champ message obligatoire */}
        </Form.Group>
        <div className="mb-3"></div>{" "}
        {/* Ajout d'un espace de 3 unités (1 rem) */}
        <Button variant="light" type="submit" style={buttonStyles}>
          Send
        </Button>
      </Form>
    </Container>
  );
};
