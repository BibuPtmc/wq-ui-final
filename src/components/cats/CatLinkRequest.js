import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { useCatLink } from '../../hooks/useCatLink';

// Composant pour créer une demande de liaison entre un chat perdu et un chat trouvé
export const CatLinkRequest = ({ lostCatStatusId, onSuccess, onCancel }) => {
  const [foundCatId, setFoundCatId] = useState('');
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(true);
  const { createLinkRequest, loading, error, successMessage } = useCatLink();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foundCatId.trim()) {
      return;
    }
    
    // Extraire l'ID numérique si l'utilisateur a inclus le préfixe #
    const cleanId = foundCatId.startsWith('#') ? foundCatId.substring(1) : foundCatId;
    const foundCatStatusId = parseInt(cleanId, 10);
    
    if (isNaN(foundCatStatusId)) {
      return;
    }
    
    const success = await createLinkRequest(lostCatStatusId, foundCatStatusId, comment);
    if (success && onSuccess) {
      // Attendre un peu pour que l'utilisateur puisse voir le message de succès
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Lier votre chat perdu à un chat trouvé</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Entrez l'ID du chat trouvé qui vous a été communiqué par la personne qui l'a trouvé.
          </Typography>
          
          <TextField
            label="ID du chat trouvé"
            placeholder="Par exemple: #12345"
            fullWidth
            value={foundCatId}
            onChange={(e) => setFoundCatId(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Commentaire (optionnel)"
            placeholder="Ajoutez des informations supplémentaires ici"
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading || !foundCatId.trim()}
        >
          {loading ? <CircularProgress size={24} /> : "Envoyer la demande"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Composant pour afficher un bouton qui ouvre la boîte de dialogue de demande de liaison
export const CatLinkRequestButton = ({ lostCatStatusId, onSuccess }) => {
  const [showDialog, setShowDialog] = useState(false);
  
  return (
    <>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setShowDialog(true)}
        sx={{ mt: 1 }}
      >
        Lier à un chat trouvé
      </Button>
      
      {showDialog && (
        <CatLinkRequest 
          lostCatStatusId={lostCatStatusId} 
          onSuccess={onSuccess}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  );
};

// Composant pour afficher l'ID unique d'un chat trouvé
export const CatFoundIdDisplay = ({ catStatusId }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mt: 2, 
        mb: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Typography variant="body1" sx={{ mb: 1 }}>
        ID unique de ce chat trouvé :
      </Typography>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold', 
          color: 'primary.main',
          fontFamily: 'monospace'
        }}
      >
        #{catStatusId}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
        Communiquez cet ID au propriétaire potentiel pour qu'il puisse lier son rapport de chat perdu à ce chat trouvé.
      </Typography>
    </Paper>
  );
};
