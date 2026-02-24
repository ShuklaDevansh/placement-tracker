# Placement Tracker API

A RESTful backend API for tracking internship and job applications during campus placement season.

## Tech Stack
- Node.js + Express
- MySQL (mysql2/promise)
- JWT Authentication
- bcrypt password hashing
- Layered architecture: Routes → Validators → Services → Repositories

## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Create MySQL database and run the schema from `docs/`
5. Run `npm run dev`

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and receive JWT
- `GET /api/auth/me` — Get current user (protected)

### Applications (all protected)
- `GET /api/applications` — List all applications
- `POST /api/applications` — Create application
- `GET /api/applications/:id` — Get single application
- `PUT /api/applications/:id` — Update application
- `DELETE /api/applications/:id` — Delete application
- `PATCH /api/applications/:id/status` — Update status
- `GET /api/applications/:id/history` — Status audit log

### Dashboard (protected)
- `GET /api/dashboard/summary` — Application funnel stats
- `GET /api/dashboard/monthly` — Monthly application counts
- `GET /api/applications/export/csv` — Export all as CSV