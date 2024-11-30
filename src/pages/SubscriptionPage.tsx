import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import SubscriptionPlans from '../components/listings/SubscriptionPlans';

const SubscriptionPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 8 }}>
        <Typography
          component="h1"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
          fontWeight="bold"
        >
          Plans d'abonnement
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 6 }}
        >
          Choisissez le plan qui correspond le mieux à vos besoins
        </Typography>
        
        <SubscriptionPlans />
      </Box>
    </Container>
  );
};

export default SubscriptionPage;
