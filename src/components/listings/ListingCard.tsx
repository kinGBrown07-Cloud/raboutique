import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  CardActionArea,
  CardActions,
  Tooltip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { Listing } from '../../types';
import { LISTING_CATEGORIES, LISTING_TYPES } from '../../constants/listings';
import { formatDate } from '../../utils/date';

interface ListingCardProps {
  listing: Listing;
  onFavoriteToggle?: (id: string) => void;
  onShare?: (id: string) => void;
  isFavorite?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onFavoriteToggle,
  onShare,
  isFavorite = false,
}) => {
  const navigate = useNavigate();
  const category = LISTING_CATEGORIES.find(c => c.id === listing.category);
  const type = LISTING_TYPES.find(t => t.id === listing.type);

  const handleClick = () => {
    navigate(`/listings/${listing.id}`);
  };

  const getTypeSpecificInfo = () => {
    switch (listing.type) {
      case 'real_estate':
      case 'agricultural':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {listing.location || 'Emplacement non spécifié'}
            </Typography>
          </Box>
        );
      
      case 'ticket_concert':
      case 'ticket_travel':
      case 'ticket_lottery':
        return (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Date: {listing.specifications?.date || 'Date non spécifiée'}
          </Typography>
        );

      case 'voucher':
        return (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Valable jusqu'au: {listing.specifications?.validUntil || 'Non spécifié'}
          </Typography>
        );

      case 'stock':
        return (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Société: {listing.specifications?.company || 'Non spécifié'}
          </Typography>
        );

      default:
        return null;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <CardActionArea onClick={handleClick}>
        <CardMedia
          component="img"
          height="200"
          image={listing.images[0] || '/placeholder.jpg'}
          alt={listing.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
            <Chip
              label={category?.label || 'Autre'}
              size="small"
              color="primary"
              variant="outlined"
            />
            {type && (
              <Chip
                label={type.label}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Typography variant="h6" component="h2" noWrap>
            {listing.title}
          </Typography>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 1
            }}
          >
            {listing.description}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" color="primary">
              {listing.price.toLocaleString()}€
            </Typography>
            {listing.status === 'verified' && (
              <Tooltip title="Annonce vérifiée">
                <VerifiedIcon color="primary" />
              </Tooltip>
            )}
          </Box>

          {getTypeSpecificInfo()}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Publié le {formatDate(listing.createdAt)}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
        {onFavoriteToggle && (
          <IconButton 
            size="small" 
            onClick={() => onFavoriteToggle(listing.id)}
            color={isFavorite ? 'primary' : 'default'}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        )}
        {onShare && (
          <IconButton size="small" onClick={() => onShare(listing.id)}>
            <ShareIcon />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};