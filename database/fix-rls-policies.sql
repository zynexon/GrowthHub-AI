-- Fix RLS policies for authentication
-- Run this in Supabase SQL Editor

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- ORGANIZATIONS TABLE POLICIES
-- ============================================

-- Allow users to view organizations they belong to
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to insert organizations (during signup)
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);

-- Allow org owners to update their organizations
CREATE POLICY "Org owners can update their organizations"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role = 'org_owner'
    )
  );

-- ============================================
-- USER_ORGANIZATIONS TABLE POLICIES
-- ============================================

-- Allow users to view their organization memberships
CREATE POLICY "Users can view their org memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to insert their own org membership (during signup)
CREATE POLICY "Users can create own org membership"
  ON user_organizations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow org owners to manage memberships
CREATE POLICY "Org owners can manage memberships"
  ON user_organizations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND role = 'org_owner'
    )
  );

-- ============================================
-- CAMPAIGNS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view their organization's campaigns"
  ON campaigns FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaigns to their organization"
  ON campaigns FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's campaigns"
  ON campaigns FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- OTHER TABLES (add as needed)
-- ============================================

-- Lead scores
CREATE POLICY "Users can view their organization's lead scores"
  ON lead_scores FOR SELECT
  USING (
    lead_id IN (
      SELECT id FROM leads
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert lead scores for their organization"
  ON lead_scores FOR INSERT
  WITH CHECK (
    lead_id IN (
      SELECT id FROM leads
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );
