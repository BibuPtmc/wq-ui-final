import React from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { FaUser, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';

const PersonalInfo = ({ 
  formData, 
  setFormData, 
  handleSubmit, 
  updateSuccess, 
  updateError 
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-4">
      {updateSuccess && (
        <Alert variant="success" className="mb-3">
          Vos informations ont été mises à jour avec succès !
        </Alert>
      )}
      {updateError && (
        <Alert variant="danger" className="mb-3">
          {updateError}
        </Alert>
      )}

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaUser className="me-2" />
              Prénom
            </Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Votre prénom"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaUser className="me-2" />
              Nom
            </Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Votre nom"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>
          <FaMapMarkerAlt className="me-2" />
          Adresse
        </Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Votre adresse"
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaVenusMars className="me-2" />
              Genre
            </Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Sélectionnez votre genre</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaBirthdayCake className="me-2" />
              Date de naissance
            </Form.Label>
            <Form.Control
              type="date"
              name="birthDay"
              value={formData.birthDay}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-grid gap-2">
        <Button variant="primary" type="submit" className="mt-3">
          Mettre à jour mes informations
        </Button>
      </div>
    </Form>
  );
};

export default PersonalInfo;
