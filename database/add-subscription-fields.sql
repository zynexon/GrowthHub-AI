-- Add subscription and Stripe fields to organizations table
-- This enables subscription management and plan tracking

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
