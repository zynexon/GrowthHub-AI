# Database Migration Order

Run these migrations in Supabase SQL Editor in this exact order:

## 1. Jobs Table - Add required_skill field (if not already done)
File: `database/add-required-skill-to-jobs.sql`

```sql
-- Add required_skill column to jobs table
ALTER TABLE jobs 
ADD COLUMN required_skill VARCHAR(50);

-- Remove the CHECK constraint on job_type to allow free text
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_job_type_check;

-- Make job_type a regular VARCHAR without constraints
ALTER TABLE jobs 
ALTER COLUMN job_type TYPE VARCHAR(255);
```

## 2. Organizations Table - Add subscription fields
File: `database/add-subscription-fields.sql`

```sql
-- Add subscription-related columns
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

## After Running Migrations

1. **Restart your backend server** to pick up the new fields
2. **Test job creation** with required_skill field
3. **Follow STRIPE_SETUP.md** to configure Stripe checkout
4. **Test upgrade flow** from free to pro plan

---

## Verification Queries

Check if migrations were successful:

```sql
-- Check jobs table has new fields
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'jobs' 
AND column_name IN ('required_skill', 'job_type');

-- Check organizations table has subscription fields
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'organizations' 
AND column_name IN ('plan_type', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_status');

-- Check current organizations plan status
SELECT id, name, plan_type, subscription_status
FROM organizations;
```
