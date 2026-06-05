# College Management Portal

A production-ready **MERN** (MongoDB, Express, React, Node.js) application for managing
a college's students, faculty, courses, enrollments, grades, attendance and
announcements — with role-based access for **Admins**, **Faculty** and **Students**.

## Features

### Admin
- Manage users (create / list / search / delete students, faculty, admins)
- Manage the course catalog and assign faculty to courses
- Enroll / unenroll students in courses
- Post announcements to the whole college
- Dashboard with live counts (students, faculty, courses, enrollments)

### Faculty
- View assigned courses and enrolled students
- Record marks and grades per student
- Mark daily attendance (present / absent / late)
- Post course-specific announcements

### Student
- View enrolled courses with marks and grades
- View attendance record and percentage
- Read relevant announcements
- View profile

### Production-readiness
- JWT auth (httpOnly cookie + bearer token) with bcrypt password hashing
- Role-based authorization middleware
- Request validation (`express-validator`) and centralized error handling
- Security middleware: `helmet`, CORS allow-list, rate limiting
- Dockerfiles + `docker-compose` (MongoDB + API + Nginx-served SPA)
- Seed script with demo data and accounts
- CI (lint + build) via GitHub Actions

## Tech stack

| Layer    | Tech                                                        |
| -------- | ----------------------------------------------------------- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios           |
| Backend  | Node.js, Express, Mongoose                                  |
| Database | MongoDB                                                     |
| Auth     | JWT, bcryptjs                                               |

## Project structure

```
college-management-portal/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/   # Layout, ProtectedRoute, Modal, ...
│       ├── context/      # AuthContext
│       ├── lib/          # axios instance, helpers
│       └── pages/        # role-based pages
├── server/          # Express REST API
│   └── src/
│       ├── config/       # env + db
│       ├── controllers/
│       ├── middleware/   # auth, authorize, validate, error
│       ├── models/       # User, Course, Enrollment, Attendance, Announcement
│       ├── routes/
│       └── seed.js
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Getting started (local, without Docker)

### Prerequisites
- Node.js 20+
- A running MongoDB instance (local `mongod` or MongoDB Atlas)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the server
```bash
cp server/.env.example server/.env
# edit server/.env and set MONGO_URI + JWT_SECRET
```

### 3. Seed demo data (optional but recommended)
```bash
npm run seed
```

### 4. Run both apps
```bash
npm run dev
```
- API: http://localhost:5000
- Web: http://localhost:5173 (proxies `/api` to the server)

## Run with Docker

```bash
docker compose up --build
```
- Web: http://localhost:8080
- API: http://localhost:5000

> After the stack is up, seed data with:
> `docker compose exec server npm run seed`

## Demo accounts (after seeding)

| Role    | Email                      | Password     |
| ------- | -------------------------- | ------------ |
| Admin   | admin@college.edu          | Admin@123    |
| Faculty | alan.turing@college.edu    | Faculty@123  |
| Student | asha.verma@college.edu     | Student@123  |

## API overview

All routes are prefixed with `/api`.

| Method | Endpoint                          | Roles            | Description                    |
| ------ | --------------------------------- | ---------------- | ------------------------------ |
| POST   | `/auth/register`                  | public           | Register an account            |
| POST   | `/auth/login`                     | public           | Login                          |
| GET    | `/auth/me`                        | any              | Current user                   |
| GET    | `/users`                          | admin            | List/search users             |
| POST   | `/users`                          | admin            | Create user                    |
| DELETE | `/users/:id`                      | admin            | Delete user                    |
| GET    | `/courses`                        | any              | List courses (`?mine=true`)    |
| POST   | `/courses`                        | admin            | Create course                  |
| GET    | `/courses/:id/enrollments`        | admin, faculty   | Course roster                  |
| POST   | `/enrollments`                    | admin            | Enroll a student               |
| PATCH  | `/enrollments/:id/grade`          | admin, faculty   | Set marks/grade                |
| GET    | `/enrollments/me`                 | student          | My enrollments                 |
| POST   | `/attendance`                     | admin, faculty   | Mark attendance                |
| GET    | `/attendance/me`                  | student          | My attendance                  |
| GET    | `/announcements`                  | any              | Relevant announcements         |
| POST   | `/announcements`                  | admin, faculty   | Create announcement            |
| GET    | `/stats/admin`                    | admin            | Dashboard counts               |

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Run server + client concurrently     |
| `npm run build`  | Build the client for production       |
| `npm run lint`   | Lint server and client               |
| `npm run seed`   | Seed the database with demo data     |
| `npm start`      | Start the server (production)         |

## License

MIT
