import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  useTheme,
  CardMedia,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

const subscriptionPlans = [
  {
    title: 'Basic',
    price: '0',
    features: [
      '1 annonce gratuite',
      'Visibilité 30 jours',
      'Support par email',
      'Photos standard',
    ],
    buttonText: 'Commencer Gratuitement',
    popular: false,
  },
  {
    title: 'Standard',
    price: '9.99',
    features: [
      '5 annonces par mois',
      'Visibilité 60 jours',
      'Support prioritaire',
      'Photos HD',
      'Stats basiques',
    ],
    buttonText: 'Choisir Standard',
    popular: true,
  },
  {
    title: 'Premium',
    price: '19.99',
    features: [
      '15 annonces par mois',
      'Visibilité illimitée',
      'Support VIP',
      'Photos HD + Vidéos',
      'Stats avancées',
      'Badge vérifié',
    ],
    buttonText: 'Choisir Premium',
    popular: false,
  },
  {
    title: 'Pro',
    price: '49.99',
    features: [
      'Annonces illimitées',
      'Visibilité premium',
      'Support dédié 24/7',
      'Contenu multimédia illimité',
      'Stats en temps réel',
      'API access',
      'Personnalisation avancée',
    ],
    buttonText: 'Contacter Commercial',
    popular: false,
  },
];

const featuredAds = [
  {
    id: 1,
    title: 'Villa de Luxe - Vue Mer',
    image: 'https://source.unsplash.com/random/800x400?luxury+house',
    price: '1,250,000 €',
    location: 'Côte d\'Azur',
    badge: 'Premium',
  },
  {
    id: 2,
    title: 'Appartement Centre-Ville',
    image: 'https://source.unsplash.com/random/800x400?apartment',
    price: '450,000 €',
    location: 'Paris',
    badge: 'Vedette',
  },
  // Ajoutez plus d'annonces en vedette ici
];

const topProducts = [
  {
    id: 1,
    title: 'Montre Connectée Pro',
    image: 'https://source.unsplash.com/random/400x300?smartwatch',
    price: '299 €',
    sales: '1.2k vendus',
  },
  {
    id: 2,
    title: 'Sac Designer Edition',
    image: 'https://source.unsplash.com/random/400x300?luxury+bag',
    price: '899 €',
    sales: '850 vendus',
  },
  // Ajoutez plus de produits populaires ici
];

const featuredBlogs = [
  {
    id: 1,
    title: 'Les Tendances Immobilières 2024',
    image: 'https://source.unsplash.com/random/400x300?real+estate',
    author: 'Marie Laurent',
    date: '15 Jan 2024',
  },
  {
    id: 2,
    title: 'Guide du Vendeur Premium',
    image: 'https://source.unsplash.com/random/400x300?business',
    author: 'Jean Dubois',
    date: '12 Jan 2024',
  },
  // Ajoutez plus d'articles de blog ici
];

const AnnoncesPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: 400,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 6,
        }}
      >
        <Box
          component="img"
          src="https://source.unsplash.com/random/1600x900?luxury"
          alt="Hero"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
            p: 4,
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Publiez Vos Annonces
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Choisissez le plan qui vous convient et commencez à vendre
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Créer une Annonce
          </Button>
        </Box>
      </Box>

      {/* Plans d'abonnement */}
      <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
        Nos Plans
      </Typography>
      <Typography variant="subtitle1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
        Des solutions adaptées à tous vos besoins
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {subscriptionPlans.map((plan) => (
          <Grid item xs={12} md={3} key={plan.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transform: plan.popular ? 'scale(1.05)' : 'none',
                boxShadow: plan.popular ? theme.shadows[10] : theme.shadows[1],
              }}
            >
              {plan.popular && (
                <Chip
                  label="Plus Populaire"
                  color="secondary"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 24,
                    zIndex: 1,
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h3" gutterBottom>
                  {plan.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                  <Typography variant="h3" component="span">
                    {plan.price}
                  </Typography>
                  <Typography variant="subtitle1" component="span" sx={{ ml: 1 }}>
                    € /mois
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  {plan.features.map((feature) => (
                    <Box
                      key={feature}
                      sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                    >
                      <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant={plan.popular ? 'contained' : 'outlined'}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Annonces en Vedette */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
        Annonces en Vedette
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {featuredAds.map((ad) => (
          <Grid item xs={12} md={6} key={ad.id}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={ad.image}
                alt={ad.title}
              />
              <CardContent>
                <Chip
                  label={ad.badge}
                  color="primary"
                  icon={<StarIcon />}
                  sx={{ mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {ad.title}
                </Typography>
                <Typography variant="h5" color="primary.main" gutterBottom>
                  {ad.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ad.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Produits Populaires */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
        Produits qui Cartonnent
      </Typography>
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {topProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.title}
                </Typography>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  {product.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {product.sales}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Articles de Blog */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
        Articles à la Une
      </Typography>
      <Grid container spacing={3}>
        {featuredBlogs.map((blog) => (
          <Grid item xs={12} sm={6} key={blog.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={blog.image}
                alt={blog.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {blog.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Par {blog.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {blog.date}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AnnoncesPage;
