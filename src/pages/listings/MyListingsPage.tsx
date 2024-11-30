import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status: 'active' | 'sold' | 'expired';
}

// Mock data - à remplacer par des appels API réels
const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Tracteur John Deere',
    description: 'Excellent état, peu utilisé',
    price: 45000,
    imageUrl: 'https://placehold.co/600x400',
    status: 'active',
  },
  {
    id: '2',
    title: 'Moissonneuse-batteuse',
    description: 'Parfait pour les grandes exploitations',
    price: 75000,
    imageUrl: 'https://placehold.co/600x400',
    status: 'active',
  },
];

const MyListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setListings(MOCK_LISTINGS);
      } catch (err) {
        setError('Erreur lors du chargement de vos annonces');
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleCreateListing = () => {
    navigate('/listings/create');
  };

  const handleEditListing = (listingId: string) => {
    navigate(`/listings/${listingId}/edit`);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 500));
        setListings(listings.filter(listing => listing.id !== listingId));
      } catch (err) {
        setError('Erreur lors de la suppression de l\'annonce');
        console.error('Error deleting listing:', err);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Mes Annonces
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateListing}
        >
          Créer une annonce
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={listing.imageUrl}
                alt={listing.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {listing.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {listing.description}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {listing.price.toLocaleString('fr-FR')} €
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleEditListing(listing.id)}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteListing(listing.id)}
                  >
                    Supprimer
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {listings.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Vous n'avez pas encore d'annonces
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateListing}
            sx={{ mt: 2 }}
          >
            Créer ma première annonce
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MyListingsPage;
