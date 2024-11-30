import { db } from '../database/db';
import { FeeService } from './payment/fee.service';

interface CreateTransactionParams {
    buyer_id: number;
    seller_id: number;
    type: 'subscription' | 'lease' | 'listing_sale';
    reference_id: number;
    amount: number;
    payment_method: 'paypal' | 'crypto';
    crypto_currency?: string;
}

interface UpdateTransactionParams {
    transaction_id: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    payment_details?: any;
}

export class TransactionService {
    static async createTransaction(params: CreateTransactionParams) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Calculer les frais et commissions
            const { fee_amount, total_amount, crypto_amount } = await FeeService.calculateFees(
                params.amount,
                params.payment_method,
                params.crypto_currency
            );

            // Déterminer le taux de commission selon le type
            let commission_rate;
            switch (params.type) {
                case 'lease':
                    commission_rate = 0.15; // 15% pour les baux
                    break;
                case 'listing_sale':
                    commission_rate = 0.05; // 5% pour les ventes
                    break;
                case 'subscription':
                    commission_rate = 0; // Pas de commission sur les abonnements
                    break;
                default:
                    commission_rate = 0;
            }

            const commission_amount = params.amount * commission_rate;

            // Créer la transaction
            const [result] = await connection.query(
                `INSERT INTO transactions (
                    buyer_id, seller_id, type, reference_id,
                    amount, payment_method, fee_amount, fee_currency,
                    crypto_amount, crypto_currency,
                    commission_rate, commission_amount
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    params.buyer_id,
                    params.seller_id,
                    params.type,
                    params.reference_id,
                    params.amount,
                    params.payment_method,
                    fee_amount,
                    'EUR',
                    crypto_amount || null,
                    params.crypto_currency || null,
                    commission_rate,
                    commission_amount
                ]
            );

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            console.error('Create transaction error:', error);
            throw new Error('Erreur lors de la création de la transaction');
        } finally {
            connection.release();
        }
    }

    static async updateTransaction(params: UpdateTransactionParams) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Mettre à jour la transaction
            await connection.query(
                `UPDATE transactions
                SET status = ?,
                    payment_details = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    params.status,
                    params.payment_details ? JSON.stringify(params.payment_details) : null,
                    params.transaction_id
                ]
            );

            // Si la transaction est complétée, mettre à jour les entités liées
            if (params.status === 'completed') {
                const [transaction] = await connection.query(
                    'SELECT * FROM transactions WHERE id = ?',
                    [params.transaction_id]
                );

                if (transaction.length > 0) {
                    const tx = transaction[0];

                    switch (tx.type) {
                        case 'subscription':
                            await connection.query(
                                'UPDATE user_subscriptions SET payment_status = "completed" WHERE id = ?',
                                [tx.reference_id]
                            );
                            break;

                        case 'lease':
                            await connection.query(
                                'UPDATE lease_applications SET status = "approved" WHERE id = ?',
                                [tx.reference_id]
                            );
                            break;

                        case 'listing_sale':
                            await connection.query(
                                'UPDATE listings SET status = "sold" WHERE id = ?',
                                [tx.reference_id]
                            );
                            break;
                    }
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            console.error('Update transaction error:', error);
            throw new Error('Erreur lors de la mise à jour de la transaction');
        } finally {
            connection.release();
        }
    }

    static async getTransaction(id: number) {
        try {
            const [transaction] = await db.query(
                'SELECT * FROM transactions WHERE id = ?',
                [id]
            );

            return transaction.length > 0 ? transaction[0] : null;
        } catch (error) {
            console.error('Get transaction error:', error);
            throw new Error('Erreur lors de la récupération de la transaction');
        }
    }

    static async getUserTransactions(userId: number, role: 'buyer' | 'seller' = 'buyer') {
        try {
            const [transactions] = await db.query(
                `SELECT t.*, 
                    CASE 
                        WHEN t.type = 'subscription' THEN sp.name
                        WHEN t.type = 'lease' THEN l.title
                        WHEN t.type = 'listing_sale' THEN ls.title
                    END as item_name
                FROM transactions t
                LEFT JOIN user_subscriptions us ON t.type = 'subscription' AND t.reference_id = us.id
                LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
                LEFT JOIN lease_applications la ON t.type = 'lease' AND t.reference_id = la.id
                LEFT JOIN listings l ON la.listing_id = l.id
                LEFT JOIN listings ls ON t.type = 'listing_sale' AND t.reference_id = ls.id
                WHERE t.${role}_id = ?
                ORDER BY t.created_at DESC`,
                [userId]
            );

            return transactions;
        } catch (error) {
            console.error('Get user transactions error:', error);
            throw new Error('Erreur lors de la récupération des transactions');
        }
    }
}
