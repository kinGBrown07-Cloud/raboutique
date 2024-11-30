import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { alpha } from '@mui/material/styles';

interface Plan {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  color: 'primary' | 'secondary' | 'info' | 'default';
  popular?: boolean;
}

const plans: Plan[] = [
  {
    title: 'Basic',
    price: '0',
    features: [
      '1 annonce gratuite',
      'Durée de 30 jours',
      'Visibilité standard',
      'Support par email',
    ],
    buttonText: 'Commencer gratuitement',
    color: 'default',
  },
  {
    title: 'Premium',
    price: '29.99',
    features: [
      '10 annonces simultanées',
      'Durée de 60 jours',
      'Mise en avant sur la page d\'accueil',
      'Badge "Premium"',
      'Support prioritaire',
      'Statistiques détaillées',
    ],
    buttonText: 'Choisir Premium',
    color: 'primary',
    popular: true,
  },
  {
    title: 'Pro',
    price: '59.99',
    features: [
      'Annonces illimitées',
      'Durée illimitée',
      'Mise en avant permanente',
      'Badge "Professionnel vérifié"',
      'Support dédié 24/7',
      'Outils marketing avancés',
      'API d\'intégration',
    ],
    buttonText: 'Choisir Pro',
    color: 'secondary',
  },
  {
    title: 'Entreprise',
    price: '199.99',
    features: [
      'Toutes les fonctionnalités Pro',
      'Solutions personnalisées',
      'Gestionnaire de compte dédié',
      'Formation personnalisée',
      'Intégration sur mesure',
      'Reporting avancé',
    ],
    buttonText: 'Contacter les ventes',
    color: 'info',
  },
];

const SubscriptionPlans: React.FC = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} justifyContent="center">
      {plans.map((plan) => (
        <Grid item xs={12} sm={6} md={3} key={plan.title}>
          <Paper
            elevation={plan.popular ? 8 : 1}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: theme.shadows[plan.popular ? 12 : 4],
              },
              ...(plan.popular && {
                borderColor: theme.palette[plan.color].main,
                borderWidth: 2,
                borderStyle: 'solid',
                backgroundColor: alpha(theme.palette[plan.color].main, 0.02),
              }),
            }}
          >
            {plan.popular && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: 24,
                  backgroundColor: theme.palette[plan.color].main,
                  color: theme.palette[plan.color].contrastText,
                  py: 0.5,
                  px: 2,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  boxShadow: theme.shadows[2],
                }}
              >
                <StarIcon fontSize="small" />
                <Typography variant="caption" fontWeight="bold">
                  POPULAIRE
                </Typography>
              </Box>
            )}

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                {plan.title}
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Typography variant="h3" component="p" color={plan.color} fontWeight="bold">
                    {plan.price}
                  </Typography>
                  <Typography variant="h5" color={plan.color} sx={{ mt: 1 }}>
                    €
                  </Typography>
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                  par mois
                </Typography>
              </Box>

              <List sx={{ mb: 3, flexGrow: 1 }}>
                {plan.features.map((feature) => (
                  <ListItem key={feature} sx={{ py: 1, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon 
                        sx={{ 
                          color: plan.popular ? theme.palette[plan.color].main : theme.palette.success.main,
                          fontSize: '1.2rem'
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Button
                variant={plan.popular ? 'contained' : 'outlined'}
                color={plan.color}
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  ...(plan.popular && {
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                    },
                  }),
                }}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default SubscriptionPlans;
