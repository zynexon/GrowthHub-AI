# GrowthHub AI - Backend Setup Guide

## Prerequisites
- Python 3.11+ installed
- PostgreSQL database (or Supabase account)
- Git

## Quick Start

### 1. Create Virtual Environment
```powershell
cd c:\growthhub-ai\backend
python -m venv venv
.\venv\Scripts\activate
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Flask Configuration
FLASK_ENV=development
FLASK_APP=run.py
SECRET_KEY=your_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI API Keys (optional for MVP)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Set up Database
Run the SQL schema from `database/schema.sql` in your Supabase SQL editor or PostgreSQL client.

### 5. Start the Backend
```powershell
cd c:\growthhub-ai\backend
.\venv\Scripts\activate
python run.py
```

The server will start on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies
```powershell
cd c:\growthhub-ai\frontend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Frontend
```powershell
npm run dev
```

The app will be available at `http://localhost:5173`

## Testing the Upload

1. Make sure both backend (port 5000) and frontend (port 5173) are running
2. Log in to the application
3. Navigate to Leads page (/revops/leads)
4. Click "Upload CSV" and select your leads CSV file
5. The file should upload and leads will appear in the table

## Troubleshooting

### Network Error on Upload
- **Check backend is running:** Visit http://localhost:5000/health - should return `{"status": "healthy"}`
- **Check CORS configuration:** Make sure FRONTEND_URL in backend `.env` matches your frontend URL
- **Check authentication:** Make sure you're logged in and have a valid token
- **Check browser console:** Look for detailed error messages

### Module Not Found Errors
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Database Connection Errors
- Verify Supabase credentials in `.env`
- Check database schema is created
- Ensure Supabase project is active

### File Upload Issues
- Check file size limits (Flask default is 16MB)
- Verify CSV format matches documentation
- Check file has correct columns (email, source required)

## CSV Format Examples

### Leads CSV (sample-data/leads.csv)
```csv
email,name,company,source,engagement_level,status
john@example.com,John Doe,Acme Corp,website_form,form_filled,new
jane@example.com,Jane Smith,TechCo,inbound_referral,email_replied,contacted
```

### Campaigns CSV (sample-data/campaigns.csv)
```csv
name,spend,start_date,end_date
Google Ads Q4,5000,2024-10-01,2024-12-31
LinkedIn Campaign,3000,2024-11-01,2024-12-31
```

## Development Commands

### Backend
```powershell
# Activate environment
cd c:\growthhub-ai\backend
.\venv\Scripts\activate

# Run server
python run.py

# Run tests (when available)
pytest

# Install new package
pip install package-name
pip freeze > requirements.txt
```

### Frontend
```powershell
cd c:\growthhub-ai\frontend

# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new package
npm install package-name
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/signup` - User registration
- POST `/api/auth/logout` - User logout

### RevOps - Leads
- GET `/api/revops/leads?sort_by=score` - Get all leads
- POST `/api/revops/leads` - Create a single lead
- POST `/api/revops/leads/upload` - Upload leads CSV
- PUT `/api/revops/leads/<id>` - Update lead
- GET `/api/revops/leads/<id>` - Get single lead

### RevOps - Campaigns
- GET `/api/revops/campaigns` - Get all campaigns
- POST `/api/revops/campaigns` - Create campaign
- POST `/api/revops/campaigns/upload` - Upload campaigns CSV
- PUT `/api/revops/campaigns/<id>` - Update campaign

### RevOps - Dashboard
- GET `/api/revops/dashboard` - Get dashboard stats

## Next Steps

1. **Set up Supabase account** at https://supabase.com
2. **Create a new project** and get your credentials
3. **Run the schema.sql** in Supabase SQL editor
4. **Configure .env files** for both backend and frontend
5. **Install dependencies** for both backend and frontend
6. **Start both servers** and test the application

For more details, see:
- [SETUP.md](SETUP.md) - General setup instructions
- [REVOPS_MVP_STATUS.md](REVOPS_MVP_STATUS.md) - Feature documentation
- [README.md](README.md) - Project overview
