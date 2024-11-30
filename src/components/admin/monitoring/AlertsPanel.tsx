import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from '@mui/material';
import {
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CheckCircle as ResolvedIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Alert {
    id: number;
    type: string;
    metric?: string;
    value?: number;
    threshold?: number;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    timestamp: Date;
    details?: Record<string, any>;
    resolved?: boolean;
    resolved_at?: Date;
    resolved_by?: string;
}

const AlertsPanel: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
    const [resolutionNote, setResolutionNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAlerts();
        // Établir la connexion WebSocket pour les mises à jour en temps réel
        const ws = new WebSocket('ws://localhost:3000');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'alert') {
                setAlerts(prev => [data.data, ...prev]);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/monitoring/alerts');
            setAlerts(response.data);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des alertes');
        } finally {
            setLoading(false);
        }
    };

    const handleResolveAlert = async () => {
        if (!selectedAlert) return;

        try {
            await axios.post(`/api/monitoring/alerts/${selectedAlert.id}/resolve`, {
                resolution_note: resolutionNote
            });

            setAlerts(prev =>
                prev.map(alert =>
                    alert.id === selectedAlert.id
                        ? {
                            ...alert,
                            resolved: true,
                            resolved_at: new Date(),
                            resolved_by: 'current_user' // Remplacer par l'utilisateur actuel
                        }
                        : alert
                )
            );

            setResolveDialogOpen(false);
            setSelectedAlert(null);
            setResolutionNote('');
        } catch (err) {
            setError('Erreur lors de la résolution de l\'alerte');
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <ErrorIcon color="error" />;
            case 'error':
                return <ErrorIcon color="error" />;
            case 'warning':
                return <WarningIcon color="warning" />;
            default:
                return <InfoIcon color="info" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'error';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            default:
                return 'info';
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        return format(new Date(timestamp), 'PPpp', { locale: fr });
    };

    return (
        <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Alertes et Notifications</Typography>
                <Button
                    variant="outlined"
                    onClick={fetchAlerts}
                    disabled={loading}
                >
                    Rafraîchir
                </Button>
            </Box>

            {error && (
                <Typography color="error" mb={2}>
                    {error}
                </Typography>
            )}

            <List>
                {alerts.map((alert) => (
                    <ListItem
                        key={alert.id}
                        sx={{
                            mb: 1,
                            bgcolor: alert.resolved ? 'action.hover' : 'background.paper',
                            borderRadius: 1
                        }}
                        secondaryAction={
                            !alert.resolved && (
                                <IconButton
                                    edge="end"
                                    onClick={() => {
                                        setSelectedAlert(alert);
                                        setResolveDialogOpen(true);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )
                        }
                    >
                        <ListItemIcon>
                            {alert.resolved ? (
                                <ResolvedIcon color="success" />
                            ) : (
                                getSeverityIcon(alert.severity)
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="subtitle1">
                                        {alert.message}
                                    </Typography>
                                    <Chip
                                        label={alert.type}
                                        size="small"
                                        color={getSeverityColor(alert.severity)}
                                    />
                                </Box>
                            }
                            secondary={
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatTimestamp(alert.timestamp)}
                                    </Typography>
                                    {alert.resolved && (
                                        <Typography variant="body2" color="success.main">
                                            Résolu par {alert.resolved_by} le{' '}
                                            {formatTimestamp(alert.resolved_at!)}
                                        </Typography>
                                    )}
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>

            <Dialog
                open={resolveDialogOpen}
                onClose={() => setResolveDialogOpen(false)}
            >
                <DialogTitle>Résoudre l'alerte</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Note de résolution"
                        fullWidth
                        multiline
                        rows={4}
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResolveDialogOpen(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleResolveAlert} variant="contained">
                        Résoudre
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default AlertsPanel;
