# Gagkit — Retro E‑commerce (Stripe + Email)

**What’s included**
- Retro homepage (`index.html`) with product grid and featured kit
- Product details modal with **“What’s inside”** lists
- Anonymous sender option in checkout
- **Stripe Checkout** via `/api/create-checkout-session.js` (serverless)
- Email order fallback via **Formspree**
- Success & Cancel pages

## Quick start (no code hosting)
1. Drag this folder to **Netlify** or **Vercel**.
2. Set env var **STRIPE_SECRET_KEY** (from your Stripe dashboard).
3. Deploy. Open `/checkout.html` and use **Pay with Card**.

## Formspree (email orders)
- Create a form at Formspree, then replace the `action` in `checkout.html`.
- You’ll receive the cart JSON and totals by email.

## Edit products
Open `app.js` and edit the `PRODUCTS` array:
- `name`, `price`, `blurb`
- `contents: []` list for the "What's inside" bullets
- `image` paths in `/assets`

## Taxes & Shipping
```js
const TAX_RATE = 0.07;
const SHIPPING_FLAT = 5.99;
```

## Local testing
Use a simple static server (or Vercel CLI). For serverless API locally, Vercel dev proxies `/api`.
