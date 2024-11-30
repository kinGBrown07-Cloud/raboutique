import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';
import { LogService } from '../services/log.service';

const router = express.Router();

// Middleware pour vérifier les droits admin
router.use(authenticateToken, isAdmin);

// Récupérer les logs système avec filtres
router.get('/system', async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            level,
            category,
            userId,
            limit,
            offset
        } = req.query;

        const logs = await LogService.getSystemLogs({
            startDate: startDate as string,
            endDate: endDate as string,
            level: level as string,
            category: category as string,
            userId: userId ? parseInt(userId as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });

        res.json({
            status: 'success',
            data: { logs }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Récupérer les logs d'activité d'un utilisateur
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const logs = await LogService.getUserActivityLogs(parseInt(userId));

        res.json({
            status: 'success',
            data: { logs }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Récupérer les logs de paiement d'une transaction
router.get('/payment/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const logs = await LogService.getPaymentLogs(parseInt(transactionId));

        res.json({
            status: 'success',
            data: { logs }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Récupérer les logs d'erreur
router.get('/errors', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 'error',
                message: 'Les dates de début et de fin sont requises'
            });
        }

        const logs = await LogService.getErrorLogs(
            startDate as string,
            endDate as string
        );

        res.json({
            status: 'success',
            data: { logs }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

export default router;
