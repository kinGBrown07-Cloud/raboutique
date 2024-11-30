import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Visibility,
  Share,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Listing } from '../../types';

interface ListingActionsProps {
  listing: Listing;
}

export const ListingActions: React.FC<ListingActionsProps> = ({ listing }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/listings/${listing.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement add to cart functionality
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Tooltip title="Voir les détails">
        <IconButton size="small" onClick={handleView}>
          <Visibility />
        </IconButton>
      </Tooltip>

      <Tooltip title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
        <IconButton size="small" onClick={handleFavorite}>
          {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Ajouter au panier">
        <IconButton size="small" onClick={handleAddToCart}>
          <ShoppingCart />
        </IconButton>
      </Tooltip>

      <Tooltip title="Partager">
        <IconButton size="small" onClick={handleShare}>
          <Share />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
