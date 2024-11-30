import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Rating,
  Chip,
  useTheme,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
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
  onToggleFavorite?: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  isNew,
  isOnSale,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
          '& .product-actions': {
            opacity: 1,
          },
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate(`/product/${id}`)}
        />
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 1 }}>
          {isNew && (
            <Chip
              label="Nouveau"
              size="small"
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}
          {isOnSale && (
            <Chip
              label={`-${discount}%`}
              size="small"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        {/* Action Buttons */}
        <Box
          className="product-actions"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
        >
          <IconButton
            size="small"
            sx={{
              bgcolor: 'white',
              '&:hover': { bgcolor: 'white' },
              boxShadow: theme.shadows[2],
            }}
            onClick={() => onToggleFavorite?.(id)}
          >
            {isFavorite ? (
              <FavoriteIcon sx={{ color: theme.palette.secondary.main }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: theme.palette.text.secondary }} />
            )}
          </IconButton>
          <IconButton
            size="small"
            sx={{
              bgcolor: 'white',
              '&:hover': { bgcolor: 'white' },
              boxShadow: theme.shadows[2],
            }}
            onClick={() => onAddToCart?.(id)}
          >
            <ShoppingCartIcon sx={{ color: theme.palette.primary.main }} />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { color: theme.palette.primary.main },
          }}
          onClick={() => navigate(`/product/${id}`)}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={rating} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary">
            ({reviewCount})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </Typography>
          {originalPrice && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              {originalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
