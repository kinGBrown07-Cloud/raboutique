import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  Paper,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { ListingFilter } from '../../types';

interface ListingFiltersProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: ListingFilter) => void;
}

export function ListingFilters({ onSearch, onFilter }: ListingFiltersProps) {
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(event.target.value);
  };

  const handleTypeChange = (event: any) => {
    onFilter?.({ type: event.target.value });
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Rechercher..."
          variant="outlined"
          size="small"
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, minWidth: { xs: '100%', md: 'auto' } }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              label="Type"
              defaultValue=""
              onChange={handleTypeChange}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="product">Produits</MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="event">Événements</MenuItem>
              <MenuItem value="ticket">Tickets</MenuItem>
              <MenuItem value="voucher">Bons</MenuItem>
            </Select>
          </FormControl>
          
          <IconButton
            color="primary"
            onClick={() => onFilter?.({})}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}