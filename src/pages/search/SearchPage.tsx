import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
  Drawer,
  useTheme,
  useMediaQuery,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Tune as TuneIcon,
  LocationOn as LocationIcon,
  Euro as EuroIcon,
} from '@mui/icons-material';
import { useListingsSearch } from '../../hooks/useListingsSearch';
import { useNotification } from '../../hooks/useNotification';
import { ListingCard } from '../../components/listings/ListingCard';
import { LISTING_CATEGORIES, LISTING_TYPES } from '../../constants/listings';
import { ListingCategory, ListingType } from '../../types';
import { debounce } from '../../utils/debounce';

const ITEMS_PER_PAGE = 12;

interface SearchFilters {
  categories: ListingCategory[];
  types: ListingType[];
  minPrice: number;
  maxPrice: number;
  location: string;
  sortBy: string;
  onlyWithImages: boolean;
}

const initialFilters: SearchFilters = {
  categories: [],
  types: [],
  minPrice: 0,
  maxPrice: 1000000,
  location: '',
  sortBy: 'newest',
  onlyWithImages: false,
};

const sortOptions = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

const SearchPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { notify } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { listings, totalItems, loading, error, search } = useListingsSearch(ITEMS_PER_PAGE);

  const debouncedSearch = useMemo(
    () => debounce((term: string, currentFilters: SearchFilters, currentPage: number) => {
      search(term, currentFilters, currentPage);
    }, 300),
    [search]
  );

  useEffect(() => {
    debouncedSearch(searchTerm, filters, page);
    return () => debouncedSearch.cancel();
  }, [searchTerm, filters, page]);

  const handleFilterChange = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleCategoryToggle = (category: ListingCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleTypeToggle = (type: ListingType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'categories' || key === 'types') {
      return count + (value as any[]).length;
    }
    if (key === 'minPrice' && value > 0) count++;
    if (key === 'maxPrice' && value < 1000000) count++;
    if (key === 'location' && value !== '') count++;
    if (key === 'onlyWithImages' && value) count++;
    return count;
  }, 0);

  const FiltersContent = () => (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Filtres
        {activeFiltersCount > 0 && (
          <Chip
            size="small"
            label={activeFiltersCount}
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Catégories</Typography>
        <FormGroup>
          {LISTING_CATEGORIES.map(category => (
            <FormControlLabel
              key={category.id}
              control={
                <Checkbox
                  checked={filters.categories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body2">{category.label}</Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>Types de produits</Typography>
        <FormGroup>
          {LISTING_TYPES.map(type => (
            <FormControlLabel
              key={type.id}
              control={
                <Checkbox
                  checked={filters.types.includes(type.id)}
                  onChange={() => handleTypeToggle(type.id)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body2">{type.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(type.commission * 100).toFixed(0)}% comm.
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>Prix (€)</Typography>
        <Slider
          value={[filters.minPrice, filters.maxPrice]}
          onChange={(_, value) => {
            const [min, max] = value as number[];
            handleFilterChange('minPrice', min);
            handleFilterChange('maxPrice', max);
          }}
          valueLabelDisplay="auto"
          min={0}
          max={1000000}
          step={1000}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption">
            {filters.minPrice.toLocaleString()}€
          </Typography>
          <Typography variant="caption">
            {filters.maxPrice.toLocaleString()}€
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>Localisation</Typography>
        <TextField
          fullWidth
          size="small"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          placeholder="Ville, région..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>Options</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.onlyWithImages}
              onChange={(e) => handleFilterChange('onlyWithImages', e.target.checked)}
              size="small"
            />
          }
          label="Uniquement avec photos"
        />
      </Box>

      {isMobile && (
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setDrawerOpen(false)}
          >
            Appliquer les filtres
          </Button>
        </Box>
      )}
    </Box>
  );

  if (error) {
    notify('Erreur lors de la recherche des annonces', 'error');
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Barre de recherche */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Trier par</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    label="Trier par"
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                {isMobile ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TuneIcon />}
                    onClick={() => setDrawerOpen(true)}
                    endIcon={
                      activeFiltersCount > 0 && (
                        <Chip
                          size="small"
                          label={activeFiltersCount}
                          color="primary"
                        />
                      )
                    }
                  >
                    Filtres
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Filtres */}
        {!isMobile && showFilters && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ height: '100%' }}>
              <FiltersContent />
            </Paper>
          </Grid>
        )}

        {/* Résultats */}
        <Grid item xs={12} md={showFilters ? 9 : 12}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>Chargement...</Typography>
            </Box>
          ) : listings.length > 0 ? (
            <Grid container spacing={2}>
              {listings.map(listing => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={listing.id}>
                  <ListingCard listing={listing} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Aucune annonce trouvée
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  Essayez de modifier vos critères de recherche
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Drawer pour les filtres sur mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: '100%', maxWidth: 360 }
        }}
      >
        <FiltersContent />
      </Drawer>
    </Container>
  );
};

export default SearchPage;
