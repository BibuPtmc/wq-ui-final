import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { buttonStyles } from "../../styles/styles";
import { useTranslation } from 'react-i18next';

export const ContactUs = () => {
  const { t } = useTranslation();
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
        <div className="alert alert-success">{t('contact.sentMessage')}</div>
      )}{" "}
      {/* Afficher le message "Message envoyé" si le message a été envoyé avec succès */}
      <Form ref={form} onSubmit={sendEmail}>
        <Form.Group controlId="formName">
          <Form.Label>{t('contact.name')}</Form.Label>
          <Form.Control
            type="text"
            name="user_name"
            placeholder={t('contact.placeholderName')}
            required
          />{" "}
          {/* Champ nom obligatoire */}
        </Form.Group>
        <Form.Group controlId="formEmail">
          <Form.Label>{t('contact.email')}</Form.Label>
          <Form.Control
            type="email"
            name="user_email"
            placeholder={t('contact.placeholderEmail')}
            required
          />{" "}
          {/* Champ email obligatoire */}
        </Form.Group>
        <Form.Group controlId="formMessage">
          <Form.Label>{t('contact.message')}</Form.Label>
          <Form.Control
            as="textarea"
            name="message"
            placeholder={t('contact.placeholderMessage')}
            rows={3}
            required
          />{" "}
          {/* Champ message obligatoire */}
        </Form.Group>
        <div className="mb-3"></div>{" "}
        {/* Ajout d'un espace de 3 unités (1 rem) */}
        <Button variant="light" type="submit" style={buttonStyles}>
          {t('contact.send')}
        </Button>
      </Form>
    </Container>
  );
};
