-- Talent Management Tables
-- Store people that companies can assign work to

CREATE TABLE IF NOT EXISTS talent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    skill_type VARCHAR(50) NOT NULL CHECK (skill_type IN ('data_labeling', 'operations', 'support', 'qa', 'field_service')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    tasks_assigned INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_pending INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_talent_organization_id ON talent(organization_id);
CREATE INDEX IF NOT EXISTS idx_talent_status ON talent(status);
CREATE INDEX IF NOT EXISTS idx_talent_skill_type ON talent(skill_type);

-- Enable Row Level Security
ALTER TABLE talent ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view talent from their organization"
    ON talent FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert talent to their organization"
    ON talent FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update talent in their organization"
    ON talent FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete talent from their organization"
    ON talent FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );
