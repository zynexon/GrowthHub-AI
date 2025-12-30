-- GrowthHub AI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan_type TEXT DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- platform_admin, org_owner, org_member, talent
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('platform_admin', 'Platform administrator with full access'),
  ('org_owner', 'Organization owner with full org access'),
  ('org_member', 'Organization member with standard access'),
  ('talent', 'Talent user with task execution access');

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'org_member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Organizations (many-to-many)
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'org_member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- ============================================
-- REVOPS MODULE
-- ============================================

-- Campaigns (create this FIRST before leads table)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT, -- email, paid_ads, social, content, referral
  spend DECIMAL(10, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  lead_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  roi DECIMAL(10, 2) DEFAULT 0, -- calculated: (revenue - spend) / spend
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads (now campaigns table exists)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  source TEXT NOT NULL, -- website_form, inbound_referral, paid_ads, cold_list
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
  engagement_level TEXT DEFAULT 'none', -- none, form_filled, email_replied, multiple_visits
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  temperature TEXT DEFAULT 'cold', -- hot (80-100), warm (50-79), cold (<50)
  last_activity_date TIMESTAMP WITH TIME ZONE,
  converted BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMP WITH TIME ZONE,
  revenue DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Scores
CREATE TABLE lead_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  reasoning TEXT,
  recommended_action TEXT,
  factors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOMER HEALTH MODULE
-- ============================================

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  plan TEXT,
  mrr DECIMAL(10, 2),
  last_active TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Scores
CREATE TABLE health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  factors JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Churn Predictions
CREATE TABLE churn_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  risk_level TEXT, -- low, medium, high
  probability DECIMAL(3, 2), -- 0.00 to 1.00
  factors JSONB DEFAULT '[]'::jsonb,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DATA LABELING MODULE
-- ============================================

-- Labeling Datasets
CREATE TABLE labeling_datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label_type TEXT NOT NULL, -- intent, sentiment
  total_rows INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labeling Data
CREATE TABLE labeling_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL REFERENCES labeling_datasets(id) ON DELETE CASCADE,
  row_id TEXT NOT NULL,
  text TEXT NOT NULL,
  label TEXT,
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Talent Management
CREATE TABLE talent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('data_labeling', 'operations', 'support', 'qa', 'field_service')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  tasks_assigned INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_pending INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MARKET INTELLIGENCE MODULE
-- ============================================

-- Competitors
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  tracked_metrics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Alerts
CREATE TABLE market_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type TEXT, -- price_change, review, feature_launch
  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DATA LABELING MODULE
-- ============================================

-- Datasets
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT, -- classification, ner, sentiment, etc.
  status TEXT DEFAULT 'created', -- created, in_progress, completed
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dataset Items
CREATE TABLE dataset_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, labeled, reviewed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labeling Jobs
CREATE TABLE labeling_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open', -- open, assigned, in_progress, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Annotations
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_item_id UUID NOT NULL REFERENCES dataset_items(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  labeler_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  confidence DECIMAL(3, 2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TALENT MODULE
-- ============================================

-- Talent Profiles
CREATE TABLE talent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skills JSONB DEFAULT '[]'::jsonb,
  experience TEXT,
  status TEXT DEFAULT 'pending', -- pending, verified, suspended
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Validations
CREATE TABLE skill_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  submission JSONB NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'pending_review', -- pending_review, approved, rejected
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Scores
CREATE TABLE performance_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric TEXT NOT NULL, -- accuracy, speed, quality
  score INTEGER CHECK (score >= 0 AND score <= 100),
  period TEXT, -- daily, weekly, monthly
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOBS MODULE
-- ============================================

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_skills JSONB DEFAULT '[]'::jsonb,
  sla_hours INTEGER,
  status TEXT DEFAULT 'open', -- open, assigned, in_progress, in_review, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Assignments
CREATE TABLE job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'assigned', -- assigned, accepted, in_progress, completed
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliverables
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT DEFAULT 'pending_review', -- pending_review, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE WORKERS MODULE
-- ============================================

-- Worker Profiles
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service_type TEXT, -- cleaning, field_service, etc.
  status TEXT DEFAULT 'onboarding', -- onboarding, active, inactive
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Records
CREATE TABLE training_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  validated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Executions
CREATE TABLE job_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_type TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVITATIONS
-- ============================================

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- pending, accepted, expired
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE labeling_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE labeling_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE labeling_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy for leads (users can only see their org's leads)
CREATE POLICY "Users can view their organization's leads"
  ON leads FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads to their organization"
  ON leads FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_leads_org ON leads(organization_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org ON user_organizations(organization_id);
CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_datasets_org ON datasets(organization_id);
CREATE INDEX idx_jobs_org ON jobs(organization_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_labeling_datasets_org ON labeling_datasets(organization_id);
CREATE INDEX idx_labeling_data_dataset ON labeling_data(dataset_id);
CREATE INDEX idx_talent_organization_id ON talent(organization_id);
CREATE INDEX idx_talent_status ON talent(status);
CREATE INDEX idx_talent_skill_type ON talent(skill_type);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get leads by source
CREATE OR REPLACE FUNCTION get_leads_by_source(org_id UUID)
RETURNS TABLE(source TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT l.source, COUNT(*)::BIGINT
  FROM leads l
  WHERE l.organization_id = org_id
  GROUP BY l.source;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
