import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Alert, Button, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaTimes, FaPaw } from 'react-icons/fa';
import { useCats } from '../../hooks/useCats';
import MatchingResults from '../cats/MatchingResults';
import { CatLinkRequestButton } from '../cats/CatLinkRequest';
import CatDetails from './CatDetails';

const ReportedCats = ({ reportedCats, onDelete, onEdit, successMessage }) => {
  const { findPotentialFoundCats, findPotentialLostCats } = useCats();
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchCounts, setMatchCounts] = useState({});
  const [loadingMatches, setLoadingMatches] = useState({});
  const [editForm, setEditForm] = useState({
    name: '',
    statusCat: '',
    comment: '',
    breed: '',
    color: '',
    dateOfBirth: '',
    gender: '',
    chipNumber: '',
    furType: '',
    eyeColor: ''
  });

  // Fonction pour formater les valeurs avec underscore en format plus lisible
  const formatValue = (value) => {
    if (!value) return "";
    
    // Remplacer les underscores par des espaces et mettre en forme (première lettre en majuscule, reste en minuscule)
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    const fetchMatchCounts = async () => {
      // Skip if no cats or if we're already loading matches
      if (reportedCats.length === 0 || Object.values(loadingMatches).some(isLoading => isLoading)) {
        return;
      }

      // Check if we already have match counts for all cats
      const allCatsHaveMatchCounts = reportedCats.every(
        catStatus => typeof matchCounts[catStatus.cat.catId] !== 'undefined'
      );
      
      // Skip if we already have all match counts
      if (allCatsHaveMatchCounts) {
        return;
      }
      
      // Only fetch for cats that don't have match counts yet
      const catsToFetch = reportedCats.filter(
        catStatus => typeof matchCounts[catStatus.cat.catId] === 'undefined'
      );
      
      if (catsToFetch.length === 0) {
        return;
      }
      
      const counts = { ...matchCounts };
      const loading = { ...loadingMatches };
      
      // Set loading state for cats we're about to fetch
      catsToFetch.forEach(catStatus => {
        loading[catStatus.cat.catId] = true;
      });
      setLoadingMatches(loading);
      
      // Fetch match counts sequentially to avoid too many simultaneous requests
      for (const catStatus of catsToFetch) {
        const catId = catStatus.cat.catId;
        try {
          if (catStatus.statusCat === 'LOST') {
            const matchResults = await findPotentialFoundCats(catId);
            counts[catId] = matchResults.length;
          } else if (catStatus.statusCat === 'FOUND') {
            const matchResults = await findPotentialLostCats(catId);
            counts[catId] = matchResults.length;
          } else {
            counts[catId] = 0; // Set to 0 for other statuses
          }
          
          loading[catId] = false;
          
          // Update state after each fetch to show progress
          setMatchCounts({ ...counts });
          setLoadingMatches({ ...loading });
        } catch (error) {
          console.error(`Error fetching matches for cat ${catId}:`, error);
          counts[catId] = 0;
          loading[catId] = false;
        }
      }
    };
    
    fetchMatchCounts();
  }, [reportedCats, matchCounts, loadingMatches, findPotentialFoundCats, findPotentialLostCats]); // eslint-disable-line react-hooks/exhaustive-deps
  // We're intentionally not re-running this effect when findPotential*Cats functions change
  // to prevent an infinite loop of API calls

  const handleDelete = (catStatusId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chat signalé ?")) {
      onDelete(catStatusId);
    }
  };

  // Fonction pour s'assurer que les valeurs des énumérations sont correctement initialisées
  const getEnumValue = (value) => {
    if (!value) return '';
    // Si la valeur est déjà en majuscules et contient des underscores, c'est probablement déjà une énumération
    if (value === value.toUpperCase() && value.includes('_')) {
      return value;
    }
    // Sinon, convertir en format d'énumération (majuscules, sans accents, espaces remplacés par des underscores)
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toUpperCase().replace(/\s+/g, "_");
  };

  const handleEdit = (catStatus) => {
    setSelectedCat(catStatus);
    setEditForm({
      name: catStatus.cat.name || '',
      statusCat: catStatus.statusCat || '',
      comment: catStatus.cat.comment || '', // Utiliser le commentaire du chat au lieu du commentaire du statut
      breed: getEnumValue(catStatus.cat.breed) || '',
      color: getEnumValue(catStatus.cat.color) || '',
      dateOfBirth: catStatus.cat.dateOfBirth || '',
      gender: catStatus.cat.gender || '',
      chipNumber: catStatus.cat.chipNumber || '',
      furType: getEnumValue(catStatus.cat.furType) || '',
      eyeColor: getEnumValue(catStatus.cat.eyeColor) || ''
    });
    setShowModal(true);
    
    // Afficher les valeurs dans la console pour débogage
    console.log('Cat data:', catStatus.cat);
    console.log('Eye color:', catStatus.cat.eyeColor);
    console.log('Normalized eye color:', getEnumValue(catStatus.cat.eyeColor));
    console.log('Comment from cat:', catStatus.cat.comment);
  };

  const handleViewDetails = (catStatus) => {
    setSelectedCat(catStatus);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
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

  const handleShowMatches = async (cat) => {
    const matchResults = await findPotentialFoundCats(cat.catId);
    setMatches(matchResults);
    setShowMatches(true);
  };

  const handleShowMatchesLost = async (cat) => {
    const matchResults = await findPotentialLostCats(cat.catId);
    setMatches(matchResults);
    setShowMatches(true);
  };

  const handleCloseMatches = () => {
    setShowMatches(false);
  };

  const refreshCats = () => {
    // Cette fonction sera appelée après une liaison réussie
    // Le composant parent (ProfilePage) s'occupera de rafraîchir la liste des chats
    window.location.reload(); // Simple refresh pour l'instant
  };

  if (reportedCats.length === 0) {
    return (
      <Alert variant="info">Vous n'avez pas de chats signalés.</Alert>
    );
  }

  return (
    <>
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
                        {formatValue(cat.gender) || "Genre inconnu"}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      Race: {formatValue(cat.breed) || "Inconnue"}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      Status: {formatValue(catStatus.statusCat) || "Non spécifié"}
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
                    
                    {/* Bouton pour lier un chat perdu à un chat trouvé */}
                    {catStatus.statusCat === 'LOST' && (
                      <div className="mt-2">
                        <CatLinkRequestButton 
                          lostCatStatusId={catStatus.catStatusId} 
                          onSuccess={refreshCats}
                        />
                      </div>
                    )}
                    
                    {/* Afficher l'ID unique pour les chats trouvés */}
                    {catStatus.statusCat === 'FOUND' && (
                      <div className="mt-2 text-center">
                        <Badge bg="info" className="px-3 py-2">
                          ID: #{catStatus.catStatusId}
                        </Badge>
                        <div className="small text-muted mt-1">
                          Communiquez cet ID au propriétaire
                        </div>
                      </div>
                    )}
                    
                    {catStatus.statusCat === 'LOST' && (
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="w-100 mt-2"
                        onClick={() => handleShowMatches(cat)}
                        disabled={loadingMatches[cat.catId]}
                      >
                        <FaPaw className="me-2" />
                        {loadingMatches[cat.catId] ? 'Chargement...' : 
                          matchCounts[cat.catId] ? 
                          `${matchCounts[cat.catId]} correspondance${matchCounts[cat.catId] > 1 ? 's' : ''} trouvée${matchCounts[cat.catId] > 1 ? 's' : ''}` : 
                          'Aucune correspondance'}
                      </Button>
                    )}
                    {catStatus.statusCat === 'FOUND' && (
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="w-100 mt-2"
                        onClick={() => handleShowMatchesLost(cat)}
                        disabled={loadingMatches[cat.catId]}
                      >
                        <FaPaw className="me-2" />
                        {loadingMatches[cat.catId] ? 'Chargement...' : 
                          matchCounts[cat.catId] ? 
                          `${matchCounts[cat.catId]} correspondance${matchCounts[cat.catId] > 1 ? 's' : ''} trouvée${matchCounts[cat.catId] > 1 ? 's' : ''}` : 
                          'Aucune correspondance'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier les informations du chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du chat</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="statusCat"
                    value={editForm.statusCat}
                    onChange={handleChange}
                  >
                    <option key="empty" value="">Sélectionner un statut</option>
                    <option key="lost" value="LOST">Perdu</option>
                    <option key="found" value="FOUND">Trouvé</option>
                    <option key="own" value="OWN">Propriétaire</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Race</Form.Label>
                  <Form.Select
                    name="breed"
                    value={editForm.breed}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une race</option>
                    <option value="SIAMESE">Siamois</option>
                    <option value="PERSIAN">Persan</option>
                    <option value="MAINE_COON">Maine Coon</option>
                    <option value="BRITISH_SHORTHAIR">British Shorthair</option>
                    <option value="RAGDOLL">Ragdoll</option>
                    <option value="BENGAL">Bengal</option>
                    <option value="SPHYNX">Sphynx</option>
                    <option value="RUSSIAN_BLUE">Bleu Russe</option>
                    <option value="ABYSSINIAN">Abyssin</option>
                    <option value="SCOTTISH_FOLD">Scottish Fold</option>
                    <option value="BIRMAN">Birman</option>
                    <option value="AMERICAN_SHORTHAIR">Américain à poil court</option>
                    <option value="NORWEGIAN_FOREST_CAT">Chat des forêts norvégiennes</option>
                    <option value="EXOTIC_SHORTHAIR">Exotic Shorthair</option>
                    <option value="EUROPEAN_SHORTHAIR">Européen à poil court</option>
                    <option value="OTHER">Autre</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Couleur</Form.Label>
                  <Form.Select
                    name="color"
                    value={editForm.color}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une couleur</option>
                    <option value="NOIR">Noir</option>
                    <option value="BLANC">Blanc</option>
                    <option value="GRIS">Gris</option>
                    <option value="ROUX">Roux</option>
                    <option value="MIXTE">Mixte</option>
                    <option value="AUTRE">Autre</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de naissance</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={editForm.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Genre</Form.Label>
                  <Form.Select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un genre</option>
                    <option value="Mâle">Mâle</option>
                    <option value="Femelle">Femelle</option>
                    <option value="Inconnu">Inconnu</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Numéro de puce</Form.Label>
                  <Form.Control
                    type="text"
                    name="chipNumber"
                    value={editForm.chipNumber}
                    onChange={handleChange}
                    placeholder="Optionnel"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de pelage</Form.Label>
                  <Form.Select
                    name="furType"
                    value={editForm.furType}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un type de pelage</option>
                    <option value="COURTE">Courte</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="LONGUE">Longue</option>
                    <option value="SANS_POILS">Sans poils</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Couleur des yeux</Form.Label>
                  <Form.Select
                    name="eyeColor"
                    value={editForm.eyeColor}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une couleur d'yeux</option>
                    <option value="BLEU">Bleu</option>
                    <option value="MARRON">Marron</option>
                    <option value="VERT">Vert</option>
                    <option value="GRIS">Gris</option>
                    <option value="NOISETTE">Noisette</option>
                    <option value="JAUNE">Jaune</option>
                    <option value="ORANGE">Orange</option>
                    <option value="AUTRE">Autre</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Commentaire</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="comment"
                    value={editForm.comment}
                    onChange={handleChange}
                    style={{ height: '100px' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-3">
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

      <CatDetails 
        selectedCatStatus={selectedCat}
        show={showDetailsModal}
        handleClose={handleCloseDetails}
      />

      <MatchingResults
        matches={matches}
        show={showMatches}
        handleClose={handleCloseMatches}
        onViewDetails={(catStatus) => {
          handleCloseMatches();
          handleViewDetails(catStatus);
        }}
      />
    </>
  );
};

export default ReportedCats;