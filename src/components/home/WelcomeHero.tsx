import React from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const WelcomeHero = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12}>
            <Typography
              component="h1"
              variant="h2"
              color="primary"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: 4,
              }}
            >
              Bienvenue sur REMag
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              paragraph
              sx={{ mb: 4 }}
            >
              La plateforme de référence pour la gestion et le monitoring
              de vos performances agricoles en Afrique.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Accéder au Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
            >
              Se connecter
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default WelcomeHero;
