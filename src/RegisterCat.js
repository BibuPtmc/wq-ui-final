import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import axios from "axios";
import { buttonStyles } from "./styles";

function RegisterCat() {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    color: "",
    dateOfBirth: "",
    photo: "",
    gender: "",
    chipNumber: "",
    furType: "",
    eyeColor: "",
    comment: "",
    statusCat: "",
    reportDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]; // Récupérer le premier fichier sélectionné
    setFormData({ ...formData, photo: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Vérifier si le nom du chat est vide
    const name = formData.name.trim() === "" ? "Inconnu" : formData.name;
    // Mettre à jour le nom du chat dans le formulaire
    setFormData({ ...formData, name: name });
    try {
      const response = await axios.post("/api/cat/register", formData);
      console.log(response.data); // Logique pour gérer la réponse du backend
    } catch (error) {
      console.error("Error registering cat:", error);
    }
  };

  return (
    <Container className="mt-3">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name">
          <Form.Label>Nom</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Entrez le nom"
          />
        </Form.Group>
        {/* Ajoutez d'autres champs pour les informations du chat */}
        <Form.Group controlId="statusCat">
          <Form.Label>Statut</Form.Label>
          <Form.Control
            as="select"
            name="statusCat"
            value={formData.statusCat}
            onChange={handleChange}
            placeholder="Sélectionnez le statut"
            required
          >
            <option value="">-- Sélectionnez le statut --</option>
            <option value="OWN">Propriétaire</option>
            <option value="FOUND">Trouvé</option>
            <option value="LOST">Perdu</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="reportDate">
          <Form.Label>Date de signalement</Form.Label>
          <Form.Control
            type="date"
            name="reportDate"
            value={formData.reportDate}
            onChange={handleChange}
            placeholder="Sélectionnez la date de signalement"
            required
          />
        </Form.Group>
        <Form.Group controlId="breed">
          <Form.Label>Race</Form.Label>
          <Form.Control
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            placeholder="Entrez la race"
          />
        </Form.Group>
        <Form.Group controlId="color">
          <Form.Label>Couleur</Form.Label>
          <Form.Control
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Entrez la couleur"
            required
          />
        </Form.Group>
        <Form.Group controlId="dateOfBirth">
          <Form.Label>Date de naissance</Form.Label>
          <Form.Control
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            placeholder="Sélectionnez la date de naissance"
          />
        </Form.Group>
        <Form.Group controlId="photo">
          <Form.Label>Photo</Form.Label>
          <Form.Control
            type="file"
            accept="image/*" // Limiter le type de fichiers à des images uniquement
            onChange={handlePhotoChange}
            placeholder="Importer la photo"
          />
        </Form.Group>
        <Form.Group controlId="gender">
          <Form.Label>Genre</Form.Label>
          <Form.Control
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder="Entrez le genre"
            required
          />
        </Form.Group>
        <Form.Group controlId="chipNumber">
          <Form.Label>Numéro de puce</Form.Label>
          <Form.Control
            type="text"
            name="chipNumber"
            value={formData.chipNumber}
            onChange={handleChange}
            placeholder="Entrez le numéro de puce"
          />
        </Form.Group>
        <Form.Group controlId="furType">
          <Form.Label>Type de fourrure</Form.Label>
          <Form.Control
            type="text"
            name="furType"
            value={formData.furType}
            onChange={handleChange}
            placeholder="Entrez le type de fourrure"
          />
        </Form.Group>
        <Form.Group controlId="eyeColor">
          <Form.Label>Couleur des yeux</Form.Label>
          <Form.Control
            type="text"
            name="eyeColor"
            value={formData.eyeColor}
            onChange={handleChange}
            placeholder="Entrez la couleur des yeux"
            required
          />
        </Form.Group>
        <Form.Group controlId="comment" className="mb-3">
          <Form.Label>Commentaire</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Entrez votre commentaire"
          />
        </Form.Group>
        <Button variant="light" type="submit" style={buttonStyles}>
          Enregistrer le chat
        </Button>
      </Form>
    </Container>
  );
}

export default RegisterCat;
