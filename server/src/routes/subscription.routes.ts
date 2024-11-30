import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../database/db';

const router = express.Router();

// Obtenir tous les plans d'abonnement
router.get('/plans', async (req, res) => {
    try {
        const [plans] = await db.query('SELECT * FROM subscription_plans');
        res.json({
            status: 'success',
            data: { plans }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Souscrire à un plan
router.post('/subscribe', authenticateToken, async (req, res) => {
    try {
        const { plan_id, duration_months, promo_code } = req.body;
        const user_id = req.user.id;

        // Vérifier si l'utilisateur a déjà un abonnement actif
        const [existingSubscription] = await db.query(
            `SELECT * FROM user_subscriptions 
            WHERE user_id = ? AND status = 'active'`,
            [user_id]
        );

        if (existingSubscription.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Vous avez déjà un abonnement actif'
            });
        }

        // Récupérer les détails du plan
        const [plan] = await db.query(
            'SELECT * FROM subscription_plans WHERE id = ?',
            [plan_id]
        );

        if (!plan.length) {
            return res.status(404).json({
                status: 'error',
                message: 'Plan non trouvé'
            });
        }

        let promotion = null;
        let final_price = plan[0].price * duration_months;

        // Vérifier le code promo si fourni
        if (promo_code) {
            const [promo] = await db.query(
                `SELECT * FROM promotions 
                WHERE promo_code = ? 
                AND status = 'active' 
                AND start_date <= CURDATE() 
                AND end_date >= CURDATE()
                AND min_subscription_months <= ?`,
                [promo_code, duration_months]
            );

            if (promo.length > 0) {
                promotion = promo[0];
                const discount = (final_price * promotion.discount_percentage) / 100;
                final_price -= discount;
            }
        }

        // Calculer les dates
        const start_date = new Date();
        const end_date = new Date();
        end_date.setMonth(end_date.getMonth() + duration_months);

        // Créer la transaction
        const [transaction] = await db.query(
            `INSERT INTO transactions 
            (type, reference_id, amount, commission_rate, commission_amount, 
            buyer_id, seller_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'subscription',
                plan_id,
                final_price,
                0, // Pas de commission sur les abonnements
                0,
                user_id,
                1, // ID de l'administrateur/plateforme
                'pending'
            ]
        );

        // Créer l'abonnement
        const [subscription] = await db.query(
            `INSERT INTO user_subscriptions 
            (user_id, plan_id, start_date, end_date, 
            promotion_id, original_price, payment_status) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [
                user_id,
                plan_id,
                start_date,
                end_date,
                promotion?.id || null,
                plan[0].price * duration_months,
            ]
        );

        res.status(201).json({
            status: 'success',
            data: {
                subscription_id: subscription.insertId,
                transaction_id: transaction.insertId,
                original_price: plan[0].price * duration_months,
                final_price,
                discount: promotion ? promotion.discount_percentage : 0,
                start_date,
                end_date
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Vérifier le statut d'abonnement
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const [subscription] = await db.query(
            `SELECT us.*, sp.* 
            FROM user_subscriptions us 
            JOIN subscription_plans sp ON us.plan_id = sp.id 
            WHERE us.user_id = ? AND us.status = 'active'
            ORDER BY us.created_at DESC 
            LIMIT 1`,
            [req.user.id]
        );

        if (!subscription.length) {
            return res.json({
                status: 'success',
                data: { 
                    has_subscription: false 
                }
            });
        }

        res.json({
            status: 'success',
            data: {
                has_subscription: true,
                subscription: subscription[0]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Renouveler un abonnement
router.post('/renew', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        // Récupérer l'abonnement actuel
        const [currentSubscription] = await db.query(
            `SELECT us.*, sp.* 
            FROM user_subscriptions us 
            JOIN subscription_plans sp ON us.plan_id = sp.id 
            WHERE us.user_id = ? AND us.status = 'active'`,
            [user_id]
        );

        if (!currentSubscription.length) {
            return res.status(400).json({
                status: 'error',
                message: 'Aucun abonnement actif trouvé'
            });
        }

        // Calculer les nouvelles dates
        const start_date = new Date(currentSubscription[0].end_date);
        const end_date = new Date(start_date);
        end_date.setMonth(end_date.getMonth() + currentSubscription[0].duration_months);

        // Créer le nouvel abonnement
        const [subscription] = await db.query(
            `INSERT INTO user_subscriptions 
            (user_id, plan_id, start_date, end_date, payment_status) 
            VALUES (?, ?, ?, ?, 'completed')`,
            [user_id, currentSubscription[0].plan_id, start_date, end_date]
        );

        res.status(201).json({
            status: 'success',
            data: {
                subscription_id: subscription.insertId,
                start_date,
                end_date
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

export default router;
