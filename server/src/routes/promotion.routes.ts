import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../database/db';

const router = express.Router();

// Obtenir toutes les promotions actives
router.get('/active', async (req, res) => {
    try {
        const [promotions] = await db.query(
            `SELECT * FROM promotions 
            WHERE status = 'active' 
            AND start_date <= CURDATE() 
            AND end_date >= CURDATE()`
        );

        res.json({
            status: 'success',
            data: { promotions }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Vérifier un code promo
router.get('/verify/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const [promotion] = await db.query(
            `SELECT * FROM promotions 
            WHERE promo_code = ? 
            AND status = 'active' 
            AND start_date <= CURDATE() 
            AND end_date >= CURDATE()`,
            [code]
        );

        if (!promotion.length) {
            return res.status(404).json({
                status: 'error',
                message: 'Code promo invalide ou expiré'
            });
        }

        res.json({
            status: 'success',
            data: { promotion: promotion[0] }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Créer une nouvelle promotion (admin seulement)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            name,
            description,
            discount_percentage,
            start_date,
            end_date,
            promo_code,
            min_subscription_months
        } = req.body;

        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé'
            });
        }

        const [result] = await db.query(
            `INSERT INTO promotions 
            (name, description, discount_percentage, start_date, end_date, promo_code, min_subscription_months) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, description, discount_percentage, start_date, end_date, promo_code, min_subscription_months]
        );

        res.status(201).json({
            status: 'success',
            data: {
                promotion_id: result.insertId
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

export default router;
