# GrowthHub AI - Business Operations Platform

A comprehensive platform for managing revenue operations, customer health, team performance, and business workflows.

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- TanStack React Query
- Zustand (State Management)
- React Router

### Backend
- Python 3.11+ with Flask
- Supabase (PostgreSQL + Auth + RLS)
- OpenAI API (Lead scoring)

### Infrastructure
- Docker & Docker Compose
- Local development environment

## Project Structure

```
growthhub-ai/
├── backend/
│   ├── app/
│   │   ├── auth/              # JWT authentication
│   │   ├── modules/
│   │   │   ├── revops/        # Lead scoring & management
│   │   │   ├── customers/     # Customer health monitoring
│   │   │   ├── data_labeling/ # Data annotation platform
│   │   │   ├── talent/        # Team management
│   │   │   └── jobs/          # Task tracking
│   │   └── ai/                # AI scoring engines
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/             # Feature modules
│       ├── services/          # API clients
│       └── store/             # Zustand stores
├── database/
│   └── schema.sql             # Database schema
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account

### Environment Setup

1. Create `.env` file in backend directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```

2. Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Backend runs on: http://localhost:5000

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## Features

### Implemented Modules

1. **RevOps / Lead Management**
   - CSV lead upload
   - Automatic lead scoring
   - Lead prioritization
   - Status tracking (New, Contacted, Qualified, Lost, Won)

2. **Customer Health Monitoring**
   - Customer health scores
   - Churn risk prediction
   - Health status tracking
   - At-risk customer alerts

3. **Campaign & ROI Tracking**
   - Marketing campaign management
   - ROI calculation
   - Campaign deduplication
   - Performance analytics

4. **Data Labeling Platform**
   - Dataset upload and management
   - Data annotation workflows
   - Label categories and quality control
   - Export labeled datasets

5. **Talent Management**
   - Team member profiles
   - Skills and expertise tracking
   - Performance metrics (tasks assigned/completed/pending)
   - Availability management

6. **Job Management**
   - Simple task tracker for company work
   - Create and assign jobs
   - Status tracking (Open, In Progress, Completed)
   - Automatic performance counter updates
   - Due date management

## Authentication

- Company/Organization login with JWT authentication
- Access to all platform modules and features

## UI Features

- Dark theme with purple gradient design system
- Responsive layout with sidebar navigation
- Real-time statistics dashboard
- Premium animations and transitions
- Interactive feature modals
- Mobile-responsive design

## Database Schema

All tables use Supabase Row Level Security (RLS) policies:
- `users` - User accounts with organization linking
- `leads` - RevOps lead data
- `customers` - Customer health records
- `campaigns` - Marketing campaign data
- `datasets` - Data labeling projects
- `data_labels` - Individual label annotations
- `talent` - Team member profiles
- `jobs` - Task tracking with talent assignments

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### RevOps
- `GET /api/revops/leads` - List leads
- `POST /api/revops/leads/upload` - CSV upload
- `PATCH /api/revops/leads/{id}` - Update lead

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer

### Data Labeling
- `GET /api/data-labeling/datasets` - List datasets
- `POST /api/data-labeling/datasets` - Create dataset
- `GET /api/data-labeling/labels` - Get labels

### Talent
- `GET /api/talent` - List team members
- `POST /api/talent` - Add team member

### Jobs
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/{id}` - Update job
- `POST /api/jobs/{id}/complete` - Mark complete

## Development Status

✅ **Completed**
- Multi-tenant authentication with JWT
- RevOps lead scoring and management
- Customer health monitoring
- Campaign & ROI tracking
- Data labeling platform
- Talent management with performance tracking
- Jobs/task tracking with talent integration
- Comprehensive dashboard with statistics
- Premium UI with dark theme

🚧 **Future Enhancements**
- Email notifications
- Advanced analytics and reporting
- Mobile app
- Billing integration
- API rate limiting
- Deployment automation

## License

Proprietary - All rights reserved
