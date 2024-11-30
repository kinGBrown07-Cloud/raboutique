import paypal from '@paypal/checkout-server-sdk';

// Configuration PayPal
const environment = process.env.PAYPAL_MODE === 'production'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    );

const client = new paypal.core.PayPalHttpClient(environment);

export class PayPalService {
    static async createOrder(amount: number, currency: string = 'EUR') {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount.toString()
                }
            }]
        });

        try {
            const order = await client.execute(request);
            return {
                id: order.result.id,
                status: order.result.status,
                links: order.result.links
            };
        } catch (error) {
            console.error('PayPal Create Order Error:', error);
            throw new Error('Erreur lors de la création de la commande PayPal');
        }
    }

    static async capturePayment(orderId: string) {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        try {
            const capture = await client.execute(request);
            return {
                id: capture.result.id,
                status: capture.result.status,
                payer: capture.result.payer
            };
        } catch (error) {
            console.error('PayPal Capture Payment Error:', error);
            throw new Error('Erreur lors de la capture du paiement PayPal');
        }
    }

    static async getOrderDetails(orderId: string) {
        const request = new paypal.orders.OrdersGetRequest(orderId);

        try {
            const order = await client.execute(request);
            return order.result;
        } catch (error) {
            console.error('PayPal Get Order Details Error:', error);
            throw new Error('Erreur lors de la récupération des détails de la commande');
        }
    }

    static async refundPayment(captureId: string, amount?: number) {
        const request = new paypal.payments.CapturesRefundRequest(captureId);
        
        if (amount) {
            request.requestBody({
                amount: {
                    value: amount.toString(),
                    currency_code: 'EUR'
                }
            });
        }

        try {
            const refund = await client.execute(request);
            return {
                id: refund.result.id,
                status: refund.result.status
            };
        } catch (error) {
            console.error('PayPal Refund Error:', error);
            throw new Error('Erreur lors du remboursement');
        }
    }
}
