import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useListingStore } from '../../store/useListingStore';
import { ListingType, ListingCategory, Listing } from '../../types';
import { LISTING_CATEGORIES, LISTING_TYPES, getCommissionRate } from '../../constants/listings';
import { ImageUpload } from '../../components/common/ImageUpload';
import { useNotification } from '../../hooks/useNotification';

interface CreateListingData {
  title: string;
  description: string;
  price: number;
  type: ListingType;
  category: ListingCategory;
  location?: string;
  specifications: Record<string, any>;
}

const steps = ['Type de produit', 'Informations générales', 'Images', 'Validation'];

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { createListing, isLoading } = useListingStore();
  const [activeStep, setActiveStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateListingData>({
    title: '',
    description: '',
    price: 0,
    type: 'product',
    category: 'other',
    specifications: {},
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'type') {
        const listingType = LISTING_TYPES.find(t => t.id === value);
        return {
          ...prev,
          [name]: value,
          category: listingType?.category || 'other',
        };
      }
      return {
        ...prev,
        [name]: name === 'price' ? parseFloat(value) || 0 : value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const commission = getCommissionRate(formData.type);
      await createListing({
        ...formData,
        images,
        commission,
        currency: 'EUR',
        status: 'pending',
      });
      notify('Annonce créée avec succès', 'success');
      navigate('/dashboard/listings');
    } catch (error) {
      notify('Erreur lors de la création de l\'annonce', 'error');
      console.error('Failed to create listing:', error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth>
            <InputLabel>Type de produit</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {LISTING_TYPES.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label} ({(type.commission * 100).toFixed(0)}% de commission)
                </MenuItem>
              ))}
            </Select>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Commission applicable : {(getCommissionRate(formData.type) * 100).toFixed(0)}%
            </Typography>
          </FormControl>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: '€',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Localisation"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Ajoutez jusqu'à 5 images. La première image sera l'image principale.
            </Typography>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Récapitulatif de l'annonce
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography><strong>Type:</strong> {LISTING_TYPES.find(t => t.id === formData.type)?.label}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Titre:</strong> {formData.title}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Prix:</strong> {formData.price}€</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Commission:</strong> {(getCommissionRate(formData.type) * 100).toFixed(0)}%</Typography>
              </Grid>
              {formData.location && (
                <Grid item xs={12}>
                  <Typography><strong>Localisation:</strong> {formData.location}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography><strong>Images:</strong> {images.length} ajoutée(s)</Typography>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Créer une nouvelle annonce
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
          <Box sx={{ mt: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack}>
                Retour
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                type="submit"
                disabled={isLoading}
              >
                Publier l'annonce
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && !formData.type) ||
                  (activeStep === 1 && (!formData.title || !formData.description || !formData.price)) ||
                  (activeStep === 2 && images.length === 0)
                }
              >
                Suivant
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateListingPage;