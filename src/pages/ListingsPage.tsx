import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Paper,
  Tab,
  Tabs,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import AnnonceCard from '../components/listings/AnnonceCard';
import SubscriptionPlans from '../components/listings/SubscriptionPlans';
import { useSearchParams } from 'react-router-dom';

// Types
interface Annonce {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  category: string;
  date: string;
  isPremium: boolean;
  isVerified: boolean;
  views: number;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
}

// Mock featured listings
const featuredListings: Annonce[] = Array.from({ length: 4 }, (_, i) => ({
  id: `featured-${i + 1}`,
  title: `Annonce Premium ${i + 1}`,
  description: 'Annonce mise en avant avec une excellente visibilité et des résultats garantis.',
  price: 5000 + i * 1000,
  location: 'Paris, France',
  images: [`https://picsum.photos/seed/featured${i}/800/600`],
  category: 'Premium',
  date: '2024-01-15',
  isPremium: true,
  isVerified: true,
  views: 500 + i * 50,
  seller: {
    id: `seller-premium-${i}`,
    name: `Vendeur Premium ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    rating: 4.8 + (Math.random() * 0.2),
  },
}));

// Mock regular listings
const regularListings: Annonce[] = Array.from({ length: 8 }, (_, i) => ({
  id: `regular-${i + 1}`,
  title: `Annonce Standard ${i + 1}`,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  price: 1000 + i * 500,
  location: 'Paris, France',
  images: [`https://picsum.photos/seed/regular${i}/800/600`],
  category: i % 2 === 0 ? 'Immobilier' : 'Véhicules',
  date: '2024-01-15',
  isPremium: false,
  isVerified: i % 3 === 0,
  views: 100 + i * 10,
  seller: {
    id: `seller-${i}`,
    name: `Vendeur ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
    rating: 4 + Math.random(),
  },
}));

const categories = [
  'Toutes les catégories',
  'Immobilier',
  'Véhicules',
  'Emploi',
  'Mode',
  'Multimédia',
  'Services',
  'Loisirs',
];

const sortOptions = [
  { value: 'date-desc', label: 'Plus récentes' },
  { value: 'date-asc', label: 'Plus anciennes' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'views-desc', label: 'Plus vues' },
];

const ListingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(0);

  // Mettre à jour searchTerm quand l'URL change
  React.useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    // Mettre à jour l'URL avec le nouveau terme de recherche
    if (newSearchTerm) {
      searchParams.set('search', newSearchTerm);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const handleShare = (id: string) => {
    // Implement share functionality
    console.log('Share annonce:', id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Tabs */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Annonces
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Découvrez les meilleures annonces de notre communauté
        </Typography>
        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon={<LocalOfferIcon />}
              label="Toutes les annonces"
              iconPosition="start"
            />
            <Tab
              icon={<NewReleasesIcon />}
              label="Plans d'abonnement"
              iconPosition="start"
            />
          </Tabs>
        </Paper>
      </Box>

      {activeTab === 0 ? (
        <>
          {/* Search and Filters */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Rechercher une annonce..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Catégorie"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Trier par</InputLabel>
                  <Select
                    value={sortBy}
                    label="Trier par"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {/* Navigate to create listing */}}
                >
                  Publier
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Featured Listings Section */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" component="h2">
                Annonces Premium
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {featuredListings.map((annonce) => (
                <Grid item xs={12} sm={6} md={3} key={annonce.id}>
                  <AnnonceCard
                    {...annonce}
                    isFavorite={favorites.has(annonce.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onShare={handleShare}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Regular Listings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
              Toutes les annonces
            </Typography>
            <Grid container spacing={3}>
              {regularListings.map((annonce) => (
                <Grid item xs={12} sm={6} md={3} key={annonce.id}>
                  <AnnonceCard
                    {...annonce}
                    isFavorite={favorites.has(annonce.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onShare={handleShare}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={10}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>

          {/* Mobile Filter Drawer */}
          {isMobile && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: theme.zIndex.fab,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsFilterDrawerOpen(true)}
                startIcon={<TuneIcon />}
              >
                Filtres
              </Button>
            </Box>
          )}

          <Drawer
            anchor="right"
            open={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
          >
            <Box sx={{ width: 300, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Filtres
              </Typography>
              {/* Add filter options */}
            </Box>
          </Drawer>
        </>
      ) : (
        <Box>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Plans d'abonnement
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Choisissez le plan qui correspond à vos besoins
          </Typography>
          <SubscriptionPlans />
        </Box>
      )}
    </Container>
  );
};

export default ListingsPage;
