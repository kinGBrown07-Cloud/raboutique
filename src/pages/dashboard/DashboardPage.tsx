import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';
import { generateDemoListings, generateDemoStats } from '../../services/demoData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalFavorites: number;
  recentSales: number;
  revenue: number;
  popularCategories: Array<{ category: string; count: number }>;
  monthlyStats: Array<{ month: string; listings: number; views: number; sales: number }>;
}

const DashboardPage: React.FC = () => {
  const { post, get } = useApi('https://api.remag.com/v1');
  const { notify } = useNotification();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [useDemoData, setUseDemoData] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      if (useDemoData) {
        setStats(generateDemoStats());
      } else {
        const data = await get('/dashboard/stats');
        setStats(data);
      }
    } catch (error) {
      notify('Erreur lors du chargement des statistiques', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [useDemoData]);

  const handleRefresh = () => {
    fetchStats();
  };

  const handleToggleDemoData = async () => {
    try {
      if (!useDemoData) {
        // Activation des données de démo
        await post('/admin/demo-data/generate', { count: 50 });
        notify('Données de démonstration générées avec succès', 'success');
      } else {
        setConfirmDialog(true);
        return;
      }
      setUseDemoData(!useDemoData);
    } catch (error) {
      notify('Erreur lors de la gestion des données de démo', 'error');
    }
  };

  const handleConfirmDeleteDemo = async () => {
    try {
      await post('/admin/demo-data/clear', {});
      setUseDemoData(false);
      notify('Données de démonstration supprimées avec succès', 'success');
    } catch (error) {
      notify('Erreur lors de la suppression des données de démo', 'error');
    } finally {
      setConfirmDialog(false);
    }
  };

  const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {icon}
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tableau de bord
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={useDemoData}
                onChange={handleToggleDemoData}
                color="primary"
              />
            }
            label="Données de démo"
          />
          <Tooltip title="Rafraîchir">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {useDemoData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Vous utilisez actuellement des données de démonstration. Ces données sont générées aléatoirement et ne reflètent pas les données réelles.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistiques principales */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total des annonces"
            value={stats?.totalListings || 0}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Annonces actives"
            value={stats?.activeListings || 0}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Vues totales"
            value={stats?.totalViews || 0}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Chiffre d'affaires"
            value={`${(stats?.revenue || 0).toLocaleString()}€`}
          />
        </Grid>

        {/* Graphique d'évolution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Évolution mensuelle
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={stats?.monthlyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="listings" stroke="#8884d8" name="Annonces" />
                  <Line type="monotone" dataKey="views" stroke="#82ca9d" name="Vues" />
                  <Line type="monotone" dataKey="sales" stroke="#ffc658" name="Ventes" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Catégories populaires */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Catégories populaires
            </Typography>
            <Box>
              {stats?.popularCategories.map((cat, index) => (
                <Box
                  key={cat.category}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                    p: 1,
                    bgcolor: index % 2 === 0 ? 'background.default' : 'transparent',
                  }}
                >
                  <Typography>{cat.category}</Typography>
                  <Typography>{cat.count} annonces</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Statistiques récentes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activité récente
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography color="textSecondary">Ventes récentes</Typography>
                <Typography variant="h4">{stats?.recentSales || 0}</Typography>
              </Box>
              <Box>
                <Typography color="textSecondary">Favoris</Typography>
                <Typography variant="h4">{stats?.totalFavorites || 0}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de confirmation pour la suppression des données de démo */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer toutes les données de démonstration ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Annuler</Button>
          <Button onClick={handleConfirmDeleteDemo} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;