-- Data Labeling Module Tables
-- Run this in Supabase SQL Editor if you already have the base schema

-- Labeling Datasets
CREATE TABLE IF NOT EXISTS labeling_datasets (
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
CREATE TABLE IF NOT EXISTS labeling_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL REFERENCES labeling_datasets(id) ON DELETE CASCADE,
  row_id TEXT NOT NULL,
  text TEXT NOT NULL,
  label TEXT,
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_labeling_datasets_org ON labeling_datasets(organization_id);
CREATE INDEX IF NOT EXISTS idx_labeling_data_dataset ON labeling_data(dataset_id);

-- Success message
SELECT 'Data Labeling tables created successfully!' as message;
