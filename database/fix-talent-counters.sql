-- Fix talent task counters based on existing jobs
-- Run this once to sync the counters with current job data

-- Reset all counters first
UPDATE talent SET 
    tasks_assigned = 0,
    tasks_completed = 0,
    tasks_pending = 0;

-- Update tasks_assigned (count all jobs assigned to each talent)
UPDATE talent t
SET tasks_assigned = (
    SELECT COUNT(*)
    FROM jobs j
    WHERE j.assigned_talent_id = t.id
);

-- Update tasks_completed (count completed jobs assigned to each talent)
UPDATE talent t
SET tasks_completed = (
    SELECT COUNT(*)
    FROM jobs j
    WHERE j.assigned_talent_id = t.id
    AND j.status = 'completed'
);

-- Update tasks_pending (count non-completed jobs assigned to each talent)
UPDATE talent t
SET tasks_pending = (
    SELECT COUNT(*)
    FROM jobs j
    WHERE j.assigned_talent_id = t.id
    AND j.status != 'completed'
);
