# Database Setup Guide

## Initial Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Copy your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

3. Run the schema SQL:
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `schema.sql`
   - Click "Run" to execute
   - **Important**: After adding Data Labeling tables, run the updated schema.sql again or run only the new tables:
     ```sql
     -- Data Labeling Tables (add these if not already created)
     CREATE TABLE labeling_datasets (...);
     CREATE TABLE labeling_data (...);
     CREATE INDEX idx_labeling_datasets_org ON labeling_datasets(organization_id);
     CREATE INDEX idx_labeling_data_dataset ON labeling_data(dataset_id);
     ```

## Row Level Security (RLS)

The schema includes RLS policies to ensure data isolation between organizations. Key policies:

- Users can only access data from organizations they belong to
- Talent can only see assigned jobs and labeling tasks
- Platform admins have override access

## Testing the Database

After running the schema, you can test with:

```sql
-- Create a test organization
INSERT INTO organizations (name, plan_type) 
VALUES ('Test Company', 'pro')
RETURNING id;

-- Create a test user (use actual auth.users id)
INSERT INTO users (id, email, full_name) 
VALUES ('your-auth-user-id', 'test@example.com', 'Test User');

-- Link user to organization
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES ('your-auth-user-id', 'org-id-from-above', 'org_owner');
```

## Migrations

For production, consider using Supabase migrations:

```bash
supabase migration new initial_schema
# Copy schema.sql content to the migration file
supabase db push
```

## Indexes

The schema includes indexes on:
- Organization IDs (for multi-tenant filtering)
- Email fields (for lookups)
- Created timestamps (for sorting)
- Status fields (for filtering)

## Functions

Custom PostgreSQL functions included:
- `get_leads_by_source(org_id)` - Aggregate leads by source channel
