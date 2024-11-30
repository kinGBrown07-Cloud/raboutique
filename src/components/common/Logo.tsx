import React from 'react';
import { Box, Typography } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Box
      component={Link}
      to="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'primary.main',
        gap: 1,
        '&:hover': {
          opacity: 0.9,
        },
      }}
    >
      <StorefrontIcon sx={{ fontSize: 32 }} />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '0.5px',
        }}
      >
        Ra Boutik
      </Typography>
    </Box>
  );
};

export default Logo;
