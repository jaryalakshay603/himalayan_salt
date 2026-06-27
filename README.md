# Himachali Salt Store

A React + Vite ecommerce starter for selling one Himachali green salt product online.

## Features

- Product landing page
- Quantity selector and cart summary
- Checkout form
- SMTP email notifications through a Netlify Function
- Owner contact links for WhatsApp and email fallback
- Instagram reference link
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
7. Add these environment variables in Netlify dashboard > your site > **Site configuration** > **Environment variables**:
   - `EMAIL_USER`: your Gmail address
   - `EMAIL_APP_PASSWORD`: your Gmail app password, without spaces
   - `ORDER_RECEIVER_EMAIL`: the address that should receive order emails
8. Redeploy the site after saving environment variables.

## Order Notifications

The checkout sends each order to `/.netlify/functions/send-order-email`, which uses Gmail SMTP through Nodemailer. The order also includes owner contact actions for:

- WhatsApp: `+91 85590 23422`
- Email: `jaryalakshay603@gmail.com`
- Instagram reference: <https://www.instagram.com/p/DaBH0oHhrGC/?igsh=MTlsbTY0bXBjNWVmYw==>

After a customer submits an order, the site shows prefilled **Send on WhatsApp** and **Send email** actions. Fully automatic WhatsApp notifications require a service such as WhatsApp Business API, Zapier, Make, or a small backend.

For local SMTP testing, use Netlify CLI (`netlify dev`) so the serverless function is available. Plain `npm run dev` only starts Vite and will not run Netlify Functions.

## Free deployment with GitHub Pages

GitHub Pages can host the website for free, but it will not collect form submissions by itself. Use Netlify if you want order submissions without adding a backend.

## Next upgrades

- Add Razorpay, Stripe, or Cashfree payment collection.
- Add product variants such as 500 g, 1 kg, and 5 kg.
- Add an admin dashboard backed by Supabase or Firebase.
- Add delivery zone validation by pincode.
