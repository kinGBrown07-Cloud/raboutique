import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../database/db';

const router = express.Router();

// Constantes pour les commissions
const COMMISSION_RATES = {
    lease: 15, // 15% pour les baux agricoles
    listing_sale: 5, // 5% pour les autres ventes
    subscription: 0 // Pas de commission sur les abonnements
};

// Créer une nouvelle transaction
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            type,
            reference_id,
            amount,
            seller_id
        } = req.body;

        const buyer_id = req.user.id;

        // Calculer la commission
        const commission_rate = COMMISSION_RATES[type];
        const commission_amount = (amount * commission_rate) / 100;
        const total_amount = amount + commission_amount;

        // Créer l'intention de paiement (à implémenter avec Stripe ou autre)
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: Math.round(total_amount * 100), // Stripe utilise les centimes
        //     currency: 'eur',
        //     metadata: { type, reference_id }
        // });

        // Créer la transaction
        const [result] = await db.query(
            `INSERT INTO transactions 
            (type, reference_id, amount, commission_rate, commission_amount, 
            buyer_id, seller_id, payment_intent_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                type,
                reference_id,
                amount,
                commission_rate,
                commission_amount,
                buyer_id,
                seller_id,
                'payment_intent_id' // À remplacer par paymentIntent.id
            ]
        );

        res.status(201).json({
            status: 'success',
            data: {
                transaction_id: result.insertId,
                total_amount,
                commission_amount,
                // client_secret: paymentIntent.client_secret
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Confirmer une transaction
router.post('/:id/confirm', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_intent_id } = req.body;

        // Vérifier le paiement avec Stripe
        // const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        // if (paymentIntent.status !== 'succeeded') {
        //     throw new Error('Payment failed');
        // }

        // Mettre à jour la transaction
        await db.query(
            `UPDATE transactions 
            SET status = 'completed', 
                payment_intent_id = ? 
            WHERE id = ?`,
            [payment_intent_id, id]
        );

        // Si c'est un bail, mettre à jour le statut du contrat
        const [transaction] = await db.query(
            'SELECT * FROM transactions WHERE id = ?',
            [id]
        );

        if (transaction[0].type === 'lease') {
            await db.query(
                `UPDATE lease_contracts 
                SET status = 'active' 
                WHERE id = ?`,
                [transaction[0].reference_id]
            );
        }

        res.json({
            status: 'success',
            message: 'Transaction confirmée'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Obtenir l'historique des transactions
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        
        const [transactions] = await db.query(
            `SELECT t.*, 
                    CASE 
                        WHEN t.buyer_id = ? THEN 'achat'
                        WHEN t.seller_id = ? THEN 'vente'
                    END as transaction_type
            FROM transactions t
            WHERE t.buyer_id = ? OR t.seller_id = ?
            ORDER BY t.created_at DESC`,
            [user_id, user_id, user_id, user_id]
        );

        res.json({
            status: 'success',
            data: { transactions }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

export default router;
