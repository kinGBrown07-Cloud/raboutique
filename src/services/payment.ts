import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export async function createPaymentSession(listingId: string, amount: number) {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    // TODO: Call your backend to create a payment session
    const response = await fetch('/api/create-payment-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, amount }),
    });

    const session = await response.json();
    return stripe.redirectToCheckout({ sessionId: session.id });
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}