# GrowthHub AI — AI-Powered Revenue Intelligence Platform

> **Unify your revenue operations, customer insights, and team productivity in one intelligent system.**

🌐 **Live Platform:** [https://growthhubai.cloud](https://growthhubai.cloud)

---

## 📋 Project Overview

**GrowthHub AI** is a full-stack SaaS platform that empowers businesses to manage revenue operations, customer insights, marketing performance, and internal team productivity from a single centralized intelligent system. Built for modern growth teams, the platform combines AI-driven analytics, operational workflows, and real-time dashboards to transform how organizations drive revenue and manage operations.

Unlike fragmented point solutions, GrowthHub AI integrates revenue intelligence, customer health monitoring, marketing attribution, data preparation tools, and workforce management into one cohesive platform—enabling businesses to make data-driven decisions faster and more effectively.

---

## 🎯 Problem Statement

Modern businesses face critical operational challenges that slow growth and reduce efficiency:

- **Fragmented Lead Management:** Sales teams juggle leads across multiple CRMs, spreadsheets, and tools, making it difficult to prioritize high-value opportunities and track pipeline health effectively.

- **Limited Customer Visibility:** Companies lack real-time insights into customer health, leading to preventable churn and missed opportunities for proactive retention strategies.

- **Marketing Attribution Gaps:** Marketing teams struggle to measure true campaign ROI and understand which channels drive actual revenue, resulting in inefficient budget allocation.

- **Disconnected Team Operations:** Internal task management, talent tracking, and performance metrics are scattered across different platforms, creating visibility gaps and coordination overhead.

- **AI Data Preparation Bottlenecks:** Organizations preparing datasets for machine learning models lack purpose-built annotation tools, slowing down AI adoption and model training cycles.

**The Result:** Revenue leakage, operational inefficiency, and missed growth opportunities due to disconnected systems and fragmented data.

**What Businesses Need:** A unified operational intelligence platform that brings together revenue operations, customer intelligence, marketing analytics, and team management with AI-powered insights—all in one place.

---

## ✨ Solution

**GrowthHub AI** solves these challenges by delivering an all-in-one operational intelligence platform that combines:

- **RevOps Intelligence** — Automated lead scoring, pipeline management, and revenue forecasting powered by AI algorithms that identify high-value opportunities.

- **AI-Driven Customer Analytics** — Real-time customer health monitoring with predictive churn risk modeling and automated alerts for at-risk accounts.

- **Marketing ROI Tracking** — Campaign performance measurement with attribution modeling, ROI calculation, and deduplication to identify revenue-driving channels.

- **Data Labeling Infrastructure** — Purpose-built annotation tools for preparing high-quality training datasets for machine learning models.

- **Talent & Task Management** — Integrated workforce management with skills tracking, performance metrics, and task assignment workflows.

**The Outcome:** A single source of truth for revenue operations, customer intelligence, and team productivity—enabling faster decisions, improved retention, and accelerated growth.

---

## 🚀 Core Features

### 1. RevOps / Lead Management

Transform your sales pipeline with intelligent lead management:

- **CSV Lead Upload** — Bulk import leads from any source with automatic validation and deduplication
- **AI Lead Scoring** — Machine learning algorithms automatically score and prioritize leads based on conversion potential
- **Pipeline Visualization** — Track leads through stages: New → Contacted → Qualified → Won/Lost
- **Smart Prioritization** — Focus your sales team on high-value opportunities with actionable insights

**Business Impact:** Sales teams close deals faster by focusing on leads most likely to convert, improving win rates and reducing sales cycle time.

### 2. Customer Health Monitoring

Reduce churn and drive expansion with proactive customer intelligence:

- **Health Score Calculation** — Real-time customer health scoring based on engagement, usage, and satisfaction signals
- **Churn Risk Prediction** — AI-powered models identify at-risk customers before they leave
- **Lifecycle Monitoring** — Track customer journeys from onboarding through renewal and expansion
- **Automated Alerts** — Instant notifications when customers show warning signs

**Business Impact:** Improve retention rates by identifying and addressing customer issues proactively, protecting revenue and increasing lifetime value.

### 3. Campaign & ROI Tracking

Optimize marketing spend with accurate attribution and performance measurement:

- **Campaign Management Dashboard** — Centralized view of all marketing campaigns across channels
- **ROI Calculation Engine** — Automatic revenue attribution and return-on-investment metrics
- **Campaign Deduplication** — Eliminate duplicate campaigns and ensure accurate reporting
- **Performance Analytics** — Identify which campaigns drive pipeline and revenue

**Business Impact:** Marketing teams allocate budget more effectively by understanding which campaigns generate real revenue, maximizing marketing ROI.

### 4. Data Labeling Platform

Accelerate AI development with purpose-built annotation infrastructure:

- **Dataset Upload & Management** — Organize and version training datasets efficiently
- **Annotation Workflows** — Streamlined labeling interface with quality control mechanisms
- **Label Categories & Taxonomy** — Define custom label schemas for any ML use case
- **Export Capabilities** — Export labeled datasets in standard formats for model training

**Business Impact:** Data science teams prepare high-quality training data faster, accelerating machine learning model development and AI adoption.

### 5. Talent Management

Maximize team productivity with comprehensive workforce intelligence:

- **Team Member Profiles** — Centralized employee information with role and responsibility tracking
- **Skills & Expertise Tracking** — Map team capabilities to optimize project assignments
- **Performance Metrics** — Real-time tracking of tasks assigned, completed, and pending
- **Availability Management** — Coordinate team capacity and workload distribution

**Business Impact:** Managers optimize team utilization, identify skill gaps, and ensure the right people work on the right projects at the right time.

### 6. Job & Task Management

Streamline operations with integrated task tracking:

- **Task Creation & Assignment** — Create jobs and assign them to team members with clear owners
- **Status Workflows** — Track progress through: Open → In Progress → Completed
- **Due Date Management** — Set deadlines and monitor on-time completion rates
- **Automatic Performance Metrics** — Task completion data feeds into team performance dashboards

**Business Impact:** Teams maintain visibility into operational work, improve accountability, and ensure critical tasks don't slip through the cracks.

---

## 🏗️ Platform Architecture

GrowthHub AI follows a modern full-stack architecture designed for scalability and performance:

```
User Interface (React SPA)
         ↓
API Gateway (Flask Backend)
         ↓
Business Logic Layer
    ↓              ↓
AI Processing   Database (Supabase)
    ↓              ↓
Analytics Dashboard & Insights
```

**Data Flow:**
1. Users interact with the React frontend
2. API requests are authenticated and routed through the Flask backend
3. Business logic processes requests and queries the Supabase database
4. AI engines analyze data and generate insights
5. Results are returned to the dashboard with real-time updates

This architecture ensures secure data handling, fast response times, and seamless integration of AI-powered insights.

---

## 🛠️ Tech Stack

### **Frontend**
- **React** — Modern component-based UI framework
- **Vite** — Lightning-fast build tooling and dev server
- **TailwindCSS** — Utility-first styling with custom design system
- **TanStack React Query** — Efficient data fetching and caching
- **Zustand** — Lightweight state management

### **Backend**
- **Python (Flask)** — RESTful API server with modular architecture
- **OpenAI API** — AI-powered lead scoring and analytics
- **Supabase** — PostgreSQL database with Row-Level Security (RLS)

### **Infrastructure**
- **Docker** — Containerized deployment for consistency across environments
- **Nginx** — Reverse proxy and load balancing
- **VPS Hosting** — Cloud infrastructure for production deployment

### **Authentication & Database**
- **Supabase Auth** — Secure JWT-based authentication with multi-tenant support
- **PostgreSQL** — Relational database with RLS policies for data isolation

### **Payments**
- **Stripe** — Subscription management and payment processing

### **Security**
- **HTTPS** — SSL/TLS encryption with Let's Encrypt certificates
- **Environment Variables** — Secure configuration management
- **CORS Configuration** — Cross-origin resource sharing controls

---

## 🌍 Deployment

GrowthHub AI is deployed in production with enterprise-grade infrastructure:

- **Containerization:** Docker containers ensure consistent behavior across development and production
- **Reverse Proxy:** Nginx handles SSL termination, load balancing, and request routing
- **SSL Encryption:** Let's Encrypt certificates provide HTTPS security
- **Cloud VPS:** Hosted on scalable cloud infrastructure for reliability and performance
- **Environment Isolation:** Separate staging and production environments with secure secrets management

**Production URL:** [https://growthhubai.cloud](https://growthhubai.cloud)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional)
- Supabase account

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python run.py
```

Backend runs on: `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Environment Variables

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000
```

---

## 📊 Project Structure

```
growthhub-ai/
├── backend/
│   ├── app/
│   │   ├── auth/              # JWT authentication & authorization
│   │   ├── ai/                # AI scoring engines & ML models
│   │   ├── modules/
│   │   │   ├── revops/        # Lead scoring & pipeline management
│   │   │   ├── customer_health/  # Customer health analytics
│   │   │   ├── data_labeling/    # Data annotation platform
│   │   │   ├── talent/        # Workforce management
│   │   │   └── jobs/          # Task tracking system
│   │   └── api/               # Public API routes
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Feature module pages
│       ├── services/          # API client services
│       └── store/             # State management
├── database/
│   └── schema.sql             # Database schema & migrations
└── docker-compose.yml         # Container orchestration
```

---

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for modern growth teams**
