import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Popper,
  Paper,
  ClickAwayListener,
  InputBase,
  Fade,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';

const popularSearches = [
  'Appartement Paris',
  'iPhone 13',
  'Voiture occasion',
  'Meuble design',
];

const SearchDropdown = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const anchorRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const handleSearch = (query: string) => {
    navigate(`/annonces?search=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        sx={{
          color: 'inherit',
          '&:hover': { color: 'primary.main' },
        }}
      >
        <SearchIcon />
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        sx={{ zIndex: theme.zIndex.appBar + 1 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={3}
              sx={{
                width: 400,
                maxWidth: '100vw',
                mt: 1,
                overflow: 'hidden',
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Barre de recherche */}
                  <Box sx={{ p: 2, pb: 1 }}>
                    <InputBase
                      autoFocus
                      fullWidth
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                      }}
                    />
                  </Box>

                  <Divider />

                  {/* Recherches populaires */}
                  <Box sx={{ py: 1 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ px: 2, py: 1 }}
                    >
                      Recherches populaires
                    </Typography>
                    <List dense>
                      {popularSearches.map((search) => (
                        <ListItem
                          key={search}
                          button
                          onClick={() => handleSearch(search)}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <TrendingUpIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={search} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Divider />

                  {/* Recherches récentes */}
                  <Box sx={{ py: 1 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ px: 2, py: 1 }}
                    >
                      Recherches récentes
                    </Typography>
                    <List dense>
                      {['Studio Paris 15', 'MacBook Pro', 'Vélo électrique'].map(
                        (search) => (
                          <ListItem
                            key={search}
                            button
                            onClick={() => handleSearch(search)}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <HistoryIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={search} />
                          </ListItem>
                        )
                      )}
                    </List>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default SearchDropdown;
