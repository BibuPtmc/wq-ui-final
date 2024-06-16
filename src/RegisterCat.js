import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useAxios } from "./hooks/useAxios";
import Select from "react-select";
import { buttonStyles } from "./styles";
import catBreeds from "./CatBreeds";

function RegisterCat() {
  const today = new Date().toISOString().split("T")[0];

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
    reportDate: today, // Set initial date to today's date
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // État pour afficher le message de succès

  const axios = useAxios();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSelectChange = (selectedOption, action) => {
    setFormData({
      ...formData,
      [action.name]: selectedOption ? selectedOption.value : "",
    });
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
      console.log(response); // Logique pour gérer la réponse du backend
      setShowSuccessMessage(true); // Afficher le message de succès
      setFormData({
        ...formData,
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
        reportDate: today,
      }); // Réinitialiser le formulaire
      // Temporiser pour masquer le message de succès après 3 secondes
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000); //  5 seconds
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
          <Select
            name="breed"
            value={catBreeds.find((option) => option.value === formData.breed)}
            onChange={handleSelectChange}
            options={catBreeds}
            placeholder="Sélectionnez la race"
            isClearable
          />
        </Form.Group>
        <Form.Group controlId="color">
          <Form.Label>Couleur</Form.Label>
          <Form.Control
            as="select"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Sélectionnez la couleur"
            required
          >
            <option value="">-- Sélectionnez la couleur --</option>
            <option value="NOIR">Noir</option>
            <option value="BLANC">Blanc</option>
            <option value="GRIS">Gris</option>
            <option value="ROUX">Roux</option>
            <option value="MIXTE">Mixte</option>
            <option value="AUTRE">Autre</option>
          </Form.Control>
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
            as="select"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder="Sélectionnez le genre"
            required
          >
            <option value="">-- Sélectionnez le genre --</option>
            <option value="Mâle">Mâle</option>
            <option value="Femelle">Femelle</option>
            <option value="Inconnu">Inconnu</option>
          </Form.Control>
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
            as="select"
            name="furType"
            value={formData.furType}
            onChange={handleChange}
            placeholder="Sélectionnez le type de fourrure"
          >
            <option value="">-- Sélectionnez le type de fourrure --</option>
            <option value="Courte">Courte</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Longue">Longue</option>
            <option value="Sans poils">Sans poils</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="eyeColor">
          <Form.Label>Couleur des yeux</Form.Label>
          <Form.Control
            as="select"
            name="eyeColor"
            value={formData.eyeColor}
            onChange={handleChange}
            placeholder="Sélectionnez la couleur des yeux"
            required
          >
            <option value="">-- Sélectionnez la couleur des yeux --</option>
            <option value="BLEU">Bleu</option>
            <option value="VERT">Vert</option>
            <option value="JAUNE">Jaune</option>
            <option value="MARRON">Marron</option>
            <option value="NOISETTE">Noisette</option>
            <option value="AUTRE">Autre</option>
          </Form.Control>
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
        {showSuccessMessage && (
          <Alert
            variant="success"
            onClose={() => setShowSuccessMessage(false)}
            dismissible
          >
            Le chat a été enregistré avec succès !
          </Alert>
        )}
      </Form>
    </Container>
  );
}

export default RegisterCat;
