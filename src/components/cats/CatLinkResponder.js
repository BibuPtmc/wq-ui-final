import React, { useState, useEffect } from 'react';
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
  Paper,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  Chip
} from '@mui/material';
import { useCatLink } from '../../hooks/useCatLink';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Composant pour répondre à une demande de liaison
export const CatLinkResponse = ({ requestId, onSuccess, onCancel }) => {
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(true);
  const { respondToLinkRequest, loading, error, successMessage } = useCatLink();

  const handleAccept = async () => {
    const success = await respondToLinkRequest(requestId, "ACCEPTED", comment);
    if (success && onSuccess) {
      // Attendre un peu pour que l'utilisateur puisse voir le message de succès
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    }
  };

  const handleReject = async () => {
    const success = await respondToLinkRequest(requestId, "REJECTED", comment);
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
      <DialogTitle>Répondre à la demande de liaison</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
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
            Un utilisateur pense que ce chat trouvé pourrait être son chat perdu. Veuillez accepter ou refuser cette demande.
          </Typography>
          
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
          onClick={handleReject} 
          variant="outlined" 
          color="error" 
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Refuser
        </Button>
        <Button 
          onClick={handleAccept} 
          variant="contained" 
          color="success" 
          disabled={loading}
          startIcon={<CheckCircleIcon />}
        >
          {loading ? <CircularProgress size={24} /> : "Accepter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Composant pour afficher les demandes de liaison en attente
export const PendingLinkRequests = () => {
  const { fetchPendingRequests, pendingRequests, loading, error } = useCatLink();
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleSuccess = () => {
    fetchPendingRequests();
  };

  if (loading && pendingRequests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
        <Typography variant="body1">
          Vous n'avez aucune demande de liaison en attente.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Demandes de liaison en attente
      </Typography>
      
      <List>
        {pendingRequests.map((request) => (
          <Card key={request.requestId} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Demande #{request.requestId}
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Chat trouvé
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <Typography variant="body2">
                      <strong>Nom:</strong> {request.foundCatStatus.cat.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ID:</strong> {request.foundCatStatus.catStatusId}
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Chat perdu
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1 }}>
                    <Typography variant="body2">
                      <strong>Nom:</strong> {request.lostCatStatus.cat.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ID:</strong> {request.lostCatStatus.catStatusId}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Demandeur
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Nom:</strong> {request.requester.username}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {request.requester.email}
                </Typography>
              </Paper>
              
              {request.comment && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Commentaire
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                    <Typography variant="body2">
                      {request.comment}
                    </Typography>
                  </Paper>
                </>
              )}
              
              <Typography variant="body2" color="text.secondary">
                Demande reçue le {new Date(request.requestDate).toLocaleString()}
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setSelectedRequestId(request.requestId)}
              >
                Répondre à cette demande
              </Button>
            </CardActions>
          </Card>
        ))}
      </List>
      
      {selectedRequestId && (
        <CatLinkResponse 
          requestId={selectedRequestId} 
          onSuccess={handleSuccess}
          onCancel={() => setSelectedRequestId(null)}
        />
      )}
    </Box>
  );
};

// Composant pour afficher les demandes de liaison envoyées
export const SentLinkRequests = () => {
  const { fetchSentRequests, sentRequests, loading, error } = useCatLink();

  useEffect(() => {
    fetchSentRequests();
  }, [fetchSentRequests]);

  if (loading && sentRequests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (sentRequests.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
        <Typography variant="body1">
          Vous n'avez envoyé aucune demande de liaison.
        </Typography>
      </Paper>
    );
  }

  // Fonction pour obtenir la couleur et le texte du statut
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { color: 'warning', text: 'En attente' };
      case 'ACCEPTED':
        return { color: 'success', text: 'Acceptée' };
      case 'REJECTED':
        return { color: 'error', text: 'Refusée' };
      case 'CANCELLED':
        return { color: 'default', text: 'Annulée' };
      default:
        return { color: 'default', text: status };
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Demandes de liaison envoyées
      </Typography>
      
      <List>
        {sentRequests.map((request) => {
          const statusInfo = getStatusInfo(request.status);
          
          return (
            <Card key={request.requestId} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    Demande #{request.requestId}
                  </Typography>
                  <Chip 
                    label={statusInfo.text} 
                    color={statusInfo.color} 
                    size="small"
                  />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Votre chat perdu
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      <Typography variant="body2">
                        <strong>Nom:</strong> {request.lostCatStatus.cat.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>ID:</strong> {request.lostCatStatus.catStatusId}
                      </Typography>
                    </Paper>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Chat trouvé
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      <Typography variant="body2">
                        <strong>Nom:</strong> {request.foundCatStatus.cat.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>ID:</strong> {request.foundCatStatus.catStatusId}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Répondeur
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Nom:</strong> {request.responder.username}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {request.responder.email}
                  </Typography>
                </Paper>
                
                {request.comment && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Commentaire
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
                      <Typography variant="body2">
                        {request.comment}
                      </Typography>
                    </Paper>
                  </>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  Demande envoyée le {new Date(request.requestDate).toLocaleString()}
                </Typography>
                
                {request.responseDate && (
                  <Typography variant="body2" color="text.secondary">
                    Réponse reçue le {new Date(request.responseDate).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </List>
    </Box>
  );
};
