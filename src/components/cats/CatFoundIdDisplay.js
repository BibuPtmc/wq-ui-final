import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Composant pour afficher l'ID unique d'un chat trouvé avec la possibilité de le copier
 */
const CatFoundIdDisplay = ({ catStatusId }) => {
  const [copied, setCopied] = useState(false);

  // Réinitialiser l'état de copie après 2 secondes
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Fonction pour copier l'ID dans le presse-papier
  const handleCopy = () => {
    navigator.clipboard.writeText(catStatusId.toString());
    setCopied(true);
  };

  if (!catStatusId) return null;

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        ID Unique du Chat Trouvé
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Partagez cet ID avec le propriétaire d'un chat perdu pour qu'il puisse créer une demande de liaison.
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 1.5, 
            flex: 1, 
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            mr: 1
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            {catStatusId}
          </Typography>
        </Paper>
        <Button
          variant="contained"
          color={copied ? "success" : "primary"}
          startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
          onClick={handleCopy}
          size="small"
        >
          {copied ? "Copié !" : "Copier"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CatFoundIdDisplay;
