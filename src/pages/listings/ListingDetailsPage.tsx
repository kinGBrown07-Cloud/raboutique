import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Avatar,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  ImageList,
  ImageListItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';
import { useDemoStore } from '../../store/useDemoStore';
import { ListingActions } from '../../components/listings/ListingActions';

const ListingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { notify } = useNotification();
  const { get } = useApi('https://api.remag.com/v1');
  const { listings: demoListings, isEnabled: isDemoMode } = useDemoStore();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        if (isDemoMode) {
          const demoListing = demoListings.find(l => l.id === id);
          if (demoListing) {
            setListing(demoListing);
            setSelectedImage(demoListing.imageUrl);
          } else {
            notify('Annonce non trouvée', 'error');
            navigate('/search');
          }
        } else {
          const data = await get(`/listings/${id}`);
          setListing(data);
          setSelectedImage(data.images[0]);
        }
      } catch (error) {
        notify('Erreur lors du chargement de l\'annonce', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, isDemoMode]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } catch (error) {
      notify('Erreur lors du partage', 'error');
    }
  };

  const handleContact = async () => {
    try {
      await get(`/listings/${id}/contact`, {
        method: 'POST',
        body: contactForm,
      });
      notify('Message envoyé avec succès', 'success');
      setContactDialogOpen(false);
    } catch (error) {
      notify('Erreur lors de l\'envoi du message', 'error');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="text" height={40} width={200} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" width={100} height={100} />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" height={32} />
              <Skeleton variant="text" height={24} width="60%" />
              <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {listing.title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Images */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box
              component="img"
              src={selectedImage || listing.imageUrl}
              alt={listing.title}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 2,
              }}
            />
            
            <ImageList
              sx={{ height: 100 }}
              cols={isMobile ? 3 : 4}
              rowHeight={100}
              gap={8}
            >
              {(isDemoMode ? [listing.imageUrl] : listing.images).map((img: string) => (
                <ImageListItem
                  key={img}
                  sx={{
                    cursor: 'pointer',
                    opacity: selectedImage === img ? 1 : 0.7,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 1 },
                  }}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt=""
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        </Grid>

        {/* Informations */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {listing.price.toLocaleString()}€
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={listing.category} color="primary" />
              <Chip
                label={listing.condition}
                color={
                  listing.condition === 'new'
                    ? 'success'
                    : listing.condition === 'used'
                    ? 'warning'
                    : 'info'
                }
              />
            </Box>

            <Typography variant="body1" paragraph>
              {listing.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <ListingActions
                listingId={listing.id}
                showLabels
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Spécifications
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(listing.specifications).map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography color="text.secondary">{key}</Typography>
                  <Typography>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vendeur
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={`https://i.pravatar.cc/150?u=${listing.sellerId}`}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="subtitle1">
                  {listing.sellerName}
                </Typography>
                <Rating
                  value={listing.sellerRating}
                  precision={0.5}
                  readOnly
                  size="small"
                />
              </Box>
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={() => setContactDialogOpen(true)}
              sx={{ mb: 1 }}
            >
              Contacter
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PhoneIcon />}
              onClick={() => notify('Fonctionnalité à venir', 'info')}
            >
              Voir le numéro
            </Button>
          </Paper>
        </Grid>

        {/* Contact Dialog */}
        <Dialog
          open={contactDialogOpen}
          onClose={() => setContactDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Contacter le vendeur</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Nom"
                fullWidth
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <TextField
                label="Téléphone"
                fullWidth
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <TextField
                label="Message"
                multiline
                rows={4}
                fullWidth
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm((prev) => ({ ...prev, message: e.target.value }))
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleContact} variant="contained">
              Envoyer
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Container>
  );
};

export default ListingDetailsPage;