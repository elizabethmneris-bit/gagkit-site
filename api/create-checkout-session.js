// /api/create-checkout-session.js
// Works on Vercel/Netlify. Set env var STRIPE_SECRET_KEY. Replace baseUrl if needed.

import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

  const { cart } = req.body || {};
  if (!Array.isArray(cart) || cart.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  // Map product IDs to price data (you can swap to pre-created Stripe Price IDs)
  const priceMap = {
    'mental-breakdown': { name: 'Mental Breakdown Kit', unit_amount: 3400 },
    'office-meltdown': { name: 'Office Meltdown Kit', unit_amount: 2900 },
    'breakup-survival': { name: 'Breakup Survival Kit', unit_amount: 2800 },
    'adulting-starter': { name: 'Adulting Starter Pack', unit_amount: 2500 },
    'birthday-breakdown': { name: 'Birthday Breakdown Kit', unit_amount: 2700 },
    'bad-day-fix': { name: 'Bad Day Fix Kit', unit_amount: 2400 }
  };

  const line_items = cart.map(item => {
    const pm = priceMap[item.id];
    if (!pm) return null;
    return {
      price_data: {
        currency: 'usd',
        product_data: { name: pm.name },
        unit_amount: pm.unit_amount
      },
      quantity: item.qty || 1
    };
  }).filter(Boolean);

  if (line_items.length === 0) {
    res.status(400).json({ error: 'No valid items' });
    return;
  }

  try {
    const origin = req.headers.origin || process.env.BASE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_address_collection: { allowed_countries: ['US'] },
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/cancel.html`
    });
    res.status(200).json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
