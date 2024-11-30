import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  useTheme,
  Divider,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import StorefrontIcon from '@mui/icons-material/Storefront';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    annonces: {
      title: 'Annonces',
      links: [
        { name: 'Publier une Annonce', path: '/creer-annonce' },
        { name: 'Plan Basic', path: '/annonces/basic' },
        { name: 'Plan Standard', path: '/annonces/standard' },
        { name: 'Plan Premium', path: '/annonces/premium' },
        { name: 'Plan Pro', path: '/annonces/pro' },
      ],
    },
    boutique: {
      title: 'Boutique',
      links: [
        { name: 'Nouveautés', path: '/nouveautes' },
        { name: 'Promotions', path: '/promotions' },
        { name: 'Meilleures Ventes', path: '/best-sellers' },
        { name: 'Catégories', path: '/categories' },
      ],
    },
    client: {
      title: 'Mon Compte',
      links: [
        { name: 'Tableau de Bord', path: '/dashboard' },
        { name: 'Mes Annonces', path: '/mes-annonces' },
        { name: 'Mes Commandes', path: '/mes-commandes' },
        { name: 'Mes Favoris', path: '/favoris' },
      ],
    },
    aide: {
      title: 'Aide & Contact',
      links: [
        { name: 'Centre d\'Aide', path: '/aide' },
        { name: 'Nous Contacter', path: '/contact' },
        { name: 'Blog', path: '/blog' },
        { name: 'FAQ', path: '/faq' },
      ],
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo et description */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                color: 'primary.main',
              }}
            >
              <StorefrontIcon sx={{ fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Ra Boutik
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Votre boutique en ligne de confiance pour tous vos achats. Qualité et satisfaction garanties.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': { color: theme.palette.primary.dark },
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': { color: theme.palette.primary.dark },
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': { color: theme.palette.primary.dark },
                }}
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Liens */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              {Object.keys(footerLinks).map((key) => (
                <Grid item xs={6} sm={3} key={key}>
                  <Typography variant="subtitle1" color="text.primary" gutterBottom>
                    {footerLinks[key].title}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {footerLinks[key].links.map((link) => (
                      <Box component="li" key={link.name} sx={{ py: 0.5 }}>
                        <Link href={link.path} color="text.secondary" sx={{ textDecoration: 'none' }}>
                          {link.name}
                        </Link>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {currentYear} Ra Boutik. Tous droits réservés.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
