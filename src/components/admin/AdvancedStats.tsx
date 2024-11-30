import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface StatsProps {
    revenueData: any[];
    refundStats: any[];
    paymentStats: any[];
    isLoading: boolean;
}

export const AdvancedStats: React.FC<StatsProps> = ({
    revenueData,
    refundStats,
    paymentStats,
    isLoading
}) => {
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
            </Box>
        );
    }

    // Calculer le taux de conversion des paiements
    const conversionRate = paymentStats.reduce((acc, stat) => {
        const success = stat.success_count || 0;
        const total = stat.total_count || 1;
        return acc + (success / total);
    }, 0) / paymentStats.length;

    // Calculer le taux de remboursement
    const refundRate = refundStats.reduce((acc, stat) => {
        return acc + (stat.refund_count / stat.total_count || 0);
    }, 0) / refundStats.length;

    return (
        <Grid container spacing={3}>
            {/* KPIs */}
            <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        Taux de Conversion
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Box position="relative" display="inline-flex">
                            <CircularProgress
                                variant="determinate"
                                value={conversionRate * 100}
                                size={80}
                            />
                            <Box
                                position="absolute"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                top={0}
                                left={0}
                                bottom={0}
                                right={0}
                            >
                                <Typography variant="caption" component="div" color="text.secondary">
                                    {`${(conversionRate * 100).toFixed(1)}%`}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        Taux de Remboursement
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Box position="relative" display="inline-flex">
                            <CircularProgress
                                variant="determinate"
                                value={refundRate * 100}
                                size={80}
                                color="warning"
                            />
                            <Box
                                position="absolute"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                top={0}
                                left={0}
                                bottom={0}
                                right={0}
                            >
                                <Typography variant="caption" component="div" color="text.secondary">
                                    {`${(refundRate * 100).toFixed(1)}%`}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Graphique d'évolution des revenus */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        Évolution des Revenus
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#8884d8"
                                name="Revenus"
                            />
                            <Line
                                type="monotone"
                                dataKey="commission"
                                stroke="#82ca9d"
                                name="Commissions"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            {/* Graphique des méthodes de paiement */}
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Performance des Méthodes de Paiement
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={paymentStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="payment_method" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="success_rate"
                                stackId="1"
                                stroke="#8884d8"
                                fill="#8884d8"
                                name="Taux de succès"
                            />
                            <Area
                                type="monotone"
                                dataKey="error_rate"
                                stackId="1"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                name="Taux d'erreur"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            {/* Analyse des remboursements */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Analyse des Remboursements par Type
                    </Typography>
                    <Grid container spacing={2}>
                        {refundStats.map((stat) => (
                            <Grid item xs={12} md={4} key={stat.transaction_type}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1">
                                        {stat.transaction_type}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(stat.refund_count / stat.total_count) * 100}
                                        sx={{ height: 10, borderRadius: 5 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {stat.refund_count} remboursements sur {stat.total_count} transactions
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
};
