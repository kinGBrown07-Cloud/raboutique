import { db } from '../../database/db';

interface FeeCalculation {
    fee_amount: number;
    total_amount: number;
    crypto_amount?: number;
}

export class FeeService {
    static async calculateFees(
        amount: number,
        payment_method: 'paypal' | 'crypto',
        crypto_currency?: string
    ): Promise<FeeCalculation> {
        try {
            // Récupérer les configurations de frais
            const [configs] = await db.query(
                'SELECT config_key, config_value FROM payment_configs WHERE provider = ?',
                [payment_method]
            );

            const configMap = configs.reduce((acc: any, curr: any) => {
                acc[curr.config_key] = JSON.parse(curr.config_value);
                return acc;
            }, {});

            let fee_amount = 0;
            let crypto_amount;

            if (payment_method === 'paypal') {
                // PayPal: commission percentage + fixed fee
                fee_amount = (amount * configMap.commission_rate) + configMap.fixed_fee;
            } else if (payment_method === 'crypto') {
                // Crypto: commission + network fee
                fee_amount = (amount * configMap.commission_rate) + (amount * configMap.network_fee);

                if (crypto_currency) {
                    // Récupérer le taux de conversion
                    const [rate] = await db.query(
                        'SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ? ORDER BY timestamp DESC LIMIT 1',
                        ['EUR', crypto_currency]
                    );

                    if (rate.length > 0) {
                        crypto_amount = amount * rate[0].rate;
                    }
                }
            }

            return {
                fee_amount: Number(fee_amount.toFixed(2)),
                total_amount: Number((amount + fee_amount).toFixed(2)),
                ...(crypto_amount && { crypto_amount: Number(crypto_amount.toFixed(8)) })
            };
        } catch (error) {
            console.error('Fee calculation error:', error);
            throw new Error('Erreur lors du calcul des frais');
        }
    }

    static async updateExchangeRate(
        from_currency: string,
        to_currency: string,
        rate: number,
        source: string = 'coinpayments'
    ) {
        try {
            await db.query(
                `INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                rate = VALUES(rate),
                timestamp = CURRENT_TIMESTAMP`,
                [from_currency, to_currency, rate, source]
            );
        } catch (error) {
            console.error('Exchange rate update error:', error);
            throw new Error('Erreur lors de la mise à jour du taux de change');
        }
    }

    static async getPaymentConfig(provider: string, key: string): Promise<any> {
        try {
            const [config] = await db.query(
                'SELECT config_value FROM payment_configs WHERE provider = ? AND config_key = ? AND is_active = true',
                [provider, key]
            );

            return config.length > 0 ? JSON.parse(config[0].config_value) : null;
        } catch (error) {
            console.error('Get payment config error:', error);
            throw new Error('Erreur lors de la récupération de la configuration');
        }
    }

    static async updatePaymentConfig(
        provider: string,
        key: string,
        value: any
    ): Promise<void> {
        try {
            await db.query(
                `INSERT INTO payment_configs (provider, config_key, config_value)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                config_value = VALUES(config_value)`,
                [provider, key, JSON.stringify(value)]
            );
        } catch (error) {
            console.error('Update payment config error:', error);
            throw new Error('Erreur lors de la mise à jour de la configuration');
        }
    }
}
