-- Add required_skill column to jobs table
-- Run this migration to add the new field

ALTER TABLE jobs 
ADD COLUMN required_skill VARCHAR(50);

-- Optional: Add check constraint if you want to enforce specific values
-- ALTER TABLE jobs 
-- ADD CONSTRAINT check_required_skill 
-- CHECK (required_skill IN ('data_labeling', 'operations', 'support', 'qa', 'field_service'));

-- Also update the job_type column to allow any text (remove the CHECK constraint)
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS jobs_job_type_check;

-- Make job_type a regular VARCHAR without constraints
ALTER TABLE jobs 
ALTER COLUMN job_type TYPE VARCHAR(255);
