import Coinpayments from 'coinpayments';

const client = new Coinpayments({
    key: process.env.COINPAYMENTS_PUBLIC_KEY!,
    secret: process.env.COINPAYMENTS_PRIVATE_KEY!
});

export class CoinpaymentsService {
    static async createTransaction(amount: number, currency: string = 'EUR', options: any = {}) {
        try {
            const transaction = await client.createTransaction({
                currency1: currency,
                currency2: options.cryptoCurrency || 'BTC',
                amount: amount,
                buyer_email: options.buyer_email,
                item_name: options.item_name || 'REMag Payment',
                ipn_url: `${process.env.API_URL}/api/payments/coinpayments/ipn`
            });

            return {
                id: transaction.txn_id,
                address: transaction.address,
                amount: transaction.amount,
                confirms_needed: transaction.confirms_needed,
                timeout: transaction.timeout,
                status_url: transaction.status_url,
                qrcode_url: transaction.qrcode_url
            };
        } catch (error) {
            console.error('Coinpayments Create Transaction Error:', error);
            throw new Error('Erreur lors de la création de la transaction crypto');
        }
    }

    static async getTransactionInfo(txId: string) {
        try {
            const info = await client.getTx({ txid: txId });
            return {
                id: info.txn_id,
                status: info.status,
                amount: info.amount,
                received: info.received,
                confirms: info.confirms,
                time_created: info.time_created,
                time_expires: info.time_expires
            };
        } catch (error) {
            console.error('Coinpayments Get Transaction Info Error:', error);
            throw new Error('Erreur lors de la récupération des informations de transaction');
        }
    }

    static async getCallbackAddress(currency: string = 'BTC', ipnUrl?: string) {
        try {
            const result = await client.getCallbackAddress({
                currency,
                ipn: ipnUrl
            });

            return {
                address: result.address,
                pubkey: result.pubkey,
                dest_tag: result.dest_tag
            };
        } catch (error) {
            console.error('Coinpayments Get Callback Address Error:', error);
            throw new Error('Erreur lors de la création de l\'adresse de callback');
        }
    }

    static async getRates(accepted: boolean = true) {
        try {
            const rates = await client.rates({
                accepted: accepted
            });

            return rates;
        } catch (error) {
            console.error('Coinpayments Get Rates Error:', error);
            throw new Error('Erreur lors de la récupération des taux');
        }
    }

    static async createWithdrawal(amount: number, currency: string, address: string) {
        try {
            const withdrawal = await client.createWithdrawal({
                amount,
                currency,
                address
            });

            return {
                id: withdrawal.id,
                status: withdrawal.status,
                amount: withdrawal.amount
            };
        } catch (error) {
            console.error('Coinpayments Create Withdrawal Error:', error);
            throw new Error('Erreur lors de la création du retrait');
        }
    }

    static validateIPNRequest(hmac: string, payload: any, ipnSecret: string) {
        const calculatedHmac = require('crypto')
            .createHmac('sha512', ipnSecret)
            .update(JSON.stringify(payload))
            .digest('hex');

        return hmac === calculatedHmac;
    }
}
