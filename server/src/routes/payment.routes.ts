import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { PayPalService } from '../services/payment/paypal.service';
import { CoinpaymentsService } from '../services/payment/coinpayments.service';
import { db } from '../database/db';

const router = express.Router();

// Initialiser un paiement
router.post('/init', authenticateToken, async (req, res) => {
    try {
        const { amount, payment_method, transaction_id, crypto_currency } = req.body;

        // Récupérer les détails de la transaction
        const [transaction] = await db.query(
            'SELECT * FROM transactions WHERE id = ? AND buyer_id = ?',
            [transaction_id, req.user.id]
        );

        if (!transaction.length) {
            return res.status(404).json({
                status: 'error',
                message: 'Transaction non trouvée'
            });
        }

        let paymentDetails;

        switch (payment_method) {
            case 'paypal':
                paymentDetails = await PayPalService.createOrder(amount);
                break;

            case 'crypto':
                paymentDetails = await CoinpaymentsService.createTransaction(
                    amount,
                    'EUR',
                    {
                        cryptoCurrency: crypto_currency,
                        buyer_email: req.user.email,
                        item_name: `Transaction #${transaction_id}`
                    }
                );
                break;

            default:
                return res.status(400).json({
                    status: 'error',
                    message: 'Méthode de paiement non supportée'
                });
        }

        // Mettre à jour la transaction avec les détails du paiement
        await db.query(
            `UPDATE transactions 
            SET payment_method = ?,
                payment_details = ?
            WHERE id = ?`,
            [payment_method, JSON.stringify(paymentDetails), transaction_id]
        );

        res.json({
            status: 'success',
            data: { payment: paymentDetails }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Confirmer un paiement PayPal
router.post('/paypal/capture/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { transaction_id } = req.body;

        const capture = await PayPalService.capturePayment(orderId);

        if (capture.status === 'COMPLETED') {
            await db.query(
                'UPDATE transactions SET status = "completed" WHERE id = ?',
                [transaction_id]
            );
        }

        res.json({
            status: 'success',
            data: { capture }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Webhook pour les notifications IPN de CoinPayments
router.post('/coinpayments/ipn', async (req, res) => {
    try {
        const hmac = req.headers['hmac'];
        
        if (!hmac || !CoinpaymentsService.validateIPNRequest(
            hmac as string,
            req.body,
            process.env.COINPAYMENTS_IPN_SECRET!
        )) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid HMAC'
            });
        }

        const { txn_id, status, amount } = req.body;

        // Récupérer la transaction associée
        const [transaction] = await db.query(
            'SELECT * FROM transactions WHERE payment_details LIKE ?',
            [`%${txn_id}%`]
        );

        if (!transaction.length) {
            return res.status(404).json({
                status: 'error',
                message: 'Transaction not found'
            });
        }

        // Mettre à jour le statut selon la notification
        if (status >= 100 || status === 2) {
            // Paiement confirmé
            await db.query(
                'UPDATE transactions SET status = "completed" WHERE id = ?',
                [transaction[0].id]
            );
        } else if (status < 0) {
            // Paiement échoué
            await db.query(
                'UPDATE transactions SET status = "failed" WHERE id = ?',
                [transaction[0].id]
            );
        }

        res.json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

// Obtenir les taux de change crypto
router.get('/crypto/rates', async (req, res) => {
    try {
        const rates = await CoinpaymentsService.getRates(true);
        res.json({
            status: 'success',
            data: { rates }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
});

export default router;
