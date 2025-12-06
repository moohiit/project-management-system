# Project Management System

## Table of Contents

- **Overview**: Project summary and architecture
- **Getting Started**: Requirements, install, environment, run
- **Backend**: Structure, routes, controllers, models, middleware
- **Frontend**: Structure, key files, usage
- **APIs**: Endpoint patterns, auth, examples
- **Utilities & Libraries**: Major packages and purpose
- **Seeding & Tests**: How to seed admin and run quick checks
- **Deployment & Notes**: Useful tips
- **Contributing**: How to help

## Overview

This repository contains a simple Project Management System with a Node.js + Express backend and a React (Vite) frontend. The backend manages users, projects, reports, and access requests. The frontend provides pages for authentication, project creation/listing, user management, requesting access, and reports.

High-level layout:

- `backend/` — Express API, MongoDB models, controllers, routes, middleware, and seeders.
- `frontend/` — React app using Vite, Axios for API calls, and a context for auth state.

## Getting Started

Prerequisites:

- Node.js (>= 16 recommended)
- npm (or yarn)
- MongoDB instance (local or remote)

Quick setup

1. Backend

```bash
cd backend
npm install
# create a .env file (see .env.example if available)
# required envs: MONGODB_URI, JWT_SECRET, PORT (optional)
npm run seed:admin   # creates an initial admin user (if seeder exists)
npm start            # or `npm run dev` if configured
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

If you use different ports, update the `frontend/src/api/axios.js` base URL or set environment variables accordingly.

## Backend

Location: `backend/`

Key folders / files:

- `server.js` — Express app entry point.
- `config/db.js` — MongoDB connection helper.
- `controllers/` — Business logic for each resource:
  - `auth.controller.js`, `user.controller.js`, `project.controller.js`, `report.controller.js`, `request.controller.js`
- `routes/` — Route definitions that wire endpoints to controllers.
- `models/` — Mongoose schemas: `user.model.js`, `project.model.js`, `accessRequest.model.js`.
- `middleware/` — `auth.middleware.js` for express-session and cookies based protection; `log.middleware.js` for request logging.
- `seed/` — `admin.seeder.js` to create a default admin user.

Backend responsibilities:

- Authentication (signup/login) using session and cookies.
- Authorization checks via `auth.middleware` to protect routes.
- CRUD operations for projects and users, plus access request workflows and report generation.

Environment variables (typical):

- `MONGODB_URI` — MongoDB connection string.
- `JWT_SECRET` — Secret key for signing JWT tokens.
- `PORT` — Backend server port (default 3000 or configured value).

### Models (summary)

- `User` — stores username, password hash, role (e.g., `Admin`, `Client`), and timestamps.
- `Project` — name, location, phone, email, startDate, endDate, ccreatedBy and clientsWithAccess.
- `AccessRequest` — references to requester and project, status (pending/approved/rejected), and decidedBy.

### Middleware

- `auth.middleware.js` — reads the session for user, Use it to protect routes.
- `log.middleware.js` — lightweight request logging for development.

### Routes & Controllers (what to expect)

Routes are located in `backend/routes/` and are mounted under a common API prefix (commonly `/api`). The files indicate the areas handled:

- `auth.routes.js` — authentication endpoints (signup, login, optionally `GET /me`).
- `user.routes.js` — user CRUD and management (list users, view user, update role, delete).
- `project.routes.js` — project CRUD endpoints (create, read list, update, delete).
- `request.routes.js` — access request endpoints (create request for a project, list requests, approve/reject).
- `report.routes.js` — endpoints to generate reports (project stats, user activity) or to download reports.

Example endpoint patterns (verify exact paths in `routes/` files):

- `POST /api/auth/signup` — register a user. Body: `{ name, email, password }`.
- `POST /api/auth/login` — login. Body: `{ email, password }`. Returns: `{ token, user }`.
- `GET /api/projects` — list projects (protected or public depending on app design).
- `POST /api/projects` — create a new project (protected).
- `GET /api/projects/:id` — get a project.
- `POST /api/requests` — request access to a project.
- `GET /api/users` — list users (likely admin protected).


Example curl (login) — replace host and port as needed:

```bash
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"admin@example.com","password":"yourpassword"}'
```

Example response:

```json
{
  "user": {
    "_id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## Frontend

Location: `frontend/`

Key folders / files:

- `src/` — source code.
  - `main.jsx`, `App.jsx` — React entry and top-level component.
  - `src/api/axios.js` — Axios instance configured with a base URL and interceptors.
  - `src/context/AuthContext.jsx` — React context for auth state (login, logout, token storage).
  - `src/pages/` — pages: `LoginPage.jsx`, `SignupPage.jsx`, `ProjectsPage.jsx`, `CreateProjectPage.jsx`, `UsersPage.jsx`, `ReportsPage.jsx`, `RequestAccessPage.jsx`.
  - `src/utils/handleApiResponse.js` — helper to standardize API responses, handle errors, and extract messages.

How the frontend communicates with the backend:

- All requests should use the `Axios` instance in `src/api/axios.js` which sets the API base URL and attaches auth tokens when available.
- `AuthContext` manages user state and token; components read the context to display protected pages or redirect to login.

Developer flow:

- Sign up or login to receive session and cookies.
- The session is stored (likely in MongoDB) and cookies send with each request.
- Use the pages to view, create, or manage projects, users and requests.

## Utilities & Libraries

Backend (likely in `backend/package.json`):

- **express**: web server and routing.
- **mongoose**: MongoDB ODM.
- **dotenv**: env variable loader.
- **bcrypt**: password hashing.
- **jsonwebtoken**: generate/verify JWT tokens.
- **cors**: Cross-origin resource sharing for frontend requests.

Frontend (likely in `frontend/package.json`):

- **react** / **react-dom**: UI library.
- **vite**: dev server and build tool.
- **axios**: HTTP client (configured in `src/api/axios.js`).
- **eslint**: linting (present as `eslint.config.js`).

Project-specific utilities:

- `src/utils/handleApiResponse.js` — centralizes API response parsing and error handling.
- `src/context/AuthContext.jsx` — central auth state management used across pages.

## Seeding & Tests

- Seeding admin: run `npm run seed:admin` from `backend/` to create an admin user (script exists at `backend/seed/admin.seeder.js`).
- There are no unit tests included by default (check `backend/package.json` or `frontend/package.json`), but you can add tests with Jest or other frameworks.

## Deployment & Notes

- Make sure `MONGODB_URI` and `JWT_SECRET` are set in production environment.
- Serve the built frontend (Vite build output) with a static server or host it on Vercel/Netlify and point API calls to the backend host.
- Consider enabling HTTPS and proper CORS configuration for production.

## Contributing

- Fork the repo, create a branch for your feature, and open a pull request.
- Keep changes focused and update the README if you add or change public APIs.

## Where to check exact routes and payloads

This README summarizes how the app is organized and how to work with it. For exact routes, request/response schemas and validation rules, open the files in `backend/routes/` and `backend/controllers/` to see the exact endpoints and required payload fields.
