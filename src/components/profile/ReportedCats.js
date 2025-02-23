import React, { useState } from 'react';
import { Row, Col, Card, Badge, Alert, Button, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPaw, FaEdit, FaTimes } from 'react-icons/fa';

const ReportedCats = ({ reportedCats, onDelete, onEdit, successMessage }) => {
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

  if (reportedCats.length === 0) {
    return (
      <Alert variant="info">Vous n'avez pas de chats signalés.</Alert>
    );
  }

  return (
    <>
      <Card.Title className="mb-4">
        <FaPaw className="me-2" />
        Chats Signalés
      </Card.Title>

      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}

      <div className="text-center mb-4">
        <Badge bg="primary" className="px-3 py-2">
          {reportedCats.length} chats signalés
        </Badge>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {reportedCats.map((catStatus) => {
          const cat = catStatus.cat;
          return (
            <Col key={catStatus.catStatusId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="cat-card shadow-sm h-100">
                  <Card.Img
                    variant="top"
                    src={cat.imageCatData ? 
                      `data:${cat.type};base64,${cat.imageCatData}` : 
                      cat.photoUrl || "/images/noImageCat.png"
                    }
                    alt={cat.name}
                    onError={(e) => {
                      e.target.src = "/images/noImageCat.png";
                      e.target.onerror = null;
                    }}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">{cat.name || "Chat sans nom"}</Card.Title>
                      <Badge
                        bg={cat.gender === "Mâle" ? "primary" : "danger"}
                        className="ms-2"
                      >
                        {cat.gender || "Genre inconnu"}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      Status: {catStatus.statusCat || "Non spécifié"}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      Signalé le: {new Date(catStatus.reportDate).toLocaleDateString()}
                    </Card.Text>
                    {catStatus.comment && (
                      <Card.Text className="text-muted small">
                        Commentaire: {catStatus.comment}
                      </Card.Text>
                    )}
                    <div className="d-flex gap-2 mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => handleEdit(catStatus)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(catStatus.catStatusId)}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

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
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="statusCat"
                value={editForm.statusCat}
                onChange={handleChange}
              >
                <option value="">Sélectionner un statut</option>
                <option value="LOST">Perdu</option>
                <option value="FOUND">Trouvé</option>
                {/* <option value="ADOPT">À adopter</option> */}
                <option value="OWN">Propriétaire</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Commentaire</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                value={editForm.comment}
                onChange={handleChange}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ReportedCats;