-- RLS Policies for Data Labeling Tables
-- Run this in Supabase SQL Editor

-- Enable RLS on labeling tables
ALTER TABLE labeling_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE labeling_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view datasets from their organization
CREATE POLICY "Users can view their org's datasets"
ON labeling_datasets FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Users can insert datasets to their organization
CREATE POLICY "Users can create datasets in their org"
ON labeling_datasets FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update datasets in their organization
CREATE POLICY "Users can update their org's datasets"
ON labeling_datasets FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Users can view labeling data from their org's datasets
CREATE POLICY "Users can view their org's labeling data"
ON labeling_data FOR SELECT
USING (
  dataset_id IN (
    SELECT id FROM labeling_datasets 
    WHERE organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Users can insert labeling data to their org's datasets
CREATE POLICY "Users can add labeling data to their org's datasets"
ON labeling_data FOR INSERT
WITH CHECK (
  dataset_id IN (
    SELECT id FROM labeling_datasets 
    WHERE organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Users can update labeling data in their org's datasets
CREATE POLICY "Users can update their org's labeling data"
ON labeling_data FOR UPDATE
USING (
  dataset_id IN (
    SELECT id FROM labeling_datasets 
    WHERE organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  )
);

-- Success message
SELECT 'RLS policies created successfully for data labeling!' as message;
