# Arohak LMS — Full Project Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema](#5-database-schema)
6. [Backend API Reference](#6-backend-api-reference)
7. [Frontend Pages & Routes](#7-frontend-pages--routes)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [State Management](#9-state-management)
10. [File Uploads](#10-file-uploads)
11. [Email Notifications](#11-email-notifications)
12. [Running Locally](#12-running-locally)
13. [Database Migrations & Seeding](#13-database-migrations--seeding)
14. [Production Deployment](#14-production-deployment)
15. [Default Credentials](#15-default-credentials)
16. [Certificate Auto-Issuance Logic](#16-certificate-auto-issuance-logic)
17. [Brand & Design System](#17-brand--design-system)

---

## 1. Project Overview

**Arohak LMS** is a full-stack Learning Management System built for corporate employee training at Arohak Technologies. Admins create and publish courses with video lessons, quizzes, and documents. Employees enroll, track progress, take quizzes, and earn certificates upon completion.

Key capabilities:
- Role-based access: `admin` and `employee`
- Email domain restriction: only `@arohak.com` and `@cognivance.com` addresses allowed
- Course management with sections, lessons, video URLs, and quizzes
- Lesson progress tracking with automatic enrollment status sync
- Quiz submission with auto-grading and pass/fail logic
- Certificate auto-issuance when all lessons and quizzes are completed
- Public certificate verification by certificate number
- Admin dashboard with platform-wide stats
- Welcome email sent on registration (Nodemailer + Gmail SMTP)
- Animated background UI with Arohak brand colors across all pages

---

## 2. Tech Stack

### 🚀 **Core Technologies**
- **Frontend**: Next.js 14.2.0 (React App Router)
- **Backend**: NestJS 11.0.1 (Node.js Framework)  
- **Database**: MySQL 8.0 (Relational Database)

### Frontend (Next.js)
| Package | Version | Purpose |
|---|---|---|
| Next.js | 14.2.0 | React framework (App Router) |
| React | 18.2.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.3.5 | Styling |
| Zustand | 4.4.0 | Global auth state |
| TanStack Query | 5.x | Server state / data fetching |
| Axios | 1.6.0 | HTTP client |
| React Hook Form | 7.48.0 | Form handling |
| Zod | 3.22.0 | Schema validation |
| React Hot Toast | 2.4.1 | Notifications |
| Lucide React | 0.294.0 | Icons |
| date-fns | 3.x | Date formatting |

### Backend (NestJS)
| Package | Version | Purpose |
|---|---|---|
| NestJS | 11.0.1 | Node.js framework |
| TypeScript | 5.7.3 | Type safety |
| MySQL2 | 3.20.0 | MySQL driver |
| Passport | 0.7.0 | Authentication |
| JWT | 11.0.2 | JSON Web Tokens |
| bcryptjs | 3.0.3 | Password hashing |
| class-validator | 0.15.x | DTO validation |
| class-transformer | 0.5.x | Request transformation |

### Database (MySQL)
| Component | Version | Purpose |
|---|---|---|
| MySQL Server | 8.0 | Primary database |
| MySQL2 Driver | 3.20.0 | Node.js MySQL connector |
| Database Schema | Custom | LMS tables structure |

### Infrastructure
| Service | Technology | Port | Purpose |
|---|---|---|---|
| Frontend | Next.js | 3000 | React application |
| Backend API | NestJS | 4000 | RESTful API server |
| Database | MySQL 8.0 | 3306 | Data persistence |
| Email Service | Gmail SMTP | - | Transactional emails |

---

## 3. Project Structure

```
lms-erp/
├── backend/                          # NestJS Backend API
│   ├── src/
│   │   ├── main.ts                   # NestJS bootstrap — CORS, validation pipe, global prefix
│   │   ├── app.module.ts             # Root module
│   │   ├── auth/                     # JWT authentication
│   │   ├── users/                    # User management
│   │   ├── courses/                  # Course CRUD
│   │   ├── enrollments/              # Student enrollments
│   │   ├── lessons/                  # Lesson content
│   │   ├── quizzes/                  # Quiz system
│   │   ├── certificates/             # Certificate generation
│   │   ├── progress/                 # Progress tracking
│   │   ├── categories/               # Course categories
│   │   ├── database/                 # MySQL connection
│   │   └── mail/                     # Email service
│   ├── package.json
│   └── nest-cli.json
├── frontend/                         # Next.js Frontend
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group layout
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/                    # Admin routes
│   │   │   ├── courses/
│   │   │   ├── users/
│   │   │   └── dashboard/
│   │   ├── certificates/             # Certificate pages
│   │   ├── courses/                  # Course listing/details
│   │   ├── dashboard/                # Employee dashboard
│   │   ├── learn/                    # Learning interface
│   │   └── my-learning/              # Progress tracking
│   ├── components/                   # Reusable React components
│   ├── lib/                         # Utilities, API client, store
│   ├── public/                      # Static assets
│   ├── next.config.js              # Next.js configuration
│   ├── tailwind.config.ts          # Tailwind CSS config
│   └── package.json
├── DOCUMENTATION.md                 # This file
└── README.md                       # Project overview
```
│   │   ├── app.module.ts             # Root module — imports all feature modules
│   │   ├── database/
│   │   │   ├── database.module.ts    # MySQL connection pool (global)
│   │   │   ├── migrate.js            # Table creation script
│   │   │   ├── seed.js               # Sample data seeder
│   │   │   └── cleanup-dupes.js      # Duplicate cleanup utility
│   │   ├── auth/
│   │   │   ├── auth.controller.ts    # POST /auth/register, /auth/login
│   │   │   ├── auth.service.ts       # Register / login + email domain validation
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts       # Passport JWT strategy
│   │   │   └── guards.ts             # JwtAuthGuard, RolesGuard, @Roles decorator
│   │   ├── users/                    # User management (admin only)
│   │   ├── courses/                  # Course CRUD + video URL support
│   │   ├── categories/               # Course categories
│   │   ├── sections/                 # Course sections
│   │   ├── lessons/                  # Lessons with video URL / file
│   │   ├── enrollments/              # Enrollment management
│   │   ├── progress/                 # Lesson progress tracking
│   │   ├── quizzes/                  # Quiz + question management
│   │   ├── certificates/             # Certificate issuance + verification
│   │   ├── mail/                     # Nodemailer welcome email service
│   │   └── health/                   # Health check endpoint
│   ├── uploads/
│   │   ├── thumbnails/               # Course thumbnail images
│   │   └── videos/                   # Uploaded lesson videos
│   ├── .env                          # Environment variables
│   ├── railway.toml                  # Railway deployment config
│   ├── Procfile                      # Heroku/Railway process file
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                         # Next.js 14 App Router
    ├── app/
    │   ├── layout.tsx                # Root layout — animated background, Inter font
    │   ├── globals.css               # Tailwind base + Arohak brand classes + animations
    │   ├── login/page.tsx            # Public landing + login modal
    │   ├── register/page.tsx         # Registration form
    │   ├── dashboard/page.tsx        # Dashboard with welcome popup
    │   ├── courses/page.tsx          # Course catalog with search and filters
    │   ├── learn/[courseId]/page.tsx # Course player — lessons, progress, quiz
    │   ├── my-learning/page.tsx      # Employee enrolled courses
    │   ├── certificates/
    │   │   ├── page.tsx              # User's earned certificates
    │   │   ├── [id]/page.tsx         # Certificate detail / print view
    │   │   └── verify/[number]/page.tsx  # Public certificate verification
    │   └── admin/
    │       ├── users/page.tsx        # User management — list, role change, delete
    │       └── courses/
    │           ├── new/page.tsx      # Create new course (with video URL field)
    │           └── [id]/edit/page.tsx # Edit course, manage sections/lessons/quizzes
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx         # Auth guard + frosted glass layout wrapper
    │   │   └── Navbar.tsx            # Frosted glass top navigation bar
    │   ├── Providers.tsx             # QueryClient + Toast provider
    │   └── ConfirmModal.tsx          # Reusable confirm dialog
    ├── lib/
    │   ├── api.ts                    # Axios instance with auth interceptor
    │   ├── store.ts                  # Zustand auth store (persisted)
    │   └── utils.ts                  # Shared utility functions
    ├── public/
    │   └── arohak-logo.png           # Arohak brand logo
    ├── vercel.json                   # Vercel deployment config
    ├── .env.local
    └── package.json
```

---

## 4. Environment Variables

### Backend `.env`

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lms_erp

# Auth
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# App
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Cloudinary (optional — production media storage)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Mail (SMTP) — Gmail App Password required
# 1. Enable 2FA on your Google account
# 2. Go to myaccount.google.com/apppasswords
# 3. Generate an App Password for "Mail"
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-16-char-app-password
MAIL_FROM=LMS Platform <your-gmail@gmail.com>
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 5. Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| name | VARCHAR(255) | |
| email | VARCHAR(255) UNIQUE | Must end with `@arohak.com` or `@cognivance.com` |
| password | VARCHAR(255) | bcrypt hashed |
| role | ENUM | `admin`, `employee` |
| avatar | VARCHAR(500) | |
| department | VARCHAR(255) | |
| employee_id | VARCHAR(100) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| name | VARCHAR(255) UNIQUE | |
| slug | VARCHAR(255) UNIQUE | |
| description | TEXT | |

### `courses`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| title | VARCHAR(500) | |
| description | TEXT | |
| thumbnail | VARCHAR(500) | Image path or URL |
| video_url | VARCHAR(1000) | YouTube / Vimeo / direct video URL |
| price | DECIMAL(10,2) | Default 0 |
| is_published | TINYINT(1) | 0 = draft, 1 = published |
| level | ENUM | `beginner`, `intermediate`, `advanced` |
| language | VARCHAR(100) | Default `English` |
| instructor_id | VARCHAR(36) FK | → users |
| category_id | VARCHAR(36) FK | → categories |
| passing_score | INT | Default 70 (%) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `sections`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| title | VARCHAR(500) | |
| order_num | INT | Display order |
| course_id | VARCHAR(36) FK | → courses |

### `lessons`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| title | VARCHAR(500) | |
| description | TEXT | |
| video_url | VARCHAR(500) | YouTube or external URL |
| video_file | VARCHAR(500) | Uploaded file path |
| duration | INT | Seconds |
| order_num | INT | Display order |
| is_free | TINYINT(1) | Preview without enrollment |
| section_id | VARCHAR(36) FK | → sections |

### `course_documents`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| course_id | VARCHAR(36) FK | → courses |
| title | VARCHAR(500) | |
| file_url | VARCHAR(500) | |
| file_type | VARCHAR(100) | |
| file_size | INT | Bytes |
| order_num | INT | |
| created_at | TIMESTAMP | |

### `enrollments`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| user_id | VARCHAR(36) FK | → users |
| course_id | VARCHAR(36) FK | → courses |
| enrolled_at | TIMESTAMP | |
| completed_at | TIMESTAMP | Null until completed |
| status | ENUM | `active`, `completed`, `dropped` |

### `lesson_progress`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| enrollment_id | VARCHAR(36) FK | → enrollments |
| lesson_id | VARCHAR(36) FK | → lessons |
| completed | TINYINT(1) | |
| completed_at | TIMESTAMP | |

### `quizzes`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| course_id | VARCHAR(36) FK | → courses |
| title | VARCHAR(500) | |
| description | TEXT | |
| passing_score | INT | Default 70 (%) |
| order_num | INT | |

### `questions`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| quiz_id | VARCHAR(36) FK | → quizzes |
| text | TEXT | Question text |
| options | JSON | Array of answer strings |
| correct_answer | INT | Index into options array |
| explanation | TEXT | Shown after submission |

### `quiz_attempts`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| user_id | VARCHAR(36) FK | → users |
| quiz_id | VARCHAR(36) FK | → quizzes |
| answers | JSON | Array of selected option indices |
| score | DECIMAL(5,2) | Percentage |
| passed | TINYINT(1) | |
| attempted_at | TIMESTAMP | |

### `certificates`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| user_id | VARCHAR(36) FK | → users |
| course_id | VARCHAR(36) FK | → courses |
| issued_at | TIMESTAMP | |
| certificate_number | VARCHAR(100) UNIQUE | Format: `CERT-{timestamp}-{userId}` |

---

## 6. Backend API Reference

Base URL: `http://localhost:4000/api`

Legend: 🔓 Public  🔐 Requires JWT  👑 Admin only

---

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | Register new user. Email must end with `@arohak.com` or `@cognivance.com`. Sends welcome email. |
| POST | `/auth/login` | 🔓 | Login. Returns `{ token, user }` |

**POST /auth/login — Body**
```json
{
  "email": "admin@arohak.com",
  "password": "Ar0hak#Admin2024"
}
```

---

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | 👑 | List all users |
| GET | `/users/stats` | 👑 | Platform-wide stats (courses, users, enrollments, certificates) |
| PATCH | `/users/:id/role` | 👑 | Change user role (`admin` or `employee`) |
| GET | `/users/:id/progress` | 👑 | Get all enrollments + progress for a user |
| DELETE | `/users/:id` | 👑 | Delete user (cannot delete yourself) |

---

### Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | 🔓 | List all categories with course count |

---

### Courses

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/courses` | 🔓 | List published courses. Query: `search`, `category`, `level`, `page`, `limit` |
| GET | `/courses/my` | 👑 | List courses created by current admin |
| GET | `/courses/:id` | 🔓 | Course detail with sections, lessons, documents, quizzes |
| POST | `/courses` | 👑 | Create course (`multipart/form-data` — optional `thumbnail` file + `video_url`) |
| PATCH | `/courses/:id` | 🔐 | Update course |
| PATCH | `/courses/:id/publish` | 👑 | Toggle publish status |
| DELETE | `/courses/:id` | 👑 | Delete course |

**Course create/update fields:**
```
title, description, level, passing_score, video_url, thumbnail (file)
```

---

### Sections

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/sections/course/:courseId` | 👑 | Add section to course |
| PATCH | `/sections/:id` | 👑 | Update section title |
| DELETE | `/sections/:id` | 👑 | Delete section (cascades to lessons) |

---

### Lessons

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/lessons/:id` | 🔐 | Get lesson by ID |
| POST | `/lessons/section/:sectionId` | 👑 | Add lesson (`multipart/form-data` with optional `video`) |
| PATCH | `/lessons/:id` | 👑 | Update lesson |
| DELETE | `/lessons/:id` | 👑 | Delete lesson |

---

### Enrollments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/enrollments` | 🔐 | Enroll in a course. Body: `{ courseId }` |
| GET | `/enrollments/my` | 🔐 | Get current user's enrollments with progress |
| GET | `/enrollments/check/:courseId` | 🔐 | Check if enrolled in a course |

---

### Progress

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/progress/lesson/:lessonId/complete` | 🔐 | Mark lesson complete. Auto-syncs enrollment status |
| GET | `/progress/course/:courseId` | 🔐 | Get progress for a course |

---

### Quizzes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/quizzes/course/:courseId` | 🔐 | List quizzes for a course |
| GET | `/quizzes/:id` | 🔐 | Get quiz (admins see correct answers) |
| POST | `/quizzes/course/:courseId` | 👑 | Create quiz with questions |
| POST | `/quizzes/:id/submit` | 🔐 | Submit answers. Auto-issues certificate if all quizzes passed |

**POST /quizzes/:id/submit — Body**
```json
{ "answers": [0, 1, 2, 1, 0] }
```

---

### Certificates

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/certificates/my` | 🔐 | Get current user's certificates |
| GET | `/certificates/verify/:number` | 🔓 | Public certificate verification |
| GET | `/certificates/:id` | 🔐 | Get certificate by ID |

---

### Health Check

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | 🔓 | Returns `{ status: "ok" }` |

---

## 7. Frontend Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Landing page with hero, course catalog, about section, login modal |
| `/register` | Public | Registration form |
| `/dashboard` | 🔐 | Dashboard — welcome popup on first login, stat cards, course list |
| `/courses` | 🔐 | Course catalog with search and level filters |
| `/learn/:courseId` | 🔐 | Course player — lessons, progress tracking, quiz, completion banner |
| `/my-learning` | 🔐 | Employee's enrolled courses with progress |
| `/certificates` | 🔐 | User's earned certificates |
| `/certificates/:id` | 🔐 | Certificate detail / print view |
| `/certificates/verify/:number` | Public | Public certificate verification |
| `/admin/users` | 👑 | User management — list, role change, delete, user detail slide-over |
| `/admin/courses/new` | 👑 | Create new course (title, description, level, passing score, video URL, thumbnail) |
| `/admin/courses/:id/edit` | 👑 | Edit course, manage sections / lessons / quizzes |

---

## 8. Authentication & Authorization

### Flow
1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Email domain validated — only `@arohak.com` and `@cognivance.com` accepted
3. NestJS `AuthService` validates credentials and returns a signed JWT (expires in 7 days)
4. Token stored in `localStorage` as `lms_token`
5. Zustand store (`useAuthStore`) persists `user` and `token` via `zustand/middleware/persist`
6. Axios interceptor in `lib/api.ts` attaches `Authorization: Bearer <token>` to every request
7. On 401 response, interceptor clears token and redirects to `/login`

### Guards (NestJS)
- `JwtAuthGuard` — validates JWT on protected routes using `passport-jwt`
- `RolesGuard` — checks `@Roles('admin')` decorator against the authenticated user's role
- Both guards applied at controller level via `@UseGuards(JwtAuthGuard, RolesGuard)`

### Route Protection (Frontend)
`AppLayout.tsx` wraps all protected pages. It waits for client-side hydration before checking auth, preventing false redirects on page refresh.

---

## 9. State Management

Zustand handles global auth state. All server data is managed by TanStack Query.

```ts
interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}
```

Persisted to `localStorage` under the key `lms-erp-auth`.

---

## 10. File Uploads

### Development
Files stored locally in `backend/uploads/`:
- `uploads/thumbnails/` — course thumbnail images
- `uploads/videos/` — lesson videos

Multer `diskStorage` is used for thumbnails and videos.

> Never set `Content-Type: multipart/form-data` manually — let axios set it so the boundary is included correctly.

### Course Video URL
Courses support a `video_url` field for linking external videos (YouTube, Vimeo, or direct URL). This is separate from uploaded lesson video files.

---

## 11. Email Notifications

A welcome email is sent automatically when a new user registers.

### Setup (Gmail)
1. Enable 2-Step Verification on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an App Password for "Mail"
4. Set in `backend/.env`:
```env
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-16-char-app-password
MAIL_FROM=LMS Platform <your-gmail@gmail.com>
```

### Email Template
The welcome email includes:
- Arohak crimson gradient header with user's initial avatar
- Personalized greeting
- Feature highlights (courses, progress, certificates, quizzes)
- "Go to Dashboard" CTA button
- Arohak-branded footer

If `MAIL_USER` / `MAIL_PASS` are not configured, the service logs a warning and skips sending — registration still works normally.

---

## 12. Running Locally

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### 1. Create the database
```sql
CREATE DATABASE lms_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (NestJS)
```bash
cd lms-erp/backend
# Edit .env with your DB credentials
npm install
node src/database/migrate.js    # create tables
node src/database/seed.js       # insert sample data
npm run start:dev               # starts on http://localhost:4000
```

### 3. Frontend (Next.js)
```bash
cd lms-erp/frontend
# .env.local already set to http://localhost:4000/api
npm install
npm run dev                     # starts on http://localhost:3000
```

---

## 13. Database Migrations & Seeding

### Migrate (create all tables)
```bash
cd lms-erp/backend
node src/database/migrate.js
```

Safe to re-run — uses `CREATE TABLE IF NOT EXISTS`. Also patches existing tables (e.g. adds `video_url` column to courses if missing).

### Seed (insert sample data)
```bash
node src/database/seed.js
```

Seed inserts (idempotent — uses upsert):
- 1 admin user + 1 employee user
- 8 courses: MFT, ServiceNow, webMethods, Python, Full Stack, SAP UI5/Fiori, SAP Workflow, SAP CAP
- Each course has sections, lessons, and a quiz

### Cleanup duplicates
```bash
node src/database/cleanup-dupes.js
```

---

## 14. Production Deployment

### Recommended: Railway (backend + DB) + Vercel (frontend)

#### Step 1 — MySQL on Railway
1. Go to [railway.app](https://railway.app) → New Project → Provision MySQL
2. Copy the connection variables from the Variables tab
3. Run migrate + seed locally against the Railway DB

#### Step 2 — Backend on Railway
- Root directory: `lms-erp-main/lms-erp/backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`

Required environment variables:
| Key | Value |
|---|---|
| `DB_HOST` | Railway MySQL host |
| `DB_PORT` | Railway MySQL port |
| `DB_USER` | Railway MySQL user |
| `DB_PASSWORD` | Railway MySQL password |
| `DB_NAME` | `railway` |
| `JWT_SECRET` | Strong random string |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `MAIL_USER` | Gmail address |
| `MAIL_PASS` | Gmail App Password |
| `MAIL_FROM` | `LMS Platform <your-gmail@gmail.com>` |

#### Step 3 — Frontend on Vercel
- Root directory: `lms-erp-main/lms-erp/frontend`
- Framework: Next.js (auto-detected)

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app/api` |

---

## 15. Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@arohak.com` | `Ar0hak#Admin2024` |
| Employee | `employee@arohak.com` | `Ar0hak#Emp2024` |

> Only `@arohak.com` and `@cognivance.com` email addresses can register or log in.

---

## 16. Certificate Auto-Issuance Logic

A certificate is automatically issued when:
1. All lessons in the course are marked complete
2. All quizzes in the course are passed (score ≥ passing_score)

This is checked after every:
- Lesson completion (`POST /progress/lesson/:lessonId/complete`)
- Quiz submission (`POST /quizzes/:id/submit`)

The enrollment status updates to `completed` at the same time. A "Course Completed" banner appears in the course player with a "View Certificate" button.

Certificate number format: `CERT-{timestamp}-{userId_first8chars}`

Public verification URL (no login required):
```
http://localhost:3000/certificates/verify/CERT-XXXXXXXXXX
```

---

## 17. Brand & Design System

### Arohak Brand Colors
| Name | Hex | Usage |
|---|---|---|
| Red | `#8B1A1A` | Primary brand, links, headings |
| Crimson | `#C0392B` | Buttons, gradients |
| Gold | `#D4A017` | Accents, CTA highlights |
| Amber | `#F0A500` | Stats, badges |
| Cream | `#FFF8F0` | Card backgrounds, inputs |
| Warm | `#FDF3E7` | Page background |
| Dark | `#3d0a0a` | Hero gradients, footer |

### Animated Background
All pages share a fixed animated background layer (defined in `globals.css` and injected in `layout.tsx`):
- 5 floating soft orbs in Arohak red/gold tones
- Rising particle dots
- Subtle animated grid overlay
- Frosted glass effect on navbar and cards (`backdrop-filter: blur`)

### CSS Utility Classes
| Class | Description |
|---|---|
| `.btn-primary` | Crimson gradient button |
| `.btn-secondary` | White outlined button |
| `.card` | Frosted glass card (white/82% + blur) |
| `.stat-card` | Frosted glass stat card |
| `.course-card` | Course card with hover lift |
| `.input` | Styled form input with red focus ring |
| `.badge-*` | Colored badge variants |
| `.progress-fill` | Red gradient progress bar fill |
| `.animate-pop` | Pop-in animation |
| `.animate-fade-up` | Fade up animation |
| `.skeleton` | Shimmer loading skeleton |
