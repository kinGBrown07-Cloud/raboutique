import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  useTheme,
  Avatar,
  alpha,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

interface AnnonceCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  category: string;
  date: string;
  isPremium?: boolean;
  isVerified?: boolean;
  isFavorite?: boolean;
  views: number;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  onToggleFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
}

const AnnonceCard: React.FC<AnnonceCardProps> = ({
  id,
  title,
  description,
  price,
  location,
  images,
  category,
  date,
  isPremium,
  isVerified,
  isFavorite,
  views,
  seller,
  onToggleFavorite,
  onShare,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/annonces/${id}`);
  };

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
        },
        cursor: 'pointer',
      }}
      onClick={handleCardClick}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
        <CardMedia
          component="img"
          height="240"
          image={images[0] || '/placeholder-image.jpg'}
          alt={title}
          sx={{
            objectFit: 'cover',
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/800x600?text=Image+non+disponible';
            target.onerror = null; // Prevent infinite loop
          }}
        />
        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          {isPremium && (
            <Chip
              label="Premium"
              color="primary"
              size="small"
              icon={<VerifiedIcon />}
              sx={{ bgcolor: theme.palette.primary.main }}
            />
          )}
          {isVerified && (
            <Chip
              label="Vérifié"
              color="success"
              size="small"
              icon={<VerifiedIcon />}
            />
          )}
        </Box>
        {/* Actions */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton
            sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'white' } }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(id);
            }}
          >
            {isFavorite ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
          <IconButton
            sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'white' } }}
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(id);
            }}
          >
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title and Price */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" color="primary.main" fontWeight="bold">
            {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </Typography>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {description}
        </Typography>

        {/* Location and Category */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
          </Box>
          <Chip
            label={category}
            size="small"
            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
          />
        </Box>

        {/* Seller Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 'auto',
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={seller.avatar} alt={seller.name}>
              {seller.name[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">{seller.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {`${seller.rating}/5 - ${views} vues`}
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnnonceCard;
