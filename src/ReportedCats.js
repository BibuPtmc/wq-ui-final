import React, { useState } from 'react';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { FaTimes, FaEdit } from 'react-icons/fa';
import CatMatching from './CatMatching';

const ReportedCats = ({ reportedCats, onDelete, onEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    statusCat: '',
    comment: ''
  });

  const handleDelete = (catStatusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chat signalé ?")) {
      onDelete(catStatusId);
    }
  };

  const handleEdit = (catStatus) => {
    setSelectedCat(catStatus);
    setEditForm({
      name: catStatus.cat.name || '',
      statusCat: catStatus.statusCat || '',
      comment: catStatus.comment || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(selectedCat.catStatusId, editForm);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h2>Chats Signalés</h2>
      {reportedCats.length > 0 ? (
        <Row>
          {reportedCats.map(catStatus => (
            <Col md={4} key={catStatus.catStatusId} className="mb-4">
              <Card className="shadow-sm position-relative">
                <div className="position-absolute d-flex" style={{ top: '10px', right: '10px', gap: '10px' }}>
                  <FaEdit
                    style={{ cursor: 'pointer', color: '#0d6efd' }}
                    onClick={() => handleEdit(catStatus)}
                  />
                  <FaTimes
                    style={{ cursor: 'pointer', color: '#dc3545' }}
                    onClick={() => handleDelete(catStatus.catStatusId)}
                  />
                </div>
                <Card.Body>
                  <Card.Title>{catStatus.cat.name || "Nom inconnu"}</Card.Title>
                  <Card.Text>
                    <strong>Status:</strong> {catStatus.statusCat || "Statut inconnu"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Commentaire:</strong> {catStatus.comment || "Aucun commentaire"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Date de signalement:</strong> {new Date(catStatus.reportDate).toLocaleDateString() || "Date inconnue"}
                  </Card.Text>
                  <CatMatching cat={catStatus.cat} />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>Aucun chat signalé.</p>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier les informations du chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom du chat</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="statusCat"
                value={editForm.statusCat}
                onChange={handleChange}
              >
                <option value="">Sélectionner un statut</option>
                <option value="LOST">Perdu</option>
                <option value="FOUND">Trouvé</option>
                <option value="ADOPT">À adopter</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="comment"
                value={editForm.comment}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ReportedCats;