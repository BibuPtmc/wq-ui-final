import React from 'react';
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaVenusMars, FaBirthdayCake } from 'react-icons/fa';

const PersonalInfo = ({ connectedUser, formData, handleChange, handleUpdateProfile, loading }) => {
  const formatPhoneNumber = (phoneNumber) => {
    let cleaned = ("" + phoneNumber).replace(/\D/g, "");
    return cleaned.startsWith("32") ? "+" + cleaned : "+32" + cleaned;
  };

  return (
    <Form onSubmit={handleUpdateProfile}>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="formEmail" className="mb-3">
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
          <Form.Group controlId="formPhone" className="mb-3">
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
          <Form.Group controlId="firstName" className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
              className="border-0 shadow-sm"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="lastName" className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
              className="border-0 shadow-sm"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId="address" className="mb-3">
        <Form.Label className="text-muted">
          <FaMapMarkerAlt className="me-2" />
          Adresse
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.address}
          onChange={handleChange}
          disabled={loading}
          className="border-0 shadow-sm"
        />
      </Form.Group>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group controlId="gender" className="mb-3">
            <Form.Label className="text-muted">
              <FaVenusMars className="me-2" />
              Genre
            </Form.Label>
            <Form.Select 
              value={formData.gender}
              onChange={handleChange}
              disabled={loading}
              className="border-0 shadow-sm"
            >
              <option value="MALE">Homme</option>
              <option value="FEMALE">Femme</option>
              <option value="OTHER">Autre</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="birthDay" className="mb-3">
            <Form.Label className="text-muted">
              <FaBirthdayCake className="me-2" />
              Date de naissance
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.birthDay}
              onChange={handleChange}
              disabled={loading}
              className="border-0 shadow-sm"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Mise à jour...
            </>
          ) : (
            'Mettre à jour le profil'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default PersonalInfo;
