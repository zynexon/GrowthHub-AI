-- Jobs Table
-- Simple task tracker for company work

-- Drop table if it exists to start fresh
DROP TABLE IF EXISTS jobs CASCADE;

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('data_labeling', 'operations', 'service')),
    description TEXT,
    assigned_talent_id UUID REFERENCES talent(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_talent ON jobs(assigned_talent_id);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view jobs from their organization"
    ON jobs FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert jobs to their organization"
    ON jobs FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update jobs in their organization"
    ON jobs FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete jobs from their organization"
    ON jobs FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations
            WHERE user_id = auth.uid()
        )
    );
