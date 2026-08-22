import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userEmail, userId, billingCycle } = req.body;
    const origin = req.headers.origin || 'https://supermacho.app';

    // Map plan to price IDs (set these in Stripe & Vercel env)
    let priceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

    if (planId === 'pro') {
      priceId = billingCycle === 'seasonal' 
        ? process.env.STRIPE_PRO_SEASONAL_PRICE_ID 
        : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    } else if (planId === 'commissioner') {
      priceId = billingCycle === 'seasonal' 
        ? process.env.STRIPE_COMMISSIONER_SEASONAL_PRICE_ID 
        : process.env.STRIPE_COMMISSIONER_MONTHLY_PRICE_ID;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId || 'price_test_placeholder',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      metadata: {
        userId: userId || '',
        planId: planId,
        billingCycle: billingCycle
      }
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
