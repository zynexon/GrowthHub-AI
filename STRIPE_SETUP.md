# Stripe Checkout Setup Guide

## Overview
GrowthHub AI uses Stripe for subscription billing. This guide will help you complete the Stripe integration.

## Prerequisites
- Stripe account (create one at https://stripe.com)
- Access to your Stripe Dashboard

---

## Step 1: Create Products in Stripe Dashboard

### 1.1 Create Pro Plan Product
1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Fill in details:
   - **Name:** GrowthHub AI - Pro Plan
   - **Description:** Professional plan with extended limits
   - **Pricing:** Recurring
   - **Price:** $49.00 USD
   - **Billing period:** Monthly
4. Click "Save product"
5. **Copy the Price ID** (starts with `price_...`)

### 1.2 Create Enterprise Plan Product
1. Click "Add product" again
2. Fill in details:
   - **Name:** GrowthHub AI - Enterprise Plan
   - **Description:** Enterprise plan with unlimited features
   - **Pricing:** Recurring
   - **Price:** $199.00 USD
   - **Billing period:** Monthly
3. Click "Save product"
4. **Copy the Price ID** (starts with `price_...`)

---

## Step 2: Update Environment Variables

Update your `backend/.env` file with the actual Price IDs:

```env
# Replace these placeholder values with your actual Stripe Price IDs
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx
```

### Get Your Stripe API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** (starts with `sk_test_...` for test mode)
3. Update in `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

---

## Step 3: Run Database Migration

Run the subscription fields migration in your Supabase SQL Editor:

```sql
-- File: database/add-subscription-fields.sql
-- Add subscription-related columns to organizations table

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'free';

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS current_period_start BIGINT;

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS current_period_end BIGINT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id 
ON organizations(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_organizations_plan_type 
ON organizations(plan_type);

CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status 
ON organizations(subscription_status);
```

---

## Step 4: Set Up Stripe Webhook (Optional but Recommended)

Webhooks allow Stripe to notify your app about subscription changes.

### 4.1 Create Webhook Endpoint
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/stripe/webhook`
   - For local development: Use ngrok or similar tunnel service
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy the Signing secret** (starts with `whsec_...`)

### 4.2 Update Environment Variable
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## Step 5: Test the Integration

### Test with Stripe Test Mode
1. Make sure you're using test mode keys (sk_test_... and price_test_...)
2. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and CVC

### Test Checkout Flow
1. Login to your GrowthHub AI app
2. Try to exceed a free plan limit (e.g., create more than 3 jobs)
3. Click "Upgrade to Pro" in the modal
4. Complete the Stripe Checkout flow
5. Verify subscription is active in Stripe Dashboard
6. Verify plan_type is updated in your database

---

## Step 6: Go Live

### Switch to Production Mode
1. Get your production API keys from Stripe Dashboard
2. Create production products (same as test mode)
3. Update `.env` with production keys:
```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_live_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxx
```

---

## Pricing Plans Summary

| Feature | Free | Pro ($49/mo) | Enterprise ($199/mo) |
|---------|------|--------------|---------------------|
| Datasets | 1 (100 rows) | 10 (10k rows) | Unlimited |
| Talent Profiles | 3 | 20 | Unlimited |
| Jobs | 3 | Unlimited | Unlimited |
| CSV Export | ❌ | ✅ | ✅ |
| API Access | ❌ | Limited | Full |
| Label Types | 1 | 2 | All |

---

## Troubleshooting

### Checkout Session Not Creating
- Check that Price IDs are correct in .env
- Verify Stripe API key is valid
- Check backend console for errors

### Webhook Not Receiving Events
- Verify webhook URL is accessible from internet
- Check webhook signing secret is correct
- Look at webhook logs in Stripe Dashboard

### Subscription Not Updating in Database
- Check webhook is configured and receiving events
- Verify database connection is working
- Check backend logs for webhook processing errors

---

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Test Cards: https://stripe.com/docs/testing
- Stripe Dashboard: https://dashboard.stripe.com
