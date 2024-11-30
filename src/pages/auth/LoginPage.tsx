import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/common/Logo';
import { signInWithSocial, Provider } from '../../config/supabase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: Provider) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithSocial(provider);
      // La redirection sera gérée par Supabase
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erreur de connexion avec ${provider}`);
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Logo sx={{ mb: 2 }} />
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Connexion
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mb: 3 }}>
          {/* Supprimons les boutons Facebook et Twitter pour ne garder que Google et GitHub */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            sx={{
              mb: 2,
              backgroundColor: 'white',
              color: '#757575',
              borderColor: '#DADCE0',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#F8F9FA',
                borderColor: '#DADCE0'
              }
            }}
          >
            Se connecter avec Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            sx={{
              mb: 2,
              backgroundColor: 'white',
              color: '#24292E',
              borderColor: '#DADCE0',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#F6F8FA',
                borderColor: '#DADCE0'
              }
            }}
          >
            Se connecter avec GitHub
          </Button>
        </Stack>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Divider>
            <Typography variant="body2" color="text.secondary">
              Ou connectez-vous avec
            </Typography>
          </Divider>
        </Box>

        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Se souvenir de moi"
              />
              <MuiLink component={Link} to="/forgot-password" variant="body2">
                Mot de passe oublié ?
              </MuiLink>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Se connecter'}
            </Button>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <MuiLink component={Link} to="/register" variant="body2">
                Créer un compte
              </MuiLink>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;