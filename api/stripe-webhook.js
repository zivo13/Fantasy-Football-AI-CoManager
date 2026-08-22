import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key'
);

export const config = {
  api: {
    bodyParser: false, // Required for raw Stripe webhook signature verification
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } else {
      event = JSON.parse(buf.toString());
    }
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.customer_email;
    const planId = session.metadata?.planId || 'pro';
    const stripeCustomerId = session.customer;
    const subscriptionId = session.subscription;

    // Update Supabase Database Profile
    await supabase
      .from('profiles')
      .update({
        plan_id: planId,
        stripe_customer_id: stripeCustomerId
      })
      .eq('email', userEmail);

    // Upsert Subscription record
    if (subscriptionId) {
      await supabase.from('subscriptions').upsert({
        id: subscriptionId,
        user_id: session.metadata?.userId || null,
        plan_id: planId,
        status: 'active',
        stripe_price_id: session.line_items?.data?.[0]?.price?.id || null
      });
    }
  }

  return res.status(200).json({ received: true });
}
