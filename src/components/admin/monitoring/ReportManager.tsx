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
    FormControl,
    Grid,
    IconButton,
    InputLabel,
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
    Typography,
    Alert,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Download as DownloadIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

interface ReportTemplate {
    id: number;
    name: string;
    description: string;
    type: 'system' | 'business' | 'combined';
    metrics: string[];
    filters: any;
    schedule?: string;
    format: 'excel' | 'pdf';
    recipients?: string[];
}

interface GeneratedReport {
    id: number;
    template_id: number;
    file_path: string;
    status: 'pending' | 'completed' | 'failed';
    error_message?: string;
    created_at: string;
}

const ReportManager: React.FC = () => {
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [reports, setReports] = useState<GeneratedReport[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
    const [formData, setFormData] = useState<Partial<ReportTemplate>>({
        name: '',
        description: '',
        type: 'system',
        metrics: [],
        format: 'excel',
        recipients: []
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const availableMetrics = {
        system: ['cpu_usage', 'memory_usage', 'disk_usage', 'network_traffic'],
        business: ['active_users', 'transactions', 'revenue', 'conversion_rate']
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [templatesRes, reportsRes] = await Promise.all([
                axios.get('/api/monitoring/report-templates'),
                axios.get('/api/monitoring/generated-reports')
            ]);
            setTemplates(templatesRes.data);
            setReports(reportsRes.data);
        } catch (err) {
            setError('Erreur lors de la récupération des données');
        }
    };

    const handleSubmit = async () => {
        try {
            if (editingTemplate) {
                await axios.put(`/api/monitoring/report-templates/${editingTemplate.id}`, formData);
            } else {
                await axios.post('/api/monitoring/report-templates', formData);
            }
            setSuccess('Template enregistré avec succès');
            fetchData();
            handleClose();
        } catch (err) {
            setError('Erreur lors de l\'enregistrement du template');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/monitoring/report-templates/${id}`);
            setSuccess('Template supprimé avec succès');
            fetchData();
        } catch (err) {
            setError('Erreur lors de la suppression du template');
        }
    };

    const handleGenerateReport = async (templateId: number) => {
        try {
            await axios.post(`/api/monitoring/generate-report/${templateId}`);
            setSuccess('Génération du rapport lancée');
            fetchData();
        } catch (err) {
            setError('Erreur lors de la génération du rapport');
        }
    };

    const handleDownload = async (reportId: number) => {
        try {
            const response = await axios.get(`/api/monitoring/download-report/${reportId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${reportId}.${formData.format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('Erreur lors du téléchargement du rapport');
        }
    };

    const handleClose = () => {
        setOpenDialog(false);
        setEditingTemplate(null);
        setFormData({
            name: '',
            description: '',
            type: 'system',
            metrics: [],
            format: 'excel',
            recipients: []
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Gestionnaire de Rapports</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Nouveau Template
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Templates de Rapports
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nom</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Format</TableCell>
                                            <TableCell>Planification</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {templates.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell>{template.name}</TableCell>
                                                <TableCell>{template.type}</TableCell>
                                                <TableCell>{template.format}</TableCell>
                                                <TableCell>
                                                    {template.schedule || 'Manuel'}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => {
                                                            setEditingTemplate(template);
                                                            setFormData(template);
                                                            setOpenDialog(true);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDelete(template.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleGenerateReport(template.id)}
                                                    >
                                                        <ScheduleIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Rapports Générés
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Template</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Statut</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    {templates.find(t => t.id === report.template_id)?.name}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={report.status}
                                                        color={
                                                            report.status === 'completed'
                                                                ? 'success'
                                                                : report.status === 'failed'
                                                                ? 'error'
                                                                : 'warning'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {report.status === 'completed' && (
                                                        <IconButton
                                                            onClick={() => handleDownload(report.id)}
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingTemplate ? 'Modifier le Template' : 'Nouveau Template'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nom"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            type: e.target.value as any,
                                            metrics: []
                                        })
                                    }
                                    label="Type"
                                >
                                    <MenuItem value="system">Système</MenuItem>
                                    <MenuItem value="business">Business</MenuItem>
                                    <MenuItem value="combined">Combiné</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Format</InputLabel>
                                <Select
                                    value={formData.format}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            format: e.target.value as any
                                        })
                                    }
                                    label="Format"
                                >
                                    <MenuItem value="excel">Excel</MenuItem>
                                    <MenuItem value="pdf">PDF</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Métriques</InputLabel>
                                <Select
                                    multiple
                                    value={formData.metrics}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            metrics: e.target.value as string[]
                                        })
                                    }
                                    label="Métriques"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(selected as string[]).map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {(formData.type === 'system' || formData.type === 'combined'
                                        ? availableMetrics.system
                                        : []
                                    ).map((metric) => (
                                        <MenuItem key={metric} value={metric}>
                                            {metric}
                                        </MenuItem>
                                    ))}
                                    {(formData.type === 'business' || formData.type === 'combined'
                                        ? availableMetrics.business
                                        : []
                                    ).map((metric) => (
                                        <MenuItem key={metric} value={metric}>
                                            {metric}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Planification (cron)"
                                value={formData.schedule}
                                onChange={(e) =>
                                    setFormData({ ...formData, schedule: e.target.value })
                                }
                                placeholder="*/30 * * * *"
                                helperText="Format cron (ex: */30 * * * * pour toutes les 30 minutes)"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Destinataires (emails séparés par des virgules)"
                                value={formData.recipients?.join(', ')}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        recipients: e.target.value.split(',').map((e) => e.trim())
                                    })
                                }
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingTemplate ? 'Modifier' : 'Créer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportManager;
