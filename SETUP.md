# GrowthHub AI - Setup Instructions

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Supabase account

## Step 1: Set up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API and copy:
   - Project URL
   - `anon` public key
   - `service_role` key
4. Go to SQL Editor and run the schema from `database/schema.sql`

## Step 2: Configure Environment Variables

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your credentials:
```
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
GOOGLE_GEMINI_API_KEY=your-gemini-key
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Run with Docker (Recommended)

```bash
# From project root
docker-compose up -d
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## Step 4: Run Locally (Alternative)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Redis (for Celery)

```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### Celery Worker

```bash
cd backend
celery -A celery_worker worker --loglevel=info
```

## Step 5: Create First User

1. Go to http://localhost:5173
2. Click "Sign up"
3. Enter your details
4. You'll be automatically logged in

## Step 6: Create Organization

After signup, create your first organization:

```bash
curl -X POST http://localhost:5000/api/auth/organizations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Company", "plan_type": "pro"}'
```

Or use the frontend (coming soon in dashboard).

## Step 7: Test the Application

### Upload Test Leads

Create a CSV file `test_leads.csv`:
```csv
email,name,company,source
john@example.com,John Doe,Acme Inc,website
jane@example.com,Jane Smith,TechCorp,referral
```

Upload via the Leads page in the dashboard.

### Test API Endpoints

```bash
# Get leads
curl http://localhost:5000/api/revops/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Organization-Id: YOUR_ORG_ID"

# Check health
curl http://localhost:5000/health
```

## Troubleshooting

### Backend won't start
- Check if Redis is running
- Verify environment variables are set
- Check logs: `docker-compose logs backend`

### Frontend won't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Open browser console for errors

### Database errors
- Verify Supabase schema was run correctly
- Check RLS policies are enabled
- Verify your API keys are correct

### Celery tasks not running
- Ensure Redis is running
- Check celery worker logs
- Verify REDIS_URL in environment

## Next Steps

1. Invite team members to your organization
2. Upload leads and test scoring
3. Create datasets for labeling
4. Set up talent validation tasks
5. Create and assign jobs

## Production Deployment

See `docs/DEPLOYMENT.md` for production deployment instructions.

## Support

For issues or questions:
- Check documentation in `/docs`
- Review code examples in modules
- Contact support team
