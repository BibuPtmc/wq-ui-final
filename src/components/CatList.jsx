import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../hooks/useAxios';
import useCatMatches from '../hooks/useCatMatches';
import { Card, CardContent, Typography, Button, Grid, CircularProgress, Box } from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CatList = ({ type }) => {
  const navigate = useNavigate();
  const axios = useAxios();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { matchCounts, loadingMatches, fetchMatchesForCats } = useCatMatches(type);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const endpoint = type === 'found' ? '/cat/foundCats' : '/cat/lostCats';
        const response = await axios.get(endpoint);
        setCats(response || []);
        // Récupérer les correspondances pour tous les chats
        fetchMatchesForCats(response || []);
      } catch (error) {
        console.error(`Erreur lors de la récupération des chats ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchCats();
  }, [axios, type, fetchMatchesForCats]);

  const handleCatClick = (catId) => {
    navigate(`/cat/${type}/${catId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {cats.map((catStatus) => (
        <Grid item xs={12} sm={6} md={4} key={catStatus.cat.catId}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
            onClick={() => handleCatClick(catStatus.cat.catId)}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {catStatus.cat.name || 'Sans nom'}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {format(new Date(catStatus.cat.date), 'dd MMMM yyyy', { locale: fr })}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {catStatus.cat.description}
              </Typography>
              {loadingMatches[catStatus.cat.catId] ? (
                <CircularProgress size={20} sx={{ mt: 1 }} />
              ) : (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  {matchCounts[catStatus.cat.catId] || 0} correspondance(s) potentielle(s)
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CatList; 