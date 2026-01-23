# 🚀 Next Steps: Complete Stripe Checkout Setup

## Quick Start (5 minutes)

### 1️⃣ Run Database Migrations
Go to your Supabase project → SQL Editor and run these two migrations:

1. **Jobs table update** (`database/add-required-skill-to-jobs.sql`)
2. **Organizations subscription fields** (`database/add-subscription-fields.sql`)

See [database/MIGRATION_ORDER.md](database/MIGRATION_ORDER.md) for the exact SQL.

---

### 2️⃣ Create Stripe Products
1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create two products:
   - **Pro Plan**: $49/month recurring
   - **Enterprise Plan**: $199/month recurring
3. Copy the Price IDs (they look like `price_xxxxxxxxxxxxx`)

---

### 3️⃣ Update .env File
Update `backend/.env` with your actual Stripe Price IDs:

```env
# Current (placeholder values - REPLACE THESE)
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id_here

# Updated (your actual Price IDs)
STRIPE_PRO_PRICE_ID=price_1AbC2dE3fG4hI5jK
STRIPE_ENTERPRISE_PRICE_ID=price_6LmN7oP8qR9sT0uV
```

---

### 4️⃣ Restart Backend Server
After updating .env:
```bash
cd backend
# Stop the current server (Ctrl+C)
python run.py
```

---

### 5️⃣ Test the Flow

1. **Login to your app** at http://localhost:5173
2. **Trigger upgrade modal**: Try to create more than 3 jobs (free plan limit)
3. **Click "Upgrade to Pro"** button
4. **Complete Stripe Checkout** with test card: `4242 4242 4242 4242`
5. **Verify subscription**: Check your Stripe Dashboard → Customers

---

## What's Already Done ✅

- ✅ Stripe SDK installed (v7.8.0)
- ✅ Backend routes configured (`/api/stripe/*`)
- ✅ Frontend service ready (`stripe.service.js`)
- ✅ Upgrade modal component built (`UpgradeModal.jsx`)
- ✅ Jobs backend updated to handle `required_skill` field
- ✅ Database migration files created

---

## What You Need To Do 🎯

- [ ] Run 2 SQL migrations in Supabase
- [ ] Create 2 products in Stripe Dashboard
- [ ] Update 2 Price IDs in .env file
- [ ] Restart backend server
- [ ] Test checkout with Stripe test card

**Estimated time: 5-10 minutes**

---

## Detailed Documentation

- **Full Stripe Setup**: [STRIPE_SETUP.md](STRIPE_SETUP.md)
- **Migration Guide**: [database/MIGRATION_ORDER.md](database/MIGRATION_ORDER.md)

---

## Stripe Test Cards

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |

Use any future expiry date and any 3-digit CVC.

---

## Support

If you run into issues:
1. Check backend console logs for errors
2. Check Stripe Dashboard → Logs for API errors
3. Verify database migrations ran successfully
4. Ensure .env Price IDs match your Stripe products

---

## Current Plan Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|-----------|
| Jobs | 3 | Unlimited | Unlimited |
| Talent | 3 | 20 | Unlimited |
| Datasets | 1 (100 rows) | 10 (10k rows) | Unlimited |
| Export | ❌ | ✅ | ✅ |
| API Access | ❌ | Limited | Full |

---

Ready to proceed? Start with Step 1 above! 🎉
