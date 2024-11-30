import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  SelectChangeEvent,
  TextField,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';

// Types
interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isOnSale?: boolean;
  isFavorite?: boolean;
}

// Mock data
const mockProducts: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: `product-${i + 1}`,
  title: `Produit ${i + 1}`,
  price: 29.99 + i * 10,
  originalPrice: (i % 3 === 0) ? (29.99 + i * 10) * 1.2 : undefined,
  image: `https://source.unsplash.com/random/400x300?product&sig=${i}`,
  rating: 3.5 + Math.random() * 1.5,
  reviewCount: Math.floor(Math.random() * 500),
  isNew: i % 5 === 0,
  isOnSale: i % 3 === 0,
  isFavorite: i % 4 === 0,
}));

const ProductsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products] = useState<Product[]>(mockProducts);
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const addToCart = (productId: string) => {
    setCartItems(prev => new Set(prev).add(productId));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">
          Accueil
        </Link>
        <Typography color="text.primary">Produits</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nos Produits
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Découvrez notre sélection de produits de qualité
        </Typography>
      </Box>

      {/* Filters and Sort */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setIsFilterDrawerOpen(true)}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          Filtres
        </Button>

        <Box sx={{ display: { xs: 'none', md: 'block' }, width: 240 }}>
          <ProductFilters />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between' }}>
            <TextField
              size="small"
              placeholder="Rechercher un produit..."
              sx={{ width: { xs: '100%', sm: 300 } }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Trier par</InputLabel>
              <Select value={sortBy} onChange={handleSortChange} label="Trier par">
                <MenuItem value="popularity">Popularité</MenuItem>
                <MenuItem value="price_asc">Prix croissant</MenuItem>
                <MenuItem value="price_desc">Prix décroissant</MenuItem>
                <MenuItem value="newest">Plus récent</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Products Grid */}
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <ProductCard
                  {...product}
                  isFavorite={favorites.has(product.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={addToCart}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={10}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        </Box>
      </Box>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <ProductFilters />
        </Box>
      </Drawer>
    </Container>
  );
};

export default ProductsPage;
