import React from 'react';
import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <StorefrontIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Large Sélection',
      description: 'Des milliers de produits soigneusement sélectionnés pour vous.',
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Livraison Rapide',
      description: 'Livraison rapide et sécurisée partout dans le pays.',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Support 24/7',
      description: 'Une équipe dédiée à votre service pour vous accompagner.',
    },
  ];

  const backgroundImage = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80";

  return (
    <Box>
      {/* Hero Section with Background */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '80vh', md: '90vh' },
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.6)',
            zIndex: -1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
            zIndex: -1,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={8} lg={7}>
              <Box
                sx={{
                  p: { xs: 3, md: 6 },
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 2,
                  transform: 'translateY(-2rem)',
                }}
              >
                <Typography
                  component="h1"
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  Ra Boutik
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mb: 4,
                    fontWeight: 500,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                  }}
                >
                  Votre boutique en ligne de confiance
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    maxWidth: '600px',
                    lineHeight: 1.6,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Découvrez une expérience shopping unique avec une large sélection de produits
                  de qualité et un service client exceptionnel.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    Commencer Maintenant
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    En Savoir Plus
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container
        maxWidth="lg"
        sx={{
          py: 8,
          mt: -8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => theme.shadows[4],
                  },
                  backgroundColor: 'white',
                  borderRadius: 2,
                }}
              >
                {feature.icon}
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    mb: 1,
                    color: 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;