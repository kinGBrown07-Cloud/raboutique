import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user, profile, logout, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateUserProfile({
        full_name: formData.full_name,
        updated_at: new Date().toISOString(),
      });

      setSuccess('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la déconnexion');
    }
  };

  if (!user || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={profile.avatar_url}
              alt={profile.full_name}
              sx={{ width: 80, height: 80 }}
            />
            <Box>
              <Typography variant="h5" gutterBottom>
                Mon Profil
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connecté avec {profile.provider || 'email'}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nom complet"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                disabled
                helperText="L'email ne peut pas être modifié"
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Mettre à jour'}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Se déconnecter
                </Button>
              </Box>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ProfilePage;