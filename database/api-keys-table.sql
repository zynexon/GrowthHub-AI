-- API Keys Table
-- For external API access with secure authentication

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key_prefix VARCHAR(10) NOT NULL, -- First 8 chars for identification (e.g., "gh_live_")
    key_hash TEXT NOT NULL, -- Bcrypt hash of full API key
    name VARCHAR(255) NOT NULL, -- User-friendly name: "Production API", "Dev Key"
    scopes TEXT[] DEFAULT ARRAY['read:*'], -- Permissions: read:leads, write:jobs, etc.
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- NULL = never expires
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view API keys from their organization"
    ON api_keys FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create API keys for their organization"
    ON api_keys FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update API keys in their organization"
    ON api_keys FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete API keys from their organization"
    ON api_keys FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );
