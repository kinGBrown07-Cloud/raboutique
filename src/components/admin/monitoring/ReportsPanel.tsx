import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { api } from '../../../utils/api';

interface ReportTemplate {
    id: number;
    name: string;
    description: string;
    metrics: string[];
    format: 'pdf' | 'excel';
    schedule?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        time?: string;
        dayOfWeek?: number;
        dayOfMonth?: number;
    };
    recipients: string[];
    customization?: {
        logo?: string;
        colors?: {
            primary: string;
            secondary: string;
        };
        header?: string;
        footer?: string;
    };
}

const ReportsPanel: React.FC = () => {
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<ReportTemplate>>({});
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await api.get('/monitoring/reports/templates');
            setTemplates(response.data);
        } catch (error) {
            enqueueSnackbar('Erreur lors du chargement des modèles de rapport', { variant: 'error' });
        }
    };

    const handleSave = async () => {
        try {
            if (editingTemplate.id) {
                await api.put(`/monitoring/reports/templates/${editingTemplate.id}`, editingTemplate);
                enqueueSnackbar('Modèle de rapport mis à jour', { variant: 'success' });
            } else {
                await api.post('/monitoring/reports/templates', editingTemplate);
                enqueueSnackbar('Modèle de rapport créé', { variant: 'success' });
            }
            setOpenDialog(false);
            loadTemplates();
        } catch (error) {
            enqueueSnackbar('Erreur lors de la sauvegarde du modèle', { variant: 'error' });
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return;
        
        try {
            await api.delete(`/monitoring/reports/templates/${id}`);
            enqueueSnackbar('Modèle de rapport supprimé', { variant: 'success' });
            loadTemplates();
        } catch (error) {
            enqueueSnackbar('Erreur lors de la suppression du modèle', { variant: 'error' });
        }
    };

    const handleGenerateReport = async (template: ReportTemplate) => {
        try {
            const response = await api.post(`/monitoring/reports/generate/${template.id}`);
            window.open(response.data.reportPath, '_blank');
        } catch (error) {
            enqueueSnackbar('Erreur lors de la génération du rapport', { variant: 'error' });
        }
    };

    const handleChange = (field: string, value: any) => {
        setEditingTemplate(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Rapports</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditingTemplate({});
                        setOpenDialog(true);
                    }}
                >
                    Nouveau Rapport
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Format</TableCell>
                            <TableCell>Fréquence</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {templates.map(template => (
                            <TableRow key={template.id}>
                                <TableCell>{template.name}</TableCell>
                                <TableCell>{template.description}</TableCell>
                                <TableCell>{template.format.toUpperCase()}</TableCell>
                                <TableCell>
                                    {template.schedule?.frequency || 'Manuel'}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => {
                                            setEditingTemplate(template);
                                            setOpenDialog(true);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(template.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleGenerateReport(template)}>
                                        <DownloadIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingTemplate.id ? 'Modifier le Rapport' : 'Nouveau Rapport'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nom"
                                value={editingTemplate.name || ''}
                                onChange={e => handleChange('name', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={editingTemplate.description || ''}
                                onChange={e => handleChange('description', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Select
                                fullWidth
                                value={editingTemplate.format || 'pdf'}
                                onChange={e => handleChange('format', e.target.value)}
                                label="Format"
                            >
                                <MenuItem value="pdf">PDF</MenuItem>
                                <MenuItem value="excel">Excel</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={6}>
                            <Select
                                fullWidth
                                value={editingTemplate.schedule?.frequency || 'manual'}
                                onChange={e => handleChange('schedule', {
                                    ...editingTemplate.schedule,
                                    frequency: e.target.value
                                })}
                                label="Fréquence"
                            >
                                <MenuItem value="manual">Manuel</MenuItem>
                                <MenuItem value="daily">Quotidien</MenuItem>
                                <MenuItem value="weekly">Hebdomadaire</MenuItem>
                                <MenuItem value="monthly">Mensuel</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Destinataires (séparés par des virgules)"
                                value={editingTemplate.recipients?.join(', ') || ''}
                                onChange={e => handleChange('recipients', e.target.value.split(',').map(s => s.trim()))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Sauvegarder
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportsPanel;
