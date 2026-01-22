-- Add bio fields to talent table
ALTER TABLE talent 
ADD COLUMN IF NOT EXISTS primary_skill VARCHAR(100),
ADD COLUMN IF NOT EXISTS secondary_skill VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT;
