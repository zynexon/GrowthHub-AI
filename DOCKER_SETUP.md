# Quick Start with Docker (EASIEST METHOD)

## Prerequisites
- Docker Desktop installed and running
- Supabase account (free at https://supabase.com)

## Setup Steps

### 1. Configure Backend Environment
Create `c:\growthhub-ai\backend\.env`:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=change_this_to_random_string

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 2. Configure Frontend Environment
Create `c:\growthhub-ai\frontend\.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Copy and paste the entire content from `c:\growthhub-ai\database\schema.sql`
- Run the SQL script

### 4. Start Everything with Docker
```powershell
cd c:\growthhub-ai
docker-compose up --build
```

This will:
- Build and start the backend on http://localhost:5000
- Build and start the frontend on http://localhost:5173
- Set up Redis for caching (if needed later)

### 5. Access the Application
- Open your browser to http://localhost:5173
- Sign up for an account
- Start using the RevOps features!

## Testing Upload

1. Navigate to Leads page (http://localhost:5173/revops/leads)
2. Click "Upload CSV"
3. Select your leads CSV file
4. Leads should appear with scores and temperatures

## Sample Data

Use the files in `sample-data/` folder:
- `leads.csv` - Example leads with different sources and engagement levels
- `campaigns.csv` (create this) - Example campaigns

### Sample leads.csv
```csv
email,name,company,source,engagement_level,status
john@acme.com,John Doe,Acme Corp,website_form,form_filled,new
jane@techco.com,Jane Smith,TechCo,inbound_referral,email_replied,contacted
bob@startup.com,Bob Johnson,Startup Inc,paid_ads,multiple_visits,qualified
```

### Sample campaigns.csv
```csv
name,spend,start_date,end_date
Google Ads Q4,5000.00,2024-10-01,2024-12-31
LinkedIn Campaign,3000.00,2024-11-01,2024-12-31
Email Marketing,1500.00,2024-12-01,2024-12-31
```

## Stopping the Application
```powershell
# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes
docker-compose down -v
```

## Troubleshooting

### "Network Error" when uploading
1. Check backend is running: Visit http://localhost:5000/health
2. Should return: `{"status": "healthy"}`
3. Check Docker logs: `docker logs growthhub-backend`
4. Verify .env files are configured correctly

### Backend won't start
1. Check `.env` file exists in `backend/` folder
2. Verify Supabase credentials are correct
3. View logs: `docker-compose logs backend`

### Frontend won't start
1. Check `.env` file exists in `frontend/` folder
2. View logs: `docker-compose logs frontend`
3. Try rebuilding: `docker-compose up --build frontend`

### Database connection errors
1. Verify Supabase project is active
2. Check credentials in `.env`
3. Ensure schema.sql was run in Supabase SQL Editor

## Alternative: Running Without Docker

If Docker doesn't work, see [BACKEND_SETUP.md](BACKEND_SETUP.md) for manual setup instructions.

---

**This is the RECOMMENDED approach - Docker handles all the dependency issues!** 🐳
