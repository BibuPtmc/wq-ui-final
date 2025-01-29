import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaBirthdayCake } from 'react-icons/fa';

const PersonalInfo = ({ connectedUser, formData, handleChange, handleUpdateProfile }) => {
  const formatPhoneNumber = (phoneNumber) => {
    let cleaned = ("" + phoneNumber).replace(/\D/g, "");
    return cleaned.startsWith("32") ? "+" + cleaned : "+32" + cleaned;
  };

  return (
    <Form onSubmit={handleUpdateProfile}>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label className="text-muted">
              <FaEnvelope className="me-2" />
              Email
            </Form.Label>
            <Form.Control
              type="email"
              defaultValue={connectedUser.email}
              disabled
              className="bg-light"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPhone">
            <Form.Label className="text-muted">
              <FaPhone className="me-2" />
              Téléphone
            </Form.Label>
            <Form.Control
              type="text"
              defaultValue={formatPhoneNumber(connectedUser.phone)}
              disabled
              className="bg-light"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group className="mb-3" controlId="firstName">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="border-0 shadow-sm"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="lastName">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="border-0 shadow-sm"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="address">
        <Form.Label className="text-muted">
          <FaMapMarkerAlt className="me-2" />
          Adresse
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.address}
          onChange={handleChange}
          className="border-0 shadow-sm"
        />
      </Form.Group>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group controlId="gender">
            <Form.Label className="text-muted">
              <FaVenusMars className="me-2" />
              Genre
            </Form.Label>
            <Form.Select
              value={formData.gender}
              onChange={handleChange}
              className="border-0 shadow-sm"
            >
              <option>Homme</option>
              <option>Femme</option>
              <option>Autre</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="birthDay">
            <Form.Label className="text-muted">
              <FaBirthdayCake className="me-2" />
              Date de naissance
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.birthDay}
              onChange={handleChange}
              className="border-0 shadow-sm"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-grid">
        <Button
          variant="primary"
          type="submit"
          size="lg"
          className="rounded-pill"
        >
          Mettre à jour le profil
        </Button>
      </div>
    </Form>
  );
};

export default PersonalInfo;
