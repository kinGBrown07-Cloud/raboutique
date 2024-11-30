import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    CircularProgress,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Alert,
    IconButton,
    Tooltip,
    Paper
} from '@mui/material';
import {
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon,
    NetworkCheck as NetworkIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { api } from '../../../utils/api';

interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}

interface ResourceUsage {
    cpu: number;
    memory: number;
    disk: number;
    network: {
        bytesIn: number;
        bytesOut: number;
    };
}

interface Bottleneck {
    resource: string;
    severity: 'low' | 'medium' | 'high';
    impact: number;
    recommendations: string[];
    metadata?: Record<string, any>;
}

interface PerformanceAnalysis {
    timestamp: Date;
    overallScore: number;
    metrics: PerformanceMetric[];
    resourceUsage: ResourceUsage;
    bottlenecks: Bottleneck[];
    recommendations: string[];
}

const PerformancePanel: React.FC = () => {
    const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
    const [historicalData, setHistoricalData] = useState<PerformanceAnalysis[]>([]);
    const [trends, setTrends] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000); // Rafraîchir toutes les minutes
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [analysisRes, historyRes, trendsRes] = await Promise.all([
                api.get('/monitoring/performance/analysis'),
                api.get('/monitoring/performance/history', {
                    params: {
                        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        endDate: new Date().toISOString()
                    }
                }),
                api.get('/monitoring/performance/trends')
            ]);

            setAnalysis(analysisRes.data);
            setHistoricalData(historyRes.data);
            setTrends(trendsRes.data);
        } catch (error) {
            enqueueSnackbar('Erreur lors du chargement des données de performance', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'default';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUpIcon color="success" />;
            case 'down':
                return <TrendingDownIcon color="error" />;
            default:
                return <TrendingFlatIcon />;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Performance du Système</Typography>
                <Tooltip title="Rafraîchir">
                    <IconButton onClick={loadData}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={3}>
                {/* Score global */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Score Global
                            </Typography>
                            <Box display="flex" justifyContent="center" alignItems="center" position="relative">
                                <CircularProgress
                                    variant="determinate"
                                    value={analysis?.overallScore || 0}
                                    size={120}
                                    thickness={4}
                                    color={
                                        analysis?.overallScore >= 70 ? 'success' :
                                        analysis?.overallScore >= 50 ? 'warning' : 'error'
                                    }
                                />
                                <Typography
                                    variant="h4"
                                    component="div"
                                    style={{
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {Math.round(analysis?.overallScore || 0)}
                                </Typography>
                            </Box>
                            {trends?.overallScore && (
                                <Box display="flex" justifyContent="center" mt={2}>
                                    <Chip
                                        icon={getTrendIcon(trends.overallScore.trend)}
                                        label={`Tendance: ${trends.overallScore.trend}`}
                                        size="small"
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Utilisation des ressources */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Utilisation des Ressources
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">CPU</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={analysis?.resourceUsage.cpu || 0}
                                        color={
                                            analysis?.resourceUsage.cpu >= 85 ? 'error' :
                                            analysis?.resourceUsage.cpu >= 70 ? 'warning' : 'success'
                                        }
                                    />
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption">
                                            {Math.round(analysis?.resourceUsage.cpu || 0)}%
                                        </Typography>
                                        {trends?.resourceUsage?.cpu && (
                                            <Tooltip title="Tendance">
                                                {getTrendIcon(trends.resourceUsage.cpu)}
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Mémoire</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={analysis?.resourceUsage.memory || 0}
                                        color={
                                            analysis?.resourceUsage.memory >= 90 ? 'error' :
                                            analysis?.resourceUsage.memory >= 80 ? 'warning' : 'success'
                                        }
                                    />
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption">
                                            {Math.round(analysis?.resourceUsage.memory || 0)}%
                                        </Typography>
                                        {trends?.resourceUsage?.memory && (
                                            <Tooltip title="Tendance">
                                                {getTrendIcon(trends.resourceUsage.memory)}
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Disque</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={analysis?.resourceUsage.disk || 0}
                                        color={
                                            analysis?.resourceUsage.disk >= 95 ? 'error' :
                                            analysis?.resourceUsage.disk >= 85 ? 'warning' : 'success'
                                        }
                                    />
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption">
                                            {Math.round(analysis?.resourceUsage.disk || 0)}%
                                        </Typography>
                                        {trends?.resourceUsage?.disk && (
                                            <Tooltip title="Tendance">
                                                {getTrendIcon(trends.resourceUsage.disk)}
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Goulots d'étranglement */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Goulots d'Étranglement Détectés
                            </Typography>
                            {analysis?.bottlenecks.length === 0 ? (
                                <Alert severity="success">
                                    Aucun goulot d'étranglement détecté
                                </Alert>
                            ) : (
                                <List>
                                    {analysis?.bottlenecks.map((bottleneck, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                <WarningIcon color={getSeverityColor(bottleneck.severity)} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={bottleneck.resource}
                                                secondary={
                                                    <>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Impact: {Math.round(bottleneck.impact * 100)}%
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            Recommandations:
                                                        </Typography>
                                                        <List dense>
                                                            {bottleneck.recommendations.map((rec, idx) => (
                                                                <ListItem key={idx} dense>
                                                                    <ListItemText
                                                                        primary={`• ${rec}`}
                                                                        primaryTypographyProps={{
                                                                            variant: 'caption'
                                                                        }}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </>
                                                }
                                            />
                                            <Chip
                                                label={bottleneck.severity}
                                                color={getSeverityColor(bottleneck.severity)}
                                                size="small"
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recommandations */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recommandations d'Optimisation
                            </Typography>
                            <List>
                                {analysis?.recommendations.map((recommendation, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <SpeedIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary={recommendation} />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Graphique historique */}
                {historicalData.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Historique des Performances
                                </Typography>
                                <Box height={300}>
                                    <Line
                                        data={{
                                            labels: historicalData.map(d =>
                                                format(new Date(d.timestamp), 'HH:mm', { locale: fr })
                                            ),
                                            datasets: [
                                                {
                                                    label: 'Score Global',
                                                    data: historicalData.map(d => d.overallScore),
                                                    borderColor: 'rgb(75, 192, 192)',
                                                    tension: 0.1
                                                },
                                                {
                                                    label: 'CPU',
                                                    data: historicalData.map(d => d.resourceUsage.cpu),
                                                    borderColor: 'rgb(255, 99, 132)',
                                                    tension: 0.1
                                                },
                                                {
                                                    label: 'Mémoire',
                                                    data: historicalData.map(d => d.resourceUsage.memory),
                                                    borderColor: 'rgb(54, 162, 235)',
                                                    tension: 0.1
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    max: 100
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default PerformancePanel;
