# Project Management System  
**Full-Stack Skill Assessment Submission**

A secure, role-based Project Management System built with **Node.js + Express + MongoDB** backend and **React + Vite + Tailwind CSS** frontend. Implements session-based authentication, streaming reports, fine-grained access control, and a polished dark-mode UI.

**Live Demo Features Demonstrated:**
- Persistent login across refresh (session + cookie)
- Admin vs Client role separation
- Streaming large reports using `ReadableStream` + MongoDB cursor
- Dedicated "Request Access" flow for Clients
- Clean architecture with context, Axios interceptors, and reusable utilities


### Tech Stack & Key Packages

| Layer      | Technology                                 | Reason Chosen |
|------------|--------------------------------------------|--------------|
| Backend    | Express.js + Mongoose                      | Mature, excellent middleware ecosystem |
| Auth       | `express-session` + `connect-mongo` + cookies | More secure than JWT for this use case; automatic persistence |
| Frontend   | React 19 + Vite + React Router v7          | Fast dev server, modern React |
| Styling    | Tailwind CSS 4                             | Rapid, consistent dark-theme UI |
| Forms      | `react-hook-form`                          | Best DX + performance |
| HTTP       | Axios with `withCredentials: true`         | Automatically sends session cookie |
| State      | React Context + session restore on mount   | No Redux needed, persists login on refresh |
| Streaming  | Native `fetch()` + `ReadableStream`        | Only way to consume chunked JSON array |
| Notifications | `react-hot-toast`                       | Beautiful toast feedback |

---

### Project Structure

```
project-management-system/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── middleware/
│   │   ├── auth.middleware.js      → protects routes using req.session
│   │   └── log.middleware.js       → logs every request (requirement)
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── seed/admin.seeder.js        → creates first Admin
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx → restores user from /auth/me on load
    │   ├── api/axios.js            → withCredentials: true + baseURL
    │   ├── utils/
    │   │   ├── handleApiResponse.js
    │   │   └── handleApiError.js
    │   ├── pages/
    → Login, Signup, Projects, CreateProject, Users, Reports, RequestAccess
    │   └── App.jsx     → Protected routes with loading state
    └── vite.config.js
```

---

### Getting Started

#### 1. Backend
```bash
cd backend
npm install
cp .env.example .env          # set MONGO_URI and SESSION_SECRET
npm run seed:admin             # creates admin@ubiquitous.com / Admin123!
npm start                      # or npm run dev with nodemon
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev                    # opens http://localhost:5173
```

Default Admin Login  
**Username:** `admin`  
**Password:** `Pass@1234#`

---

### Authentication & Session Persistence (Why This Approach)

- **express-session + MongoStore** → session stored server-side (secure)
- **httpOnly, Secure, SameSite** cookie → cannot be stolen by XSS
- Frontend Axios instance has `withCredentials: true` → cookie sent automatically
- `AuthContext` calls `GET /api/auth/me` on app start → restores user even after full page refresh
- No manual token storage in localStorage → eliminates common JWT pitfalls

**Result:** User stays logged in forever (until explicit logout or 24h expiry).

---

### Role-Based Access Control (RBAC)

| Feature                         | Admin | Client |
|---------------------------------|-------|--------|
| Create users / projects         | Yes   | No     |
| View all projects               | Yes   | No     |
| View own projects               | Yes   | Yes    |
| Request access to any project   | –     | Yes    |
| Approve/Deny requests           | Yes   | –      |
| See streaming reports           | Yes   | –      |

Implemented via:
- `requireAuth` and `requireAdmin` middleware
- Session-based `req.session.user.role`
- Frontend `PrivateRoute` + `adminOnly` prop

---

### Key Features 

| Requirement                                   | Implementation |
|----------------------------------------------|----------------|
| Logging middleware                           | `log.middleware.js` logs every request |
| Hashed passwords (bcrypt)                    | Never stored in plain text |
| Only Admin creates users/projects            | Protected routes + middleware |
| Client requests access to projects           | Dedicated `/request-access` page + `/projects/all-for-request-access` endpoint |
| Client sees only granted projects            | `GET /projects` returns filtered list |
| Streaming reports (`GET /reports`)           | MongoDB cursor → `res.write()` → frontend consumes with `ReadableStream` |
| Persistent login on page refresh             | Session + `/auth/me` restore |
| Beautiful dark UI with live feedback         | Tailwind + react-hot-toast |

---

### API Endpoints (Selected)

| Method | Endpoint                            | Description                     | Protected |
|-------|-------------------------------------|---------------------------------|-----------|
| POST  | `/api/auth/signup`                  | Client self-signup              | No        |
| POST  | `/api/auth/login`                   | Session creation                | No        |
| GET   | `/api/auth/me`                      | Restore user from session       | Yes       |
| POST  | `/api/auth/logout`                  | Destroy session                 | Yes       |
| GET   | `/api/projects`                     | Role-based project list         | Yes       |
| GET   | `/api/projects/all-for-request-access` | All projects (name + location only) | Client only |
| POST  | `/api/projects`                     | Admin creates project           | Admin     |
| POST  | `/api/requests`                     | Client requests access          | Client    |
| GET   | `/api/requests/pending`           | Admin sees pending requests     | Admin     |
| POST  | `/api/requests/:id/decision`        | Approve/Deny                    | Admin     |
| GET   | `/api/reports` (stream)             | Streaming access-request report  | Admin     |

---

### Streaming Reports Demo

- Backend uses `cursor()` and `res.write()` → sends data as soon as it’s read from MongoDB
- Frontend uses native `fetch()` + `ReadableStream` → renders rows **live** as they arrive
- Includes live counter and stats → proves streaming works

---

### Seed Admin Account (Run Once)

```bash
cd backend
npm run seed:admin
```

Creates:
```json
{
  "username": "admin",
  "role": "Admin",
  "password": "Password@1234#"   // hashed with bcrypt
}
```

---

### Why This Architecture Choices Were Made

| Choice                         | Reason |
|--------------------------------|--------|
| Session over JWT               | More secure for this app; automatic persistence |
| Axios + withCredentials        | Cleanest way to send session cookie |
| React Context for auth         | Simple, no Redux overhead |
| Dedicated RequestAccessPage    | Better UX than inline button on projects list |
| Streaming with fetch()         | Only reliable way to consume chunked JSON array |
| Tailwind + dark mode           | Rapid, consistent, professional look |
| Separate middleware files     | Clean, reusable, easy to test |

---
