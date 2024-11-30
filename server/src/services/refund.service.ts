import { db } from '../database/db';
import { PayPalService } from './payment/paypal.service';
import { CoinpaymentsService } from './payment/coinpayments.service';
import { TransactionService } from './transaction.service';

interface RefundRequest {
    transaction_id: number;
    reason: string;
    amount?: number; // Si null, remboursement total
    requested_by: number; // ID de l'utilisateur
}

export class RefundService {
    static async processRefund(request: RefundRequest) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Récupérer les détails de la transaction
            const transaction = await TransactionService.getTransaction(request.transaction_id);
            
            if (!transaction) {
                throw new Error('Transaction non trouvée');
            }

            if (transaction.status === 'refunded') {
                throw new Error('Transaction déjà remboursée');
            }

            const refundAmount = request.amount || transaction.amount;
            let refundResult;

            // Traiter le remboursement selon la méthode de paiement
            if (transaction.payment_method === 'paypal') {
                const paymentDetails = JSON.parse(transaction.payment_details);
                refundResult = await PayPalService.refundPayment(
                    paymentDetails.capture_id,
                    refundAmount
                );
            } else if (transaction.payment_method === 'crypto') {
                const paymentDetails = JSON.parse(transaction.payment_details);
                refundResult = await CoinpaymentsService.createWithdrawal(
                    refundAmount,
                    transaction.crypto_currency,
                    paymentDetails.buyer_address
                );
            }

            // Enregistrer le remboursement
            await connection.query(
                `INSERT INTO refunds (
                    transaction_id,
                    amount,
                    reason,
                    requested_by,
                    refund_details,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    request.transaction_id,
                    refundAmount,
                    request.reason,
                    request.requested_by,
                    JSON.stringify(refundResult),
                    'completed'
                ]
            );

            // Mettre à jour le statut de la transaction
            await TransactionService.updateTransaction({
                transaction_id: request.transaction_id,
                status: 'refunded',
                payment_details: {
                    ...JSON.parse(transaction.payment_details),
                    refund: refundResult
                }
            });

            // Mettre à jour les entités liées si nécessaire
            switch (transaction.type) {
                case 'subscription':
                    await connection.query(
                        'UPDATE user_subscriptions SET status = "cancelled" WHERE id = ?',
                        [transaction.reference_id]
                    );
                    break;
                case 'lease':
                    await connection.query(
                        'UPDATE lease_applications SET status = "cancelled" WHERE id = ?',
                        [transaction.reference_id]
                    );
                    break;
                case 'listing_sale':
                    await connection.query(
                        'UPDATE listings SET status = "available" WHERE id = ?',
                        [transaction.reference_id]
                    );
                    break;
            }

            await connection.commit();
            return refundResult;
        } catch (error) {
            await connection.rollback();
            console.error('Process refund error:', error);
            throw new Error('Erreur lors du traitement du remboursement');
        } finally {
            connection.release();
        }
    }

    static async getRefundableTransactions(userId: number) {
        try {
            const query = `
                SELECT t.*,
                    DATEDIFF(CURRENT_TIMESTAMP, t.created_at) as days_since_purchase,
                    CASE 
                        WHEN t.type = 'subscription' THEN 'Abonnement'
                        WHEN t.type = 'lease' THEN 'Location'
                        WHEN t.type = 'listing_sale' THEN 'Vente'
                    END as transaction_type
                FROM transactions t
                WHERE t.buyer_id = ?
                AND t.status = 'completed'
                AND t.created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY)
                AND t.id NOT IN (SELECT transaction_id FROM refunds)
            `;

            const [transactions] = await db.query(query, [userId]);
            return transactions;
        } catch (error) {
            console.error('Get refundable transactions error:', error);
            throw new Error('Erreur lors de la récupération des transactions remboursables');
        }
    }

    static async getRefundHistory(userId: number) {
        try {
            const query = `
                SELECT r.*,
                    t.amount as original_amount,
                    t.payment_method,
                    t.type as transaction_type,
                    u.username as requested_by_user
                FROM refunds r
                JOIN transactions t ON r.transaction_id = t.id
                JOIN users u ON r.requested_by = u.id
                WHERE t.buyer_id = ? OR t.seller_id = ?
                ORDER BY r.created_at DESC
            `;

            const [refunds] = await db.query(query, [userId, userId]);
            return refunds;
        } catch (error) {
            console.error('Get refund history error:', error);
            throw new Error('Erreur lors de la récupération de l\'historique des remboursements');
        }
    }

    static async getAutomaticRefundEligibility(transactionId: number): Promise<{
        eligible: boolean;
        reason?: string;
        max_refund_amount?: number;
    }> {
        try {
            const transaction = await TransactionService.getTransaction(transactionId);
            
            if (!transaction) {
                return { eligible: false, reason: 'Transaction non trouvée' };
            }

            const daysSincePurchase = Math.floor(
                (Date.now() - new Date(transaction.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            // Règles de remboursement automatique
            switch (transaction.type) {
                case 'subscription':
                    if (daysSincePurchase <= 14) {
                        const unusedDays = 30 - daysSincePurchase;
                        const maxRefund = (transaction.amount / 30) * unusedDays;
                        return {
                            eligible: true,
                            max_refund_amount: Number(maxRefund.toFixed(2))
                        };
                    }
                    break;

                case 'lease':
                    if (daysSincePurchase <= 2 && transaction.status === 'completed') {
                        return {
                            eligible: true,
                            max_refund_amount: transaction.amount
                        };
                    }
                    break;

                case 'listing_sale':
                    if (daysSincePurchase <= 7 && transaction.status === 'completed') {
                        return {
                            eligible: true,
                            max_refund_amount: transaction.amount
                        };
                    }
                    break;
            }

            return {
                eligible: false,
                reason: 'En dehors de la période de remboursement automatique'
            };
        } catch (error) {
            console.error('Get refund eligibility error:', error);
            throw new Error('Erreur lors de la vérification d\'éligibilité au remboursement');
        }
    }
}
