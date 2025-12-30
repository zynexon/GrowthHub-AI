# GrowthHub AI - SaaS Platform

GrowthHub AI is a revenue operations and talent execution platform that combines revenue intelligence with verified execution through validated talent.

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Query
- Zustand (State Management)
- React Hook Form + Zod

### Backend
- Python 3.11+ with Flask
- Supabase (PostgreSQL + Auth + Storage)
- Celery + Redis (Background Jobs)
- OpenAI & Google Gemini APIs

### Infrastructure
- Docker & Docker Compose
- Hostinger VPS/Cloud

## Project Structure

```
growthhub-ai/
├── backend/          # Flask API
├── frontend/         # React + Vite
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Environment Setup

1. Copy environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Update `.env` files with your credentials:
   - Supabase project URL and keys
   - OpenAI API key
   - Google Gemini API key

### Run with Docker

```bash
docker-compose up -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Redis: localhost:6379

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features

### MVP Modules

1. **RevOps Core** - Lead scoring, ROI attribution, automated alerts
2. **Customer Health** - Churn prediction, health scoring, expansion recommendations
3. **Market Intelligence** - Competitor tracking, sentiment analysis, market alerts
4. **Data Labeling** - Dataset management, annotation workflows, quality control
5. **Talent Validation** - Skill scoring, task-based validation, performance tracking
6. **Job Matching** - AI-assisted matching, manual approval, execution tracking
7. **Service Workers** - Onboarding, training validation, job execution

## User Roles

- **Platform Admin** - Full system access, billing, organization management
- **Organization Owner** - Full access to their organization's data, billing
- **Organization Member** - Access to RevOps, Customer Health, Market Intel
- **Talent** - Access to data labeling tasks, job execution

## Development Roadmap

- [x] Project setup and architecture
- [ ] Multi-tenant authentication
- [ ] RevOps lead scoring module
- [ ] Data labeling platform
- [ ] Talent validation system
- [ ] Job matching & execution
- [ ] Customer health & churn prediction
- [ ] Market intelligence
- [ ] Service workers extension
- [ ] Billing integration (Stripe)
- [ ] Deployment & CI/CD

## License

Proprietary - All rights reserved
