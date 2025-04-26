import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Divider 
} from '@mui/material';
import { PendingLinkRequests, SentLinkRequests } from '../components/cats/CatLinkResponder';
import { useAuth } from '../contexts/authProvider';
import { useTranslation } from 'react-i18next';

// Composant TabPanel pour afficher le contenu des onglets
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cat-link-tabpanel-${index}`}
      aria-labelledby={`cat-link-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Page principale pour gérer les demandes de liaison entre chats perdus et trouvés
const CatLinkPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {t('catLink.authRequired', 'Vous devez être connecté pour accéder à cette page.')}
          </Typography>
          <Typography variant="body1">
            {t('catLink.authRequiredText', 'Veuillez vous connecter pour voir et gérer vos demandes de liaison entre chats perdus et trouvés.')}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('catLink.title', 'Gestion des demandes de liaison')}
      </Typography>
      
      <Typography variant="body1" paragraph>
        {t('catLink.intro', 'Cette page vous permet de gérer les demandes de liaison entre chats perdus et trouvés. Vous pouvez voir les demandes que vous avez envoyées et répondre aux demandes que vous avez reçues.')}
      </Typography>
      
      <Paper sx={{ width: '100%', mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={t('catLink.tabReceived', 'Demandes reçues')} />
          <Tab label={t('catLink.tabSent', 'Demandes envoyées')} />
        </Tabs>
        
        <Divider />
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {t('catLink.receivedDesc', 'Voici les demandes de liaison en attente de votre réponse. Ces demandes ont été envoyées par des utilisateurs qui pensent que leur chat perdu correspond à un chat que vous avez signalé comme trouvé.')}
          </Typography>
          <PendingLinkRequests />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" paragraph>
            {t('catLink.sentDesc', 'Voici les demandes de liaison que vous avez envoyées. Vous pouvez suivre leur statut ici.')}
          </Typography>
          <SentLinkRequests />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default CatLinkPage;
