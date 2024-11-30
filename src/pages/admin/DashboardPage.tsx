import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { AdminApi } from '../../services/adminApi';
import {
    RevenueData,
    PaymentStats,
    TopSeller
} from '../../types/admin';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DashboardPage: React.FC = () => {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
    const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [paymentStats, setPaymentStats] = useState<PaymentStats[]>([]);
    const [topSellers, setTopSellers] = useState<TopSeller[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Charger les revenus
                const revenue = await AdminApi.getRevenue(period);
                setRevenueData(revenue);

                // Charger les stats de paiement
                const stats = await AdminApi.getPaymentStats({
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                });
                setPaymentStats(stats);

                // Charger les top vendeurs
                const sellers = await AdminApi.getTopSellers({
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                });
                setTopSellers(sellers);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, [period, startDate, endDate]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Filtres */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
                        <FormControl>
                            <InputLabel>Période</InputLabel>
                            <Select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as any)}
                                label="Période"
                            >
                                <MenuItem value="daily">Journalier</MenuItem>
                                <MenuItem value="weekly">Hebdomadaire</MenuItem>
                                <MenuItem value="monthly">Mensuel</MenuItem>
                                <MenuItem value="yearly">Annuel</MenuItem>
                            </Select>
                        </FormControl>
                        <DatePicker
                            label="Date début"
                            value={startDate}
                            onChange={(date) => date && setStartDate(date)}
                        />
                        <DatePicker
                            label="Date fin"
                            value={endDate}
                            onChange={(date) => date && setEndDate(date)}
                        />
                    </Paper>
                </Grid>

                {/* Graphique des revenus */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Revenus et Commissions
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <BarChart
                                data={revenueData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenus" fill="#8884d8" />
                                <Bar dataKey="commission" name="Commissions" fill="#82ca9d" />
                            </BarChart>
                        </Box>
                    </Paper>
                </Grid>

                {/* Répartition des paiements */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Méthodes de Paiement
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <PieChart>
                                <Pie
                                    data={paymentStats}
                                    dataKey="total_amount"
                                    nameKey="payment_method"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {paymentStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </Box>
                    </Paper>
                </Grid>

                {/* Top vendeurs */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Top 5 Vendeurs
                        </Typography>
                        <Box sx={{ height: 300, overflowY: 'auto' }}>
                            {topSellers.slice(0, 5).map((seller, index) => (
                                <Box
                                    key={seller.seller_id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        p: 1,
                                        borderBottom: '1px solid #eee'
                                    }}
                                >
                                    <Typography>
                                        {index + 1}. {seller.username}
                                    </Typography>
                                    <Typography>
                                        {seller.total_sales.toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR'
                                        })}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
