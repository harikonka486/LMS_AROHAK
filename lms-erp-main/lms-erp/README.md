# LMS ERP — Training Portal

A full-stack Learning Management System built for enterprise/ERP use.

**Stack:** Next.js 14 · NestJS · MySQL

---

## Project Structure

```
lms-erp/
├── backend/          # NestJS API (port 4000)
└── frontend/         # Next.js 14 App (port 3000)
```

---

## Prerequisites

- Node.js 18+
- MySQL 8.0+

---

## Backend Setup

### 1. Install dependencies
```bash
cd lms-erp/backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms_erp
JWT_SECRET=your_secret_key_here
PORT=4000
CLIENT_URL=http://localhost:3000
```

### 3. Create the database
```sql
CREATE DATABASE lms_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run migrations
```bash
npm run migrate
```

### 5. Seed demo data
```bash
npm run seed
```

### 6. Start the server
```bash
npm run start:dev
```

API available at: `http://localhost:4000/api`

---

## Frontend Setup

### 1. Install dependencies
```bash
cd lms-erp/frontend
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Start the dev server
```bash
npm run dev
```

App available at: `http://localhost:3000`

---

## Demo Accounts (after seeding)

| Role  | Email            | Password         |
|--------|------------------|------------------|
| Admin  | admin@arohak.com | Ar0hak#Admin2024 |

---

## Features

- JWT authentication with role-based access (admin / instructor / student)
- Course catalog with categories, sections, and lessons
- Video player + document downloads per lesson
- Quiz engine with auto-grading
- Auto certificate generation when all quizzes in a course are passed
- Printable certificate page with employee name
- Public certificate verification via unique certificate number
- Admin: manage users, courses, sections, lessons, quizzes
- Student: my learning page with progress tracking

---

## API Endpoints

| Resource       | Base Path              |
|----------------|------------------------|
| Auth           | `/api/auth`            |
| Users          | `/api/users`           |
| Categories     | `/api/categories`      |
| Courses        | `/api/courses`         |
| Sections       | `/api/sections`        |
| Lessons        | `/api/lessons`         |
| Documents      | `/api/documents`       |
| Enrollments    | `/api/enrollments`     |
| Progress       | `/api/progress`        |
| Quizzes        | `/api/quizzes`         |
| Certificates   | `/api/certificates`    |

---

## Certificate Verification

Public URL (no login required):
```
http://localhost:3000/certificates/verify/CERT-XXXXXXXXXX
```
