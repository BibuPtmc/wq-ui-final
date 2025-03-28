import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Alert, Button, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPaw, FaTrash, FaEdit } from 'react-icons/fa';

const OwnedCats = ({ ownedCats, onShowCatDetails, onDeleteCat, onEditCat, successMessage }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    breed: '',
    color: '',
    eyeColor: '',
    gender: '',
    dateOfBirth: '',
    chipNumber: '',
    furType: '',
    comment: ''
  });

  // Options pour les sélecteurs basées sur RegisterCat.js
  const breedOptions = [
    'SIAMESE', 'PERSIAN', 'MAINE_COON', 'BENGAL', 'RAGDOLL', 
    'SPHYNX', 'BRITISH_SHORTHAIR', 'ABYSSINIAN', 'BIRMAN', 
    'SCOTTISH_FOLD', 'RUSSIAN_BLUE', 'UNKNOWN'
  ];
  
  const colorOptions = [
    'NOIR', 'BLANC', 'GRIS', 'ROUX', 'MIXTE', 'AUTRE'
  ];
  
  const eyeColorOptions = [
    'BLEU', 'VERT', 'JAUNE', 'MARRON', 'NOISETTE', 'AUTRE'
  ];
  
  const genderOptions = ['Mâle', 'Femelle', 'Inconnu'];

  const furTypeOptions = [
    'Courte', 'Moyenne', 'Longue', 'Sans poils'
  ];

  // Fonction pour formater les valeurs avec underscore en format plus lisible
  const formatValue = (value) => {
    if (!value) return "";
    
    // Remplacer les underscores par des espaces et mettre en forme (première lettre en majuscule, reste en minuscule)
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleEdit = (catStatus) => {
    console.log("Édition du chat (données complètes):", JSON.stringify(catStatus, null, 2));
    setSelectedCat(catStatus);
    
    // Formatage de la date pour l'input date
    let formattedDate = '';
    if (catStatus.cat.dateOfBirth) {
      const date = new Date(catStatus.cat.dateOfBirth);
      formattedDate = date.toISOString().split('T')[0];
    }
    
    const newFormData = {
      name: catStatus.cat.name || '',
      breed: catStatus.cat.breed || 'UNKNOWN',
      color: catStatus.cat.color || 'AUTRE',
      eyeColor: catStatus.cat.eyeColor || 'AUTRE',
      gender: catStatus.cat.gender || 'Inconnu',
      dateOfBirth: formattedDate,
      chipNumber: catStatus.cat.chipNumber || '',
      furType: catStatus.cat.furType || 'Courte',
      comment: catStatus.comment || ''
    };
    
    console.log("Données du formulaire:", newFormData);
    setEditForm(newFormData);
    
    setShowModal(true);
  };

  // Effet pour surveiller les changements de selectedCat et mettre à jour le formulaire
  useEffect(() => {
    if (selectedCat && selectedCat.cat) {
      console.log("selectedCat a changé (données complètes):", JSON.stringify(selectedCat, null, 2));
      
      // Formatage de la date pour l'input date
      let formattedDate = '';
      if (selectedCat.cat.dateOfBirth) {
        const date = new Date(selectedCat.cat.dateOfBirth);
        formattedDate = date.toISOString().split('T')[0];
      }
      
      const newFormData = {
        name: selectedCat.cat.name || '',
        breed: selectedCat.cat.breed || 'UNKNOWN',
        color: selectedCat.cat.color || 'AUTRE',
        eyeColor: selectedCat.cat.eyeColor || 'AUTRE',
        gender: selectedCat.cat.gender || 'Inconnu',
        dateOfBirth: formattedDate,
        chipNumber: selectedCat.cat.chipNumber || '',
        furType: selectedCat.cat.furType || 'Courte',
        comment: selectedCat.comment || ''
      };
      
      console.log("Mise à jour du formulaire:", newFormData);
      setEditForm(newFormData);
    }
  }, [selectedCat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Soumission du formulaire:", editForm);
    onEditCat(selectedCat.cat.catId, editForm);
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changement de champ ${name}:`, value);
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (ownedCats.length === 0) {
    return (
      <Alert variant="info">Vous n'avez pas encore de chats.</Alert>
    );
  }

  return (
    <>
      <Card.Title className="mb-4">
        <FaPaw className="me-2" />
        Mes chats
      </Card.Title>
      
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}

      <div className="text-center mb-4">
        <Badge bg="primary" className="px-3 py-2">
          {ownedCats.length} chats
        </Badge>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {ownedCats.map((catStatus) => {
          const cat = catStatus.cat;
          return (
            <Col key={cat.catId}>
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
                    style={{ height: "200px", objectFit: "cover", cursor: "pointer" }}
                    onClick={() => onShowCatDetails(catStatus)}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">{cat.name || "Chat sans nom"}</Card.Title>
                      <Badge
                        bg={cat.gender === "Mâle" ? "primary" : "danger"}
                        className="ms-2"
                      >
                        {cat.gender || "Inconnu"}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      Race: {formatValue(cat.breed) || "Inconnue"}
                    </Card.Text>
                    <div className="d-flex gap-2 mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => onShowCatDetails(catStatus)}
                      >
                        Voir les détails
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleEdit(catStatus)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCat(cat.catId);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      {/* Modal d'édition */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        onShow={() => console.log("Modal affiché, valeurs du formulaire:", editForm)}
      >
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
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Race</Form.Label>
                  <Form.Select
                    name="breed"
                    value={editForm.breed}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une race</option>
                    {breedOptions.map(option => (
                      <option key={option} value={option}>
                        {formatValue(option)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Genre</Form.Label>
                  <Form.Select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un genre</option>
                    {genderOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Couleur</Form.Label>
                  <Form.Select
                    name="color"
                    value={editForm.color}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une couleur</option>
                    {colorOptions.map(option => (
                      <option key={option} value={option}>
                        {option === 'AUTRE' ? 'Autre' : formatValue(option)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Couleur des yeux</Form.Label>
                  <Form.Select
                    name="eyeColor"
                    value={editForm.eyeColor}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une couleur</option>
                    {eyeColorOptions.map(option => (
                      <option key={option} value={option}>
                        {option === 'AUTRE' ? 'Autre' : formatValue(option)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Type de fourrure</Form.Label>
                  <Form.Select
                    name="furType"
                    value={editForm.furType}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un type</option>
                    {furTypeOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date de naissance</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={editForm.dateOfBirth}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Numéro de puce</Form.Label>
              <Form.Control
                type="text"
                name="chipNumber"
                value={editForm.chipNumber}
                onChange={handleChange}
                placeholder="Numéro de puce (si disponible)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Commentaire</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                value={editForm.comment}
                onChange={handleChange}
                placeholder="Informations supplémentaires sur votre chat"
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

export default OwnedCats;
