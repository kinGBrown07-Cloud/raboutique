import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

interface Prediction {
    timestamp: string;
    predicted_value: number;
    confidence_interval: {
        lower: number;
        upper: number;
    };
}

interface Anomaly {
    timestamp: string;
    value: number;
    score: number;
    is_anomaly: boolean;
}

const PredictionDashboard: React.FC = () => {
    const [selectedMetric, setSelectedMetric] = useState<string>('');
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [availableMetrics] = useState<string[]>([
        'cpu_usage',
        'memory_usage',
        'active_users',
        'transaction_volume',
        'error_rate'
    ]);

    useEffect(() => {
        if (selectedMetric) {
            fetchData();
        }
    }, [selectedMetric]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [predictionsRes, anomaliesRes] = await Promise.all([
                axios.get(`/api/monitoring/predictions/${selectedMetric}`),
                axios.get(`/api/monitoring/anomalies/${selectedMetric}`)
            ]);

            setPredictions(predictionsRes.data);
            setAnomalies(anomaliesRes.data);
        } catch (err) {
            setError('Erreur lors de la récupération des données');
            console.error('Error fetching prediction data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatData = () => {
        if (!predictions.length) return [];

        return predictions.map((pred, index) => {
            const anomaly = anomalies.find(a => a.timestamp === pred.timestamp);
            return {
                timestamp: format(new Date(pred.timestamp), 'dd/MM HH:mm'),
                actual: anomaly?.value || null,
                predicted: pred.predicted_value,
                lower: pred.confidence_interval.lower,
                upper: pred.confidence_interval.upper,
                isAnomaly: anomaly?.is_anomaly || false
            };
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Prédictions et Anomalies
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Métrique</InputLabel>
                        <Select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            label="Métrique"
                        >
                            {availableMetrics.map((metric) => (
                                <MenuItem key={metric} value={metric}>
                                    {metric.replace('_', ' ').toUpperCase()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Prévisions et Valeurs Réelles
                            </Typography>
                            <Box sx={{ height: 400 }}>
                                <ResponsiveContainer>
                                    <ComposedChart data={formatData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="timestamp"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            dataKey="upper"
                                            stackId="1"
                                            fill="#8884d8"
                                            opacity={0.1}
                                            stroke="none"
                                        />
                                        <Area
                                            dataKey="lower"
                                            stackId="2"
                                            fill="#8884d8"
                                            opacity={0.1}
                                            stroke="none"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="predicted"
                                            stroke="#8884d8"
                                            strokeDasharray="5 5"
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="actual"
                                            stroke="#82ca9d"
                                            dot={(props: any) => {
                                                const { isAnomaly, cx, cy } = props;
                                                if (!isAnomaly) return null;
                                                return (
                                                    <circle
                                                        cx={cx}
                                                        cy={cy}
                                                        r={4}
                                                        fill="#ff0000"
                                                        stroke="none"
                                                    />
                                                );
                                            }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>

                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Anomalies Détectées
                                    </Typography>
                                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                        {anomalies
                                            .filter(a => a.is_anomaly)
                                            .map((anomaly, index) => (
                                                <Alert
                                                    key={index}
                                                    severity="warning"
                                                    sx={{ mb: 1 }}
                                                >
                                                    Anomalie détectée le{' '}
                                                    {format(
                                                        new Date(anomaly.timestamp),
                                                        'dd/MM/yyyy HH:mm',
                                                        { locale: fr }
                                                    )}
                                                    <br />
                                                    Valeur: {anomaly.value.toFixed(2)}
                                                    <br />
                                                    Score: {anomaly.score.toFixed(2)}
                                                </Alert>
                                            ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Statistiques
                                    </Typography>
                                    <Typography variant="body1">
                                        Nombre total d'anomalies :{' '}
                                        {anomalies.filter(a => a.is_anomaly).length}
                                    </Typography>
                                    <Typography variant="body1">
                                        Dernière prédiction :{' '}
                                        {predictions.length > 0
                                            ? predictions[predictions.length - 1].predicted_value.toFixed(2)
                                            : 'N/A'}
                                    </Typography>
                                    <Typography variant="body1">
                                        Intervalle de confiance :{' '}
                                        {predictions.length > 0
                                            ? `[${predictions[predictions.length - 1].confidence_interval.lower.toFixed(2)}, ${predictions[predictions.length - 1].confidence_interval.upper.toFixed(2)}]`
                                            : 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default PredictionDashboard;
