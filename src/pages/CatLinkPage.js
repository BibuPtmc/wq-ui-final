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
import { useAuth } from '../hooks/authProvider';
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
            {t('catLink.authRequired')}
          </Typography>
          <Typography variant="body1">
            {t('catLink.authRequiredText')}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('catLink.title')}
      </Typography>
      
      <Typography variant="body1" paragraph>
        {t('catLink.intro')}
      </Typography>
      
      <Paper sx={{ width: '100%', mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={t('catLink.tabReceived')} />
          <Tab label={t('catLink.tabSent')} />
        </Tabs>
        
        <Divider />
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {t('catLink.receivedDesc')}
          </Typography>
          <PendingLinkRequests />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" paragraph>
            {t('catLink.sentDesc')}
          </Typography>
          <SentLinkRequests />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default CatLinkPage;
