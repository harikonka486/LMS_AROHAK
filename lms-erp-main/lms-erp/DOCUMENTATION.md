# LMS — Full Project Documentation

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
11. [Running Locally](#11-running-locally)
12. [Database Migrations & Seeding](#12-database-migrations--seeding)
13. [Production Deployment](#13-production-deployment)
14. [Default Credentials](#14-default-credentials)
15. [Certificate Auto-Issuance Logic](#15-certificate-auto-issuance-logic)

---

## 1. Project Overview

LMS is a full-stack Learning Management System built for corporate employee training. Admins create and publish courses with video lessons, quizzes, and documents. Employees enroll, track progress, take quizzes, and earn certificates upon completion.

Key capabilities:
- Role-based access: `admin` and `employee`
- Course management with sections, lessons, documents, and quizzes
- Lesson progress tracking with automatic enrollment status sync
- Quiz submission with auto-grading and pass/fail logic
- Certificate auto-issuance when all lessons and quizzes are completed
- Public certificate verification by certificate number
- Bulk user import via CSV
- Admin dashboard with platform-wide stats

---

## 2. Tech Stack

### Frontend
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

### Backend
| Package | Version | Purpose |
|---|---|---|
| NestJS | 11.x | Backend framework (modular architecture) |
| Node.js | 18+ | Runtime |
| MySQL2 | 3.x | Database driver |
| @nestjs/jwt | 11.x | JWT authentication |
| @nestjs/passport | 11.x | Passport.js integration |
| passport-jwt | 4.x | JWT strategy |
| bcryptjs | 3.x | Password hashing |
| multer | 2.x | File upload handling |
| csv-parse | 6.x | CSV bulk user import |
| uuid | 13.x | UUID generation |
| class-validator | 0.15.x | DTO validation |
| class-transformer | 0.5.x | Request transformation |

### Infrastructure
| Service | Purpose |
|---|---|
| MySQL 8.0 | Primary database |
| NestJS | Backend API (port 4000) |
| Next.js | Frontend (port 3000) |
| Cloudinary | Media file storage (production) |

---

## 3. Project Structure

```
lms-erp/
├── backend/                          # NestJS API
│   ├── src/
│   │   ├── main.ts                   # Bootstrap — CORS, validation pipe, global prefix
│   │   ├── app.module.ts             # Root module — imports all feature modules
│   │   ├── database/
│   │   │   └── database.module.ts    # MySQL connection pool (global)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts    # POST /auth/register, /auth/login
│   │   │   ├── auth.service.ts       # Register / login logic
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts       # Passport JWT strategy
│   │   │   └── guards.ts             # JwtAuthGuard, RolesGuard, @Roles decorator
│   │   ├── users/
│   │   ├── courses/
│   │   ├── categories/
│   │   ├── sections/
│   │   ├── lessons/
│   │   ├── enrollments/
│   │   ├── progress/
│   │   ├── quizzes/
│   │   ├── certificates/
│   │   └── health/
│   ├── .env                          # Environment variables
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                         # Next.js 14 App Router
    ├── app/
    │   ├── layout.tsx                # Root layout (Inter font, Toaster)
    │   ├── page.tsx                  # Landing / home page
    │   ├── globals.css               # Tailwind base + component classes
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── dashboard/page.tsx
    │   ├── courses/
    │   │   ├── page.tsx              # Course catalog
    │   │   └── [id]/page.tsx         # Course detail
    │   ├── learn/[courseId]/page.tsx # Course player
    │   ├── my-learning/page.tsx
    │   ├── certificates/
    │   │   ├── page.tsx
    │   │   ├── [id]/page.tsx
    │   │   └── verify/[number]/page.tsx
    │   └── admin/
    │       ├── users/page.tsx
    │       └── courses/
    │           ├── new/page.tsx
    │           └── [id]/edit/page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx         # Auth guard + layout wrapper
    │   │   └── Navbar.tsx            # Top navigation bar
    │   ├── Providers.tsx             # QueryClient + Toast provider
    │   └── ConfirmModal.tsx
    ├── lib/
    │   ├── api.ts                    # Axios instance with auth interceptor
    │   ├── store.ts                  # Zustand auth store (persisted)
    │   └── utils.ts                  # Shared utility functions
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

# Cloudinary (production only)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
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
| email | VARCHAR(255) UNIQUE | Must end with `@arohak.com` |
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
| thumbnail | VARCHAR(500) | |
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
| video_file | VARCHAR(500) | Uploaded file path / Cloudinary URL |
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
| POST | `/auth/register` | 🔓 | Register new user. Email must end with `@arohak.com` |
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
| GET | `/users/stats` | 👑 | Platform-wide stats |
| POST | `/users/import` | 👑 | Bulk import users from CSV (`multipart/form-data`, field: `file`) |
| PATCH | `/users/:id/role` | 👑 | Change user role |
| GET | `/users/:id/progress` | 👑 | Get all enrollments + progress for a user |
| DELETE | `/users/:id` | 👑 | Delete user |

**CSV Import format:**
```
name,email,employee_id,department,role
John Doe,john@arohak.com,EMP010,Finance,employee
```
Default password for imported users: `Welcome@123`

---

### Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | 🔓 | List all categories with course count |

---

### Courses

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/courses` | 🔐 | List published courses. Query: `search`, `category`, `level`, `page`, `limit` |
| GET | `/courses/my` | 👑 | List courses created by current admin |
| GET | `/courses/:id` | 🔓 | Course detail with sections, lessons, documents, quizzes |
| POST | `/courses` | 👑 | Create course (`multipart/form-data` with optional `thumbnail`) |
| PATCH | `/courses/:id` | 🔐 | Update course |
| PATCH | `/courses/:id/publish` | 👑 | Toggle publish status |
| DELETE | `/courses/:id` | 👑 | Delete course |

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
{ "answers": [0, 1, 2, 1, 0, 2, 2] }
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
| `/` | Public | Landing page |
| `/login` | Public | Login form |
| `/register` | Public | Registration form |
| `/courses` | Public | Course catalog with search and filters |
| `/courses/:id` | Public | Course detail page |
| `/dashboard` | 🔐 | Dashboard (admin sees stats, employee sees enrollments) |
| `/my-learning` | 🔐 | Employee's enrolled courses |
| `/learn/:courseId` | 🔐 | Course player — lessons, progress, quiz |
| `/certificates` | 🔐 | User's earned certificates |
| `/certificates/:id` | 🔐 | Certificate detail / print view |
| `/certificates/verify/:number` | Public | Public certificate verification |
| `/admin/users` | 👑 | User management — list, role change, delete, CSV import |
| `/admin/courses/new` | 👑 | Create new course |
| `/admin/courses/:id/edit` | 👑 | Edit course, manage sections/lessons/quizzes |

---

## 8. Authentication & Authorization

### Flow
1. User logs in via `POST /api/auth/login`
2. NestJS `AuthService` validates credentials and returns a signed JWT (expires in 7 days)
3. Token stored in `localStorage` as `lms_token`
4. Zustand store (`useAuthStore`) persists `user` and `token` via `zustand/middleware/persist`
5. Axios interceptor in `lib/api.ts` attaches `Authorization: Bearer <token>` to every request
6. On 401 response, interceptor clears token and redirects to `/login`

### Guards (NestJS)
- `JwtAuthGuard` — validates JWT on protected routes using `passport-jwt`
- `RolesGuard` — checks `@Roles('admin')` decorator against the authenticated user's role
- Both guards are applied at controller level via `@UseGuards(JwtAuthGuard, RolesGuard)`

### Route Protection (Frontend)
`AppLayout.tsx` wraps all protected pages. It waits for client-side hydration before checking auth, preventing false redirects on page refresh.

### Email Restriction
Only `@arohak.com` email addresses are accepted at register and login.

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
- `uploads/thumbnails/` — course thumbnails
- `uploads/videos/` — lesson videos
- `uploads/avatars/` — user avatars
- `uploads/documents/` — course documents

Multer is configured with `memoryStorage()` for CSV imports and disk/cloud storage for media files.

### Production
Files uploaded to Cloudinary. The upload interceptor switches between local disk storage and Cloudinary based on `NODE_ENV`.

> Never set `Content-Type: multipart/form-data` manually — let the browser/axios set it so the boundary is included correctly.

---

## 11. Running Locally

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
cp .env.example .env        # fill in DB credentials and JWT_SECRET
npm install
npm run start:dev           # starts on http://localhost:4000 with watch mode
```

### 3. Frontend (Next.js)
```bash
cd lms-erp/frontend
cp .env.local.example .env.local
npm install
npm run dev                 # starts on http://localhost:3000
```

---

## 12. Database Migrations & Seeding

The NestJS `DatabaseModule` uses a raw MySQL2 connection pool. Tables are created via migration scripts.

### Migrate
```bash
# Run from backend directory
node src/db/migrate.js
```

### Seed
```bash
node src/db/seed.js
```

Seed inserts:
- 1 admin user + 1 employee user
- 1 category
- 1 course with 3 sections, 7 lessons, 1 quiz (7 questions)

---

## 13. Production Deployment

### Backend — Render / Railway
- Build command: `npm run build`
- Start command: `npm run start:prod`
- Root directory: `lms-erp/backend`

Required environment variables:

| Key | Value |
|---|---|
| `DB_HOST` | MySQL host |
| `DB_PORT` | `3306` |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Strong random string |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Frontend URL |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

### Frontend — Vercel
- Framework: Next.js
- Root directory: `lms-erp/frontend`

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your deployed backend URL + `/api` |

---

## 14. Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@arohak.com` | `Ar0hak#Admin2024` |
| Employee | `employee@arohak.com` | `Ar0hak#Emp2024` |

> Bulk-imported users via CSV get the default password `Welcome@123`

---

## 15. Certificate Auto-Issuance Logic

A certificate is automatically issued when:
1. All lessons in the course are marked complete
2. All quizzes in the course are passed (score ≥ passing_score)

This is checked after every lesson completion (`POST /progress/lesson/:lessonId/complete`) and every quiz submission (`POST /quizzes/:id/submit`). The enrollment status updates to `completed` at the same time.

Certificate number format: `CERT-{timestamp}-{userId_first8chars}`

Public verification URL (no login required):
```
http://localhost:3000/certificates/verify/CERT-XXXXXXXXXX
```
