# Himachali Salt Store

A React + Vite ecommerce starter for selling one Himachali green salt product online.

## Features

- Product landing page
- Quantity selector and cart summary
- Checkout form
- Netlify Forms order capture
- Responsive mobile layout
- Free static hosting deployment setup

## Run locally

Install Node.js LTS from <https://nodejs.org>, then run:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Free deployment with Netlify

Netlify is the easiest free option for this version because it can also collect checkout form submissions.

1. Create a free account at <https://www.netlify.com/>.
2. Push this folder to a GitHub repository.
3. In Netlify, choose **Add new site** > **Import an existing project**.
4. Connect your GitHub repository.
5. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy the site.
7. After the first deploy, open Netlify dashboard > your site > **Forms** to see submitted orders.

## Free deployment with GitHub Pages

GitHub Pages can host the website for free, but it will not collect form submissions by itself. Use Netlify if you want order submissions without adding a backend.

## Next upgrades

- Add Razorpay, Stripe, or Cashfree payment collection.
- Add product variants such as 500 g, 1 kg, and 5 kg.
- Add an admin dashboard backed by Supabase or Firebase.
- Add delivery zone validation by pincode.
