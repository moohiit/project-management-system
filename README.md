# Project Management System

A secure, role-based Project Management System built with a **Node.js + Express + MongoDB** backend and a **React + Vite + Tailwind CSS** frontend. It implements session-based authentication, fine-grained Admin/Client access control, a project access-request workflow, and streaming reports powered by MongoDB cursors — all wrapped in a polished dark-mode UI.

## Highlights

- Persistent login across page refresh (server-side session + httpOnly cookie)
- Strict Admin vs Client role separation, enforced in both API middleware and UI routing
- Streaming large reports with a MongoDB cursor on the backend and `fetch()` + `ReadableStream` on the frontend — rows render live as they arrive
- Dedicated "Request Access" flow for Clients, with Admin approve/deny decisions
- Clean architecture: auth context, Axios interceptors, reusable response/error utilities, and request logging middleware

## Tech Stack

| Layer | Technology | Why |
|------------|--------------------------------------------|--------------|
| Backend | Express 5 + Mongoose 9 | Mature, excellent middleware ecosystem |
| Auth | `express-session` + `connect-mongo` + httpOnly cookies | Server-side sessions; automatic persistence without JWT pitfalls |
| Security | `helmet`, bcrypt password hashing, 10kb JSON body limit | Sensible hardening defaults |
| Frontend | React 19 + Vite + React Router v7 | Fast dev server, modern React |
| Styling | Tailwind CSS 4 | Rapid, consistent dark-theme UI |
| Forms | `react-hook-form` | Great DX and performance |
| HTTP | Axios with `withCredentials: true` | Automatically sends the session cookie |
| State | React Context + session restore on mount | No Redux needed; login persists on refresh |
| Streaming | Native `fetch()` + `ReadableStream` | Consumes the chunked JSON report as it streams |
| Notifications | `react-hot-toast` | Clean toast feedback |

## Project Structure

```
project-management-system/
├── backend/
│   ├── server.js                   # Express app: CORS, helmet, session, routes
│   ├── .env.example
│   ├── config/                     # db.js — MongoDB connection
│   ├── middleware/
│   │   ├── auth.middleware.js      # requireAuth / requireAdmin (session-based)
│   │   └── log.middleware.js       # logs every request
│   ├── controllers/                # auth, user, project, request, report
│   ├── routes/                     # auth, users, projects, requests, reports
│   ├── models/                     # User, Project, AccessRequest
│   └── seed/                       # admin.seeder.js — creates the first Admin
└── frontend/
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── api/                    # axios.js — baseURL + withCredentials
        ├── context/                # AuthContext.jsx — restores user from /auth/me
        ├── utils/                  # handleApiResponse.js, handleApiError.js
        ├── pages/                  # Login, Signup, Projects, CreateProject,
        │                           # Users, Reports, RequestAccess
        └── App.jsx                 # PrivateRoute with adminOnly guard
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configure `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/project_management_db
SESSION_SECRET=your_session_secret_key
NODE_ENV=development
```

Seed the first Admin account (run once), then start the server:

```bash
npm run seed:admin
npm start                      # nodemon server.js
```

The seeder creates an Admin with username `admin`; its default password is set in `backend/seed/admin.seeder.js` — change it after first login (or edit the seeder before running it).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                    # opens http://localhost:5173
```

The backend allows CORS from `http://localhost:5173` with credentials.

## Authentication & Session Persistence

- **express-session + MongoStore** — sessions stored server-side in MongoDB (24h TTL)
- **httpOnly, Secure (in production), SameSite** cookie — not readable by client-side JS
- Frontend Axios instance uses `withCredentials: true` — the cookie is sent automatically
- `AuthContext` calls `GET /api/auth/me` on app start — restores the user after a full page refresh
- No tokens in localStorage — avoids common JWT pitfalls

## Role-Based Access Control (RBAC)

| Feature | Admin | Client |
|---------------------------------|-------|--------|
| Create users / projects | Yes | No |
| Update / delete projects | Yes | No |
| View all projects | Yes | No |
| View own (granted) projects | Yes | Yes |
| Request access to any project | – | Yes |
| View own access requests | – | Yes |
| Approve / deny requests | Yes | – |
| View users / delete users | Yes | – |
| See streaming reports | Yes | – |

Enforced via:

- `requireAuth` and `requireAdmin` middleware reading `req.session.user`
- Frontend `PrivateRoute` component with an `adminOnly` prop

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Access |
|-------|-----------|-------------|--------|
| POST | `/signup` | Client self-signup | Public |
| POST | `/login` | Create session | Public |
| GET | `/me` | Restore user from session | Authenticated |
| POST | `/logout` | Destroy session | Authenticated |

### Users — `/api/users`

| Method | Endpoint | Description | Access |
|-------|-----------|-------------|--------|
| GET | `/` | List all users | Admin |
| POST | `/` | Create a user | Admin |
| DELETE | `/:id` | Delete a user | Admin |

### Projects — `/api/projects`

| Method | Endpoint | Description | Access |
|-------|-----------|-------------|--------|
| GET | `/` | Admin: all projects; Client: granted projects only | Authenticated |
| GET | `/all-for-request-access` | All projects (name + location only) for the request flow | Authenticated |
| POST | `/` | Create project | Admin |
| PUT | `/:id` | Update project | Admin |
| DELETE | `/:id` | Delete project | Admin |

### Access Requests — `/api/requests`

| Method | Endpoint | Description | Access |
|-------|-----------|-------------|--------|
| POST | `/` | Request access to a project | Client |
| GET | `/my-requests` | View own requests | Client |
| GET | `/pending` | View pending requests | Admin |
| POST | `/:id/decision` | Approve / deny a request | Admin |

### Reports — `/api/reports`

| Method | Endpoint | Description | Access |
|-------|-----------|-------------|--------|
| GET | `/` | Streaming access-request report (chunked JSON) | Admin |

## Data Models

- **User** — `username` (unique), `passwordHash` (bcrypt), `role` (`Admin` \| `Client`)
- **Project** — `name`, `location`, `phone`, `email`, `startDate`, `endDate`, `createdBy`, `clientsWithAccess[]`
- **AccessRequest** — `project`, `client`, `status` (`PENDING` \| `APPROVED` \| `DENIED`), `decidedBy`

## Streaming Reports

- Backend iterates a Mongoose `cursor()` and writes each document with `res.write()` — data is sent as soon as it is read from MongoDB
- Frontend consumes the response with native `fetch()` + `ReadableStream` and renders rows live as they arrive, with a live counter and stats

## Architecture Decisions

| Choice | Reason |
|--------------------------------|--------|
| Sessions over JWT | Server-side revocation and automatic persistence |
| Axios + `withCredentials` | Cleanest way to send the session cookie |
| React Context for auth | Simple; no Redux overhead |
| Dedicated Request Access page | Better UX than inline buttons on the projects list |
| Streaming with `fetch()` | Reliable way to consume a chunked JSON array |
| Tailwind + dark mode | Rapid, consistent, professional look |
| Separate middleware files | Clean, reusable, easy to test |

---

**Author:** Mohit Patel — [mohitpatel.org](https://mohitpatel.org) · GitHub [@moohiit](https://github.com/moohiit)
