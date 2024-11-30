import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/common/Logo';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterPage = () => {
  const { register, loading, error, clearError, socialLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validation du nom
    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
      isValid = false;
    }

    // Validation de l'email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Email invalide';
      isValid = false;
    }

    // Validation du mot de passe
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Le mot de passe doit contenir au moins une majuscule';
      isValid = false;
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Le mot de passe doit contenir au moins un chiffre';
      isValid = false;
    }

    // Validation de la confirmation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
    
    // Effacer l'erreur du champ modifié
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await register(formData);
      } catch (err) {
        // Les erreurs sont déjà gérées dans le contexte
        console.error('Registration error:', err);
      }
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await socialLogin(provider);
    } catch (err) {
      // Les erreurs sont déjà gérées dans le contexte
      console.error(`${provider} login error:`, err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          my: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box 
          sx={{ 
            mb: 4, 
            width: 200,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          <Logo width={200} height={80} />
        </Box>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" textAlign="center" gutterBottom>
            Créer un compte
          </Typography>
          
          {/* Social Login Buttons */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleSocialLogin('google')}
              sx={{
                py: 1,
                color: '#DB4437',
                borderColor: '#DB4437',
                '&:hover': {
                  borderColor: '#DB4437',
                  bgcolor: 'rgba(219, 68, 55, 0.04)',
                },
              }}
            >
              Continuer avec Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => handleSocialLogin('facebook')}
              sx={{
                py: 1,
                color: '#4267B2',
                borderColor: '#4267B2',
                '&:hover': {
                  borderColor: '#4267B2',
                  bgcolor: 'rgba(66, 103, 178, 0.04)',
                },
              }}
            >
              Continuer avec Facebook
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TwitterIcon />}
              onClick={() => handleSocialLogin('twitter')}
              sx={{
                py: 1,
                color: '#1DA1F2',
                borderColor: '#1DA1F2',
                '&:hover': {
                  borderColor: '#1DA1F2',
                  bgcolor: 'rgba(29, 161, 242, 0.04)',
                },
              }}
            >
              Continuer avec Twitter
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Typography color="text.secondary" variant="body2">
              OU
            </Typography>
          </Divider>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nom complet"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'S\'inscrire'
              )}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Déjà inscrit ?{' '}
                <Link
                  to="/login"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
