import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Alert, Button, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaTimes, FaPaw } from 'react-icons/fa';
// Nous utilisons maintenant useCatSearch qui contient toutes les fonctions nécessaires
import MatchingResults from '../cats/MatchingResults';
import { CatLinkRequestButton } from '../cats/CatLinkRequest';
import CatDetails from './CatDetails';
// Utiliser les contextes centralisés
import { useCatSearch } from "../../contexts/CatSearchContext";
import { useCatsContext } from "../../contexts/CatsContext";
import { getStatusLabel } from "../../utils/enumOptions";
import { convertToEnum } from "../../utils/enumUtils";
import { useTranslation } from 'react-i18next';
import ImageUploader from "../common/ImageUploader";

const ReportedCats = ({ reportedCats, onDelete, onEdit, successMessage }) => {
  const { t } = useTranslation();
  // Utiliser les fonctions du contexte
  const { formatValue, calculateAge, findPotentialFoundCats, findPotentialLostCats } = useCatSearch();
  const { fetchCats } = useCatsContext();

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
    eyeColor: '',
    images: []
  });
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Filtres et tri
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = plus récent, 'asc' = plus ancien

  // Utilisation de la fonction formatEnumValue centralisée

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

  const handleDelete = async (catStatusId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chat ?')) {
      const success = await onDelete(catStatusId);
      if (success) {
        // Rafraîchir les données après la suppression
        await fetchCats();
      }
    }
  };

  const handleEdit = (catStatus) => {
    setSelectedCat(catStatus);
    setEditForm({
      name: catStatus.cat.name || '',
      statusCat: catStatus.statusCat || '',
      comment: catStatus.cat.comment || '', // Utiliser le commentaire du chat au lieu du commentaire du statut
      breed: convertToEnum(catStatus.cat.breed, '') || '',
      color: convertToEnum(catStatus.cat.color, '') || '',
      dateOfBirth: catStatus.cat.dateOfBirth || '',
      gender: catStatus.cat.gender || '',
      chipNumber: catStatus.cat.chipNumber || '',
      furType: convertToEnum(catStatus.cat.furType, '') || '',
      eyeColor: convertToEnum(catStatus.cat.eyeColor, '') || '',
      images: catStatus.cat.imageUrls && catStatus.cat.imageUrls.length > 0
        ? catStatus.cat.imageUrls
        : (catStatus.cat.imageUrl ? [catStatus.cat.imageUrl] : [])
    });
    setShowModal(true);
  };

  const handleViewDetails = (catStatus) => {
    setSelectedCat(catStatus);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Préparer le payload avec images comme dans OwnedCats
    const payload = {
      ...editForm,
      imageUrls: editForm.images,
      imageUrl: editForm.images.length > 0 ? editForm.images[0] : null
    };
    const success = await onEdit(selectedCat.catStatusId, payload);
    setShowModal(false);
    if (success) {
      // Rafraîchir les données après l'édition
      await refreshCats();
    }
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // Handler pour la mise à jour des images
  const handleImageUploaded = (imageData) => {
    if (Array.isArray(imageData)) {
      setEditForm(prev => ({
        ...prev,
        images: imageData
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        images: imageData ? [imageData] : []
      }));
    }
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

  const refreshCats = async () => {
    // Utiliser fetchCats du contexte pour rafraîchir les données sans recharger la page
    await fetchCats();
  };

  if (reportedCats.length === 0) {
    return (
      <Alert variant="info">{t('reportedCats.none', "Vous n'avez pas de chats signalés.")}</Alert>
    );
  }

  // Application des filtres et du tri
  const filteredCats = reportedCats
    .filter(catStatus => !statusFilter || catStatus.statusCat === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.reportDate);
      const dateB = new Date(b.reportDate);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <>
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}

      <div className="d-flex flex-wrap gap-3 align-items-center justify-content-center mb-4">
        <div>
          <Form.Label className="me-2 mb-0">Filtrer par statut :</Form.Label>
          <Form.Select
            size="sm"
            style={{ width: 160, display: 'inline-block' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tous</option>
            <option value="LOST">Perdu</option>
            <option value="FOUND">Trouvé</option>
          </Form.Select>
        </div>
        <div>
          <Form.Label className="me-2 mb-0">Trier :</Form.Label>
          <Form.Check
            inline
            label="Plus récent"
            type="radio"
            id="sort-desc"
            name="sortOrder"
            checked={sortOrder === 'desc'}
            onChange={() => setSortOrder('desc')}
          />
          <Form.Check
            inline
            label="Plus ancien"
            type="radio"
            id="sort-asc"
            name="sortOrder"
            checked={sortOrder === 'asc'}
            onChange={() => setSortOrder('asc')}
          />
        </div>
        <Badge bg="primary" className="px-3 py-2">
          {t('reportedCats.count', { count: filteredCats.length, defaultValue: `${filteredCats.length} chats signalés` })}
        </Badge>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredCats.map((catStatus) => {
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
                    src={
                      (cat.imageUrls && Array.isArray(cat.imageUrls) && cat.imageUrls.length > 0)
                        ? cat.imageUrls[0]
                        : (cat.imageUrl ? cat.imageUrl : "/noImageCat.png")
                    }
                    alt={cat.name}
                    onError={(e) => {
                      e.target.src = "/noImageCat.png";
                      e.target.onerror = null;
                    }}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">{cat.name || t('reportedCats.noName', 'Chat sans nom')}</Card.Title>
                      <Badge
                        bg={cat.gender === t('reportedCats.male', { defaultValue: 'Mâle' }) ? "primary" : "danger"}
                        className="ms-2"
                      >
                        {formatValue(cat.gender) || t('reportedCats.unknownGender', 'Genre inconnu')}
                      </Badge>
                    </div>
                    <Card.Text className="text-muted small">
                      {t('reportedCats.breed', 'Race')}: {formatValue(cat.breed) || t('reportedCats.unknownBreed', 'Inconnue')}
                      {cat.dateOfBirth && (
                        <span className="ms-2">
                          {t('reportedCats.age', 'Âge')}: {calculateAge(cat.dateOfBirth)}
                        </span>
                      )}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      {t('reportedCats.status', 'Statut')}: {getStatusLabel(catStatus.statusCat) || t('reportedCats.notSpecified', 'Non spécifié')}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      {t('reportedCats.reportedOn', 'Signalé le')}: {new Date(catStatus.reportDate).toLocaleDateString()}
                    </Card.Text>
                    {catStatus.comment && (
                      <Card.Text className="text-muted small">
                        {t('reportedCats.comment', 'Commentaire')}: {catStatus.comment}
                      </Card.Text>
                    )}
                    <div className="d-flex gap-2 mt-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => handleViewDetails(catStatus)}
                      >
                        {t('reportedCats.details', 'Voir détails')}
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(catStatus)}
                      >
                        {t('reportedCats.edit', 'Modifier')}
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
                      <div className="mt-2" key={`link-request-${catStatus.catStatusId}`}>
                        <CatLinkRequestButton 
                          lostCatStatusId={catStatus.catStatusId} 
                          onSuccess={refreshCats}
                        />
                      </div>
                    )}
                    
                    {/* Afficher l'ID unique pour les chats trouvés */}
                    {catStatus.statusCat === 'FOUND' && (
                      <div className="mt-2 text-center" key={`found-id-${catStatus.catStatusId}`}>
                        <Badge bg="info" className="px-3 py-2">
                          {t('reportedCats.id', 'ID')}: #{catStatus.catStatusId}
                        </Badge>
                        <div className="small text-muted mt-1">
                          {t('reportedCats.idHelp', 'Communiquez cet ID au propriétaire')}
                        </div>
                      </div>
                    )}
                    
                    {catStatus.statusCat === 'LOST' && (
                      <Button
                        key={`lost-match-button-${catStatus.catStatusId}`}
                        variant="outline-info"
                        size="sm"
                        className="w-100 mt-2"
                        onClick={() => handleShowMatches(cat)}
                        disabled={loadingMatches[cat.catId]}
                      >
                        <FaPaw className="me-2" />
                        {loadingMatches[cat.catId]
                          ? t('reportedCats.loadingMatches', 'Chargement des correspondances...')
                          : matchCounts[cat.catId]
                            ? t('reportedCats.matchCount', { count: matchCounts[cat.catId], defaultValue: `${matchCounts[cat.catId]} correspondance(s)` })
                            : t('reportedCats.noMatches', 'Aucune correspondance')}
                      </Button>
                    )}
                    {catStatus.statusCat === 'FOUND' && (
                      <Button
                        key={`found-match-button-${catStatus.catStatusId}`}
                        variant="outline-info"
                        size="sm"
                        className="w-100 mt-2"
                        onClick={() => handleShowMatchesLost(cat)}
                        disabled={loadingMatches[cat.catId]}
                      >
                        <FaPaw className="me-2" />
                        {loadingMatches[cat.catId]
                          ? t('reportedCats.loadingMatches', 'Chargement des correspondances...')
                          : matchCounts[cat.catId]
                            ? t('reportedCats.matchCount', { count: matchCounts[cat.catId], defaultValue: `${matchCounts[cat.catId]} correspondance(s)` })
                            : t('reportedCats.noMatches', 'Aucune correspondance')}
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
          <Modal.Title>{t('reportedCats.editTitle', 'Modifier les informations du chat')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('reportedCats.name', 'Nom du chat')}</Form.Label>
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
                  <Form.Label>{t('reportedCats.status', 'Statut')}</Form.Label>
                  <Form.Select
                    name="statusCat"
                    value={editForm.statusCat}
                    onChange={handleChange}
                  >
                    <option key="empty" value="">{t('reportedCats.selectStatus', 'Sélectionner un statut')}</option>
                    <option key="lost" value="LOST">{t('reportedCats.lost', 'Perdu')}</option>
                    <option key="found" value="FOUND">{t('reportedCats.found', 'Trouvé')}</option>
                    <option key="own" value="OWN">{t('reportedCats.own', 'Propriétaire')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('reportedCats.breed', 'Race')}</Form.Label>
                  <Form.Select
                    name="breed"
                    value={editForm.breed}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une race</option>
                    <option value="SIAMESE">{t('reportedCats.siamese', 'Siamois')}</option>
                    <option value="PERSIAN">{t('reportedCats.persian', 'Persan')}</option>
                    <option value="MAINE_COON">{t('reportedCats.mainecoon', 'Maine Coon')}</option>
                    <option value="BRITISH_SHORTHAIR">{t('reportedCats.britishshorthair', 'British Shorthair')}</option>
                    <option value="RAGDOLL">{t('reportedCats.ragdoll', 'Ragdoll')}</option>
                    <option value="BENGAL">{t('reportedCats.bengal', 'Bengal')}</option>
                    <option value="SPHYNX">{t('reportedCats.sphynx', 'Sphynx')}</option>
                    <option value="RUSSIAN_BLUE">{t('reportedCats.russianblue', 'Bleu Russe')}</option>
                    <option value="ABYSSINIAN">{t('reportedCats.abyssinian', 'Abyssin')}</option>
                    <option value="SCOTTISH_FOLD">{t('reportedCats.scottishfold', 'Scottish Fold')}</option>
                    <option value="BIRMAN">{t('reportedCats.birman', 'Birman')}</option>
                    <option value="AMERICAN_SHORTHAIR">{t('reportedCats.americanshorthair', 'Américain à poil court')}</option>
                    <option value="NORWEGIAN_FOREST_CAT">{t('reportedCats.norwegianforestcat', 'Chat des forêts norvégiennes')}</option>
                    <option value="EXOTIC_SHORTHAIR">{t('reportedCats.exoticshorthair', 'Exotic Shorthair')}</option>
                    <option value="EUROPEAN_SHORTHAIR">{t('reportedCats.europeanshorthair', 'Européen à poil court')}</option>
                    <option value="OTHER">{t('reportedCats.other', 'Autre')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('reportedCats.color', 'Couleur')}</Form.Label>
                  <Form.Select
                    name="color"
                    value={editForm.color}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une couleur</option>
                    <option value="NOIR">{t('reportedCats.black', 'Noir')}</option>
                    <option value="BLANC">{t('reportedCats.white', 'Blanc')}</option>
                    <option value="GRIS">{t('reportedCats.grey', 'Gris')}</option>
                    <option value="ROUX">{t('reportedCats.red', 'Roux')}</option>
                    <option value="MIXTE">{t('reportedCats.mixed', 'Mixte')}</option>
                    <option value="AUTRE">{t('reportedCats.other', 'Autre')}</option>
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

            <Form.Group className="mb-3">
              <Form.Label>Photos</Form.Label>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                initialImage={editForm.images}
                multiple={true}
                maxImages={5}
                maxSize={5}
                allowedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
                onUploadStatusChange={setIsImageUploading}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={isImageUploading}>
                {isImageUploading && (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                )}
                {isImageUploading ? 'Traitement des images...' : 'Enregistrer'}
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