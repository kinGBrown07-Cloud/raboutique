import React from 'react';
import {
  Box,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const categories = [
  { id: 'vetements', name: 'Vêtements', count: 120 },
  { id: 'chaussures', name: 'Chaussures', count: 85 },
  { id: 'accessoires', name: 'Accessoires', count: 65 },
  { id: 'beaute', name: 'Beauté', count: 45 },
];

const brands = [
  { id: 'brand1', name: 'Marque 1', count: 45 },
  { id: 'brand2', name: 'Marque 2', count: 38 },
  { id: 'brand3', name: 'Marque 3', count: 32 },
  { id: 'brand4', name: 'Marque 4', count: 28 },
  { id: 'brand5', name: 'Marque 5', count: 25 },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const colors = [
  { name: 'Noir', value: '#000000' },
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Rouge', value: '#FF0000' },
  { name: 'Bleu', value: '#0000FF' },
  { name: 'Vert', value: '#00FF00' },
  { name: 'Jaune', value: '#FFFF00' },
];

const ProductFilters: React.FC = () => {
  const [priceRange, setPriceRange] = React.useState<number[]>([0, 200]);
  const [expanded, setExpanded] = React.useState<string | false>('categories');

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Filtres
      </Typography>

      {/* Categories */}
      <Accordion
        expanded={expanded === 'categories'}
        onChange={handleAccordionChange('categories')}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Catégories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {categories.map((category) => (
              <FormControlLabel
                key={category.id}
                control={<Checkbox />}
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="body2">{category.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({category.count})
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* Price Range */}
      <Accordion
        expanded={expanded === 'price'}
        onChange={handleAccordionChange('price')}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Prix</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={200}
              step={10}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2">
                {priceRange[0]}€
              </Typography>
              <Typography variant="body2">
                {priceRange[1]}€
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* Brands */}
      <Accordion
        expanded={expanded === 'brands'}
        onChange={handleAccordionChange('brands')}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Marques</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {brands.map((brand) => (
              <FormControlLabel
                key={brand.id}
                control={<Checkbox />}
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="body2">{brand.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({brand.count})
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* Sizes */}
      <Accordion
        expanded={expanded === 'sizes'}
        onChange={handleAccordionChange('sizes')}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Tailles</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {sizes.map((size) => (
              <Button
                key={size}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: 1,
                }}
              >
                {size}
              </Button>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* Colors */}
      <Accordion
        expanded={expanded === 'colors'}
        onChange={handleAccordionChange('colors')}
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={500}>Couleurs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {colors.map((color) => (
              <Button
                key={color.value}
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: color.value,
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: color.value,
                  },
                }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
        <Button variant="contained" fullWidth>
          Appliquer
        </Button>
        <Button variant="outlined" fullWidth>
          Réinitialiser
        </Button>
      </Box>
    </Box>
  );
};

export default ProductFilters;
