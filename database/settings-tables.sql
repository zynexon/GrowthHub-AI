-- Organization Settings Table
-- Stores company-wide configuration (timezone, currency, industry, etc.)
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    industry TEXT,
    company_size TEXT, -- e.g., '1-10', '11-50', '51-200', '201-500', '501+'
    timezone TEXT DEFAULT 'UTC', -- e.g., 'America/New_York', 'Europe/London'
    default_currency TEXT DEFAULT 'USD', -- e.g., 'USD', 'EUR', 'GBP'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Notification Preferences Table
-- Stores user-level notification toggles
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_health_alerts BOOLEAN DEFAULT true,
    churn_risk_alerts BOOLEAN DEFAULT true,
    job_status_updates BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organization_settings_org_id ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_org_id ON notification_preferences(organization_id);

-- Row Level Security Policies
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization settings" ON organization_settings;
DROP POLICY IF EXISTS "Users can insert their organization settings" ON organization_settings;
DROP POLICY IF EXISTS "Users can update their organization settings" ON organization_settings;
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON notification_preferences;

-- Organization Settings: Users can view/update their organization's settings
CREATE POLICY "Users can view their organization settings"
    ON organization_settings FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their organization settings"
    ON organization_settings FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their organization settings"
    ON organization_settings FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
        )
    );

-- Notification Preferences: Users can only view/update their own preferences
CREATE POLICY "Users can view their own notification preferences"
    ON notification_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
    ON notification_preferences FOR UPDATE
    USING (user_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_organization_settings_updated_at ON organization_settings;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;

CREATE TRIGGER update_organization_settings_updated_at
    BEFORE UPDATE ON organization_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
