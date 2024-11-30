import React, { useEffect, useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    IconButton,
    Menu,
    MenuItem,
    Badge,
    Chip,
    Alert,
    LinearProgress
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MetricsData {
    system: any[];
    business: any[];
}

interface Alert {
    id: number;
    type: string;
    severity: string;
    message: string;
    created_at: string;
}

const MonitoringDashboard: React.FC = () => {
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState('24h');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

    // Menu pour la sélection de période
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        // Charger les données initiales
        fetchData();
        
        // Établir la connexion WebSocket
        const ws = new WebSocket(`ws://${window.location.hostname}:8080`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'metrics_update') {
                updateMetrics(data.data);
            } else if (data.type === 'new_alert') {
                addNewAlert(data.data);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Erreur de connexion WebSocket');
        };

        setWsConnection(ws);

        return () => {
            if (ws) ws.close();
        };
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Charger les métriques
            const metricsResponse = await fetch(`/api/monitoring/metrics/historical/${selectedPeriod}`);
            const metricsJson = await metricsResponse.json();
            
            if (metricsJson.status === 'success') {
                setMetricsData(metricsJson.data);
            }

            // Charger les alertes
            const alertsResponse = await fetch('/api/monitoring/alerts?limit=5');
            const alertsJson = await alertsResponse.json();
            
            if (alertsJson.status === 'success') {
                setAlerts(alertsJson.data.alerts);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const updateMetrics = (newData: any) => {
        setMetricsData(prevData => {
            if (!prevData) return newData;
            
            return {
                system: [...prevData.system, newData.system],
                business: [...prevData.business, newData.business]
            };
        });
    };

    const addNewAlert = (alert: Alert) => {
        setAlerts(prevAlerts => [alert, ...prevAlerts.slice(0, 4)]);
    };

    const handlePeriodChange = async (period: string) => {
        setSelectedPeriod(period);
        setAnchorEl(null);
        await fetchData();
    };

    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            {/* En-tête */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    Tableau de Bord Monitoring
                </Typography>
                <Box>
                    <IconButton onClick={() => fetchData()}>
                        <RefreshIcon />
                    </IconButton>
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={() => setAnchorEl(null)}
                >
                    <MenuItem onClick={() => handlePeriodChange('1h')}>Dernière heure</MenuItem>
                    <MenuItem onClick={() => handlePeriodChange('24h')}>24 heures</MenuItem>
                    <MenuItem onClick={() => handlePeriodChange('7d')}>7 jours</MenuItem>
                    <MenuItem onClick={() => handlePeriodChange('30d')}>30 jours</MenuItem>
                </Menu>
            </Box>

            {/* Alertes récentes */}
            {alerts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Alertes Récentes
                    </Typography>
                    <Grid container spacing={2}>
                        {alerts.map(alert => (
                            <Grid item xs={12} md={6} key={alert.id}>
                                <Alert
                                    severity={alert.severity as any}
                                    sx={{ '& .MuiAlert-message': { width: '100%' } }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2">
                                            {alert.message}
                                        </Typography>
                                        <Chip
                                            label={format(new Date(alert.created_at), 'HH:mm', { locale: fr })}
                                            size="small"
                                            sx={{ ml: 2 }}
                                        />
                                    </Box>
                                </Alert>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Métriques Système */}
            <Grid container spacing={3}>
                {/* CPU et Mémoire */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Utilisation Système
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={metricsData?.system || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(value) => format(new Date(value), 'HH:mm', { locale: fr })}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm', { locale: fr })}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="cpu_usage"
                                    name="CPU"
                                    stroke="#8884d8"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="memory_usage"
                                    name="Mémoire"
                                    stroke="#82ca9d"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Requêtes et Erreurs */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Performance Requêtes
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={metricsData?.system || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(value) => format(new Date(value), 'HH:mm', { locale: fr })}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm', { locale: fr })}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="request_rate"
                                    name="Requêtes/min"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="error_rate"
                                    name="Taux d'erreur"
                                    stroke="#ff8042"
                                    fill="#ff8042"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Métriques Business */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Métriques Business
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={metricsData?.business || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: fr })}
                                />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm', { locale: fr })}
                                />
                                <Legend />
                                <Bar
                                    yAxisId="left"
                                    dataKey="transaction_volume"
                                    name="Volume Transactions"
                                    fill="#8884d8"
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="revenue"
                                    name="Revenus"
                                    fill="#82ca9d"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* KPIs */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        {metricsData?.business.slice(-1)[0] && (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                Utilisateurs Actifs
                                            </Typography>
                                            <Typography variant="h4">
                                                {metricsData.business.slice(-1)[0].active_users}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                Taux de Conversion
                                            </Typography>
                                            <Typography variant="h4">
                                                {(metricsData.business.slice(-1)[0].conversion_rate * 100).toFixed(1)}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                Transactions
                                            </Typography>
                                            <Typography variant="h4">
                                                {metricsData.business.slice(-1)[0].transaction_volume}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                Revenus
                                            </Typography>
                                            <Typography variant="h4">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                }).format(metricsData.business.slice(-1)[0].revenue)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MonitoringDashboard;
