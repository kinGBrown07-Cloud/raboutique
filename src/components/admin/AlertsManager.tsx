import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Chip,
    Alert,
    LinearProgress,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AlertRule {
    id: number;
    name: string;
    condition: string;
    threshold: number;
    time_window: number;
    severity: string;
    notification_channels: string[];
    is_active: boolean;
}

interface Alert {
    id: number;
    type: string;
    severity: string;
    message: string;
    details: any;
    is_resolved: boolean;
    created_at: string;
}

const CONDITIONS = [
    { value: 'error_rate', label: 'Taux d\'erreur' },
    { value: 'payment_failure', label: 'Échecs de paiement' },
    { value: 'high_refund', label: 'Taux de remboursement' },
    { value: 'system_load', label: 'Charge système' }
];

const SEVERITIES = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyen' },
    { value: 'high', label: 'Élevé' },
    { value: 'critical', label: 'Critique' }
];

const AlertsManager: React.FC = () => {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

    const [formData, setFormData] = useState<Partial<AlertRule>>({
        name: '',
        condition: '',
        threshold: 0,
        time_window: 5,
        severity: 'medium',
        notification_channels: ['email', 'websocket'],
        is_active: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Charger les règles
            const rulesResponse = await fetch('/api/monitoring/alerts/rules');
            const rulesJson = await rulesResponse.json();
            
            if (rulesJson.status === 'success') {
                setRules(rulesJson.data.rules);
            }

            // Charger les alertes
            const alertsResponse = await fetch('/api/monitoring/alerts?limit=10');
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

    const handleSubmit = async () => {
        try {
            const url = editingRule
                ? `/api/monitoring/alerts/rules/${editingRule.id}`
                : '/api/monitoring/alerts/rules';
            
            const method = editingRule ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                setOpenDialog(false);
                fetchData();
                setEditingRule(null);
                setFormData({
                    name: '',
                    condition: '',
                    threshold: 0,
                    time_window: 5,
                    severity: 'medium',
                    notification_channels: ['email', 'websocket'],
                    is_active: true
                });
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Error saving rule:', err);
            setError('Erreur lors de l\'enregistrement de la règle');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/monitoring/alerts/rules/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                fetchData();
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Error deleting rule:', err);
            setError('Erreur lors de la suppression de la règle');
        }
    };

    const handleResolveAlert = async (id: number) => {
        try {
            const response = await fetch(`/api/monitoring/alerts/${id}/resolve`, {
                method: 'PUT'
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                fetchData();
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Error resolving alert:', err);
            setError('Erreur lors de la résolution de l\'alerte');
        }
    };

    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Règles d'alerte */}
            <Paper sx={{ mb: 3, p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        Règles d'Alerte
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Nouvelle Règle
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell>Condition</TableCell>
                                <TableCell>Seuil</TableCell>
                                <TableCell>Fenêtre (min)</TableCell>
                                <TableCell>Sévérité</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell>{rule.name}</TableCell>
                                    <TableCell>
                                        {CONDITIONS.find(c => c.value === rule.condition)?.label}
                                    </TableCell>
                                    <TableCell>{rule.threshold}</TableCell>
                                    <TableCell>{rule.time_window}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={SEVERITIES.find(s => s.value === rule.severity)?.label}
                                            color={rule.severity === 'critical' ? 'error' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={rule.is_active ? 'Actif' : 'Inactif'}
                                            color={rule.is_active ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditingRule(rule);
                                                setFormData(rule);
                                                setOpenDialog(true);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(rule.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Alertes actives */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Alertes Récentes
                </Typography>

                <Grid container spacing={2}>
                    {alerts.map((alert) => (
                        <Grid item xs={12} key={alert.id}>
                            <Alert
                                severity={alert.severity as any}
                                action={
                                    !alert.is_resolved && (
                                        <IconButton
                                            color="inherit"
                                            size="small"
                                            onClick={() => handleResolveAlert(alert.id)}
                                        >
                                            <CheckIcon />
                                        </IconButton>
                                    )
                                }
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            {alert.message}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                        </Typography>
                                    </Box>
                                    {alert.is_resolved && (
                                        <Chip
                                            label="Résolu"
                                            color="success"
                                            size="small"
                                        />
                                    )}
                                </Box>
                            </Alert>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Dialog pour ajouter/éditer une règle */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingRule ? 'Modifier la Règle' : 'Nouvelle Règle d\'Alerte'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Condition</InputLabel>
                                    <Select
                                        value={formData.condition}
                                        label="Condition"
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    >
                                        {CONDITIONS.map(condition => (
                                            <MenuItem key={condition.value} value={condition.value}>
                                                {condition.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Sévérité</InputLabel>
                                    <Select
                                        value={formData.severity}
                                        label="Sévérité"
                                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                    >
                                        {SEVERITIES.map(severity => (
                                            <MenuItem key={severity.value} value={severity.value}>
                                                {severity.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Seuil"
                                    value={formData.threshold}
                                    onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Fenêtre (minutes)"
                                    value={formData.time_window}
                                    onChange={(e) => setFormData({ ...formData, time_window: parseInt(e.target.value) })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingRule ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AlertsManager;
