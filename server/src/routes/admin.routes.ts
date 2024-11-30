import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { ReportService } from '../services/report.service';
import { RefundService } from '../services/refund.service';
import { FeeService } from '../services/payment/fee.service';

const router = express.Router();

// Middleware pour vérifier les droits admin
router.use(authenticateToken, isAdmin);

// Rapports financiers
router.get('/reports/financial', async (req, res) => {
    try {
        const { start_date, end_date, ...filters } = req.query;
        
        const report = await ReportService.generateFinancialReport(
            {
                start_date: start_date as string,
                end_date: end_date as string
            },
            filters as any
        );

        res.json({
            status: 'success',
            data: { report }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Revenus par période
router.get('/reports/revenue/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const { limit } = req.query;

        const revenue = await ReportService.getRevenueByPeriod(
            period as any,
            Number(limit) || 12
        );

        res.json({
            status: 'success',
            data: { revenue }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Top vendeurs
router.get('/reports/top-sellers', async (req, res) => {
    try {
        const { start_date, end_date, limit } = req.query;

        const topSellers = await ReportService.getTopSellers(
            {
                start_date: start_date as string,
                end_date: end_date as string
            },
            Number(limit) || 10
        );

        res.json({
            status: 'success',
            data: { topSellers }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Statistiques des méthodes de paiement
router.get('/reports/payment-stats', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const stats = await ReportService.getPaymentMethodStats({
            start_date: start_date as string,
            end_date: end_date as string
        });

        res.json({
            status: 'success',
            data: { stats }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Statistiques des remboursements
router.get('/reports/refund-stats', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const stats = await ReportService.getRefundStats({
            start_date: start_date as string,
            end_date: end_date as string
        });

        res.json({
            status: 'success',
            data: { stats }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Configuration des paiements
router.get('/payment-config/:provider/:key', async (req, res) => {
    try {
        const { provider, key } = req.params;
        
        const config = await FeeService.getPaymentConfig(provider, key);
        
        res.json({
            status: 'success',
            data: { config }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

router.put('/payment-config/:provider/:key', async (req, res) => {
    try {
        const { provider, key } = req.params;
        const { value } = req.body;

        await FeeService.updatePaymentConfig(provider, key, value);

        res.json({
            status: 'success',
            message: 'Configuration mise à jour avec succès'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Gestion des remboursements
router.post('/refunds/process', async (req, res) => {
    try {
        const refundResult = await RefundService.processRefund({
            ...req.body,
            requested_by: req.user.id
        });

        res.json({
            status: 'success',
            data: { refund: refundResult }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

export default router;
