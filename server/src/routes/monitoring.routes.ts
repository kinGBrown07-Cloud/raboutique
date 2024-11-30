import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { MonitoringService } from '../services/monitoring.service';
import { AlertService } from '../services/alert.service';
import { PredictionService } from '../services/prediction.service';
import { ReportService } from '../services/report.service';
import { DashboardService } from '../services/dashboard.service';
import { IntegrationService } from '../services/integration.service';
import { NotificationService } from '../services/notification.service';
import { PerformanceService } from '../services/performance.service'; // Importation du service de performance

const router = express.Router();

// Middleware pour vérifier les droits admin
router.use(authenticateToken, isAdmin);

// Obtenir les métriques historiques
router.get('/metrics/historical/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const metrics = await MonitoringService.getHistoricalMetrics(period);

        res.json({
            status: 'success',
            data: metrics
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des métriques'
        });
    }
});

// Obtenir les alertes avec filtres
router.get('/alerts', async (req, res) => {
    try {
        const {
            severity,
            type,
            startDate,
            endDate,
            limit,
            offset
        } = req.query;

        const alerts = await AlertService.getAlerts({
            severity: severity as string,
            type: type as string,
            startDate: startDate as string,
            endDate: endDate as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });

        res.json({
            status: 'success',
            data: { alerts }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des alertes'
        });
    }
});

// Obtenir les règles d'alerte
router.get('/alerts/rules', async (req, res) => {
    try {
        const [rules] = await db.query('SELECT * FROM alert_rules ORDER BY created_at DESC');

        res.json({
            status: 'success',
            data: { rules }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des règles d\'alerte'
        });
    }
});

// Créer une nouvelle règle d'alerte
router.post('/alerts/rules', async (req, res) => {
    try {
        const {
            name,
            condition,
            threshold,
            time_window,
            severity,
            notification_channels
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO alert_rules 
            (name, condition, threshold, time_window, severity, notification_channels)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [name, condition, threshold, time_window, severity, JSON.stringify(notification_channels)]
        );

        res.json({
            status: 'success',
            data: {
                id: (result as any).insertId,
                message: 'Règle d\'alerte créée avec succès'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la création de la règle d\'alerte'
        });
    }
});

// Mettre à jour une règle d'alerte
router.put('/alerts/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            condition,
            threshold,
            time_window,
            severity,
            notification_channels,
            is_active
        } = req.body;

        await db.query(
            `UPDATE alert_rules 
            SET 
                name = ?,
                condition = ?,
                threshold = ?,
                time_window = ?,
                severity = ?,
                notification_channels = ?,
                is_active = ?
            WHERE id = ?`,
            [
                name,
                condition,
                threshold,
                time_window,
                severity,
                JSON.stringify(notification_channels),
                is_active,
                id
            ]
        );

        res.json({
            status: 'success',
            message: 'Règle d\'alerte mise à jour avec succès'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la mise à jour de la règle d\'alerte'
        });
    }
});

// Supprimer une règle d'alerte
router.delete('/alerts/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM alert_rules WHERE id = ?', [id]);

        res.json({
            status: 'success',
            message: 'Règle d\'alerte supprimée avec succès'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la suppression de la règle d\'alerte'
        });
    }
});

// Marquer une alerte comme résolue
router.put('/alerts/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            `UPDATE alerts 
            SET is_resolved = true, resolved_at = NOW()
            WHERE id = ?`,
            [id]
        );

        res.json({
            status: 'success',
            message: 'Alerte marquée comme résolue'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la résolution de l\'alerte'
        });
    }
});

// Routes pour les alertes
router.get('/alerts', authenticateToken, async (req, res) => {
    try {
        const alerts = await NotificationService.getRecentAlerts(100);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des alertes' });
    }
});

router.post('/alerts/:id/resolve', authenticateToken, async (req, res) => {
    try {
        await NotificationService.markAlertAsResolved(
            parseInt(req.params.id),
            req.user!.username
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la résolution de l\'alerte' });
    }
});

// Routes pour les prédictions et anomalies
router.get('/predictions/:metric', authenticateToken, async (req, res) => {
    try {
        const predictions = await PredictionService.predictMetric(req.params.metric);
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la prédiction des métriques' });
    }
});

router.get('/anomalies/:metric', authenticateToken, async (req, res) => {
    try {
        const anomalies = await PredictionService.detectAnomalies(req.params.metric);
        res.json(anomalies);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la détection des anomalies' });
    }
});

// Routes pour les rapports
router.get('/reports/templates', authenticateToken, async (req, res) => {
    try {
        const templates = await ReportService.getReportTemplates();
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des modèles de rapport' });
    }
});

router.post('/reports/templates', authenticateToken, async (req, res) => {
    try {
        const templateId = await ReportService.saveReportTemplate(req.body);
        res.json({ id: templateId });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du modèle de rapport' });
    }
});

router.put('/reports/templates/:id', authenticateToken, async (req, res) => {
    try {
        await ReportService.updateReportTemplate(parseInt(req.params.id), req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du modèle de rapport' });
    }
});

router.delete('/reports/templates/:id', authenticateToken, async (req, res) => {
    try {
        await ReportService.deleteReportTemplate(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression du modèle de rapport' });
    }
});

router.post('/reports/generate/:id', authenticateToken, async (req, res) => {
    try {
        const template = await ReportService.getReportTemplates()
            .then(templates => templates.find(t => t.id === parseInt(req.params.id)));
            
        if (!template) {
            return res.status(404).json({ error: 'Modèle de rapport non trouvé' });
        }

        const reportPath = await ReportService.generateReport(template);
        res.json({ reportPath });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
    }
});

// Routes pour les tableaux de bord
router.get('/dashboards', authenticateToken, async (req, res) => {
    try {
        const dashboards = await DashboardService.getUserDashboards(req.user!.id);
        res.json(dashboards);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des tableaux de bord' });
    }
});

router.post('/dashboards', authenticateToken, async (req, res) => {
    try {
        const dashboardId = await DashboardService.createDashboard({
            ...req.body,
            owner: req.user!.id
        });
        res.json({ id: dashboardId });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du tableau de bord' });
    }
});

router.put('/dashboards/:id', authenticateToken, async (req, res) => {
    try {
        const dashboard = await DashboardService.getDashboard(parseInt(req.params.id));
        if (dashboard.owner !== req.user!.id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        await DashboardService.updateDashboard(parseInt(req.params.id), req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du tableau de bord' });
    }
});

router.delete('/dashboards/:id', authenticateToken, async (req, res) => {
    try {
        const dashboard = await DashboardService.getDashboard(parseInt(req.params.id));
        if (dashboard.owner !== req.user!.id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        await DashboardService.deleteDashboard(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression du tableau de bord' });
    }
});

router.post('/dashboards/:id/widgets', authenticateToken, async (req, res) => {
    try {
        const dashboard = await DashboardService.getDashboard(parseInt(req.params.id));
        if (dashboard.owner !== req.user!.id) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        const widgets = [...dashboard.widgets, req.body];
        await DashboardService.updateDashboard(parseInt(req.params.id), { widgets });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout du widget' });
    }
});

router.get('/widget-data/:widgetId', authenticateToken, async (req, res) => {
    try {
        const widget = await DashboardService.getWidgetData(parseInt(req.params.widgetId));
        res.json(widget);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données du widget' });
    }
});

// Routes pour les intégrations
router.get('/integrations', isAdmin, async (req, res) => {
    try {
        const integrations = await IntegrationService.getEnabledIntegrations();
        res.json(integrations);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des intégrations' });
    }
});

router.post('/integrations', isAdmin, async (req, res) => {
    try {
        const integrationId = await IntegrationService.createIntegration(req.body);
        res.json({ id: integrationId });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de l\'intégration' });
    }
});

router.put('/integrations/:id', isAdmin, async (req, res) => {
    try {
        await IntegrationService.updateIntegration(parseInt(req.params.id), req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'intégration' });
    }
});

router.delete('/integrations/:id', isAdmin, async (req, res) => {
    try {
        await IntegrationService.deleteIntegration(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'intégration' });
    }
});

router.post('/integrations/:id/test', isAdmin, async (req, res) => {
    try {
        const success = await IntegrationService.testIntegration(parseInt(req.params.id));
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du test de l\'intégration' });
    }
});

// Routes pour l'analyse des performances
router.get('/performance/analysis', authenticateToken, async (req, res) => {
    try {
        const analysis = await PerformanceService.analyzePerformance();
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'analyse des performances' });
    }
});

router.get('/performance/history', authenticateToken, async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        const history = await PerformanceService.getHistoricalPerformance(startDate, endDate);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique des performances' });
    }
});

router.get('/performance/trends', authenticateToken, async (req, res) => {
    try {
        const trends = await PerformanceService.getTrends();
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des tendances' });
    }
});

export default router;
