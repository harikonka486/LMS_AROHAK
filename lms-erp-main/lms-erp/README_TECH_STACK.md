# 🚀 LMS Project - Tech Stack Overview

## 📋 **Technology Stack**

### 🎨 **Frontend: Next.js 14**
- **Framework**: Next.js 14.2.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **UI Components**: Custom components with Lucide icons
- **Notifications**: React Hot Toast

### 🔧 **Backend: NestJS**
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript
- **Database**: MySQL 8.0 with MySQL2 driver
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Architecture**: Modular structure with controllers, services, and modules

### 🗄️ **Database: MySQL**
- **Version**: MySQL 8.0
- **Driver**: mysql2 (Node.js)
- **Schema**: Relational database with tables for users, courses, enrollments, etc.
- **Connection**: Pool-based connection management

---

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   NestJS        │    │   MySQL 8.0     │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    React Components      RESTful API Endpoints    Tables & Relations
    App Router            JWT Authentication      Data Persistence
    Server Components     Business Logic         CRUD Operations
```

---

## 📁 **Project Structure**

### **Frontend (Next.js)**
```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # Employee dashboard
│   ├── courses/           # Course pages
│   └── learn/             # Learning interface
├── components/            # Reusable React components
├── lib/                  # Utilities and API client
└── public/               # Static assets
```

### **Backend (NestJS)**
```
backend/
├── src/
│   ├── auth/             # Authentication module
│   ├── users/            # User management
│   ├── courses/          # Course CRUD
│   ├── enrollments/      # Enrollment management
│   ├── lessons/          # Lesson content
│   ├── quizzes/          # Quiz system
│   ├── certificates/     # Certificate generation
│   ├── progress/         # Progress tracking
│   └── database/         # MySQL connection
```

---

## 🔌 **API Communication**

### **Frontend → Backend**
- **HTTP Client**: Axios
- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL`
- **Authentication**: JWT tokens in headers
- **Data Fetching**: TanStack Query for caching and synchronization

### **Backend → Database**
- **ORM**: Raw SQL queries with MySQL2
- **Connection Pool**: Managed by NestJS database module
- **Transactions**: Handled at service level

---

## 🚀 **Development Workflow**

### **Local Development**
```bash
# Backend (NestJS)
cd backend
npm install
npm run start:dev    # Runs on http://localhost:4000

# Frontend (Next.js)
cd frontend
npm install
npm run dev          # Runs on http://localhost:3000
```

### **Database Setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE lms_erp;

# Run migrations and seeds
cd backend
npm run migrate
npm run seed
```

---

## 🔐 **Authentication Flow**

1. **User Registration** → NestJS validates email domain → Creates user in MySQL
2. **User Login** → NestJS verifies credentials → Issues JWT token
3. **API Requests** → Frontend includes JWT token → NestJS validates → Returns data

---

## 📦 **Deployment Options**

### **Full-Stack Deployment**
- **Railway**: One-click deployment with MySQL included
- **Render**: Separate frontend and backend services
- **Heroku**: Backend with add-on database

### **Frontend-Only Deployment**
- **Vercel**: Optimized for Next.js apps
- **Netlify**: Static site generation
- **GitHub Pages**: Static hosting

---

## 🎯 **Key Features**

### **Frontend (Next.js)**
- ✅ Server-side rendering with App Router
- ✅ Responsive design with Tailwind CSS
- ✅ Real-time progress tracking
- ✅ Interactive learning interface
- ✅ Admin dashboard with charts

### **Backend (NestJS)**
- ✅ RESTful API with proper HTTP status codes
- ✅ JWT-based authentication
- ✅ Input validation and sanitization
- ✅ Modular architecture
- ✅ Error handling and logging

### **Database (MySQL)**
- ✅ Relational data integrity
- ✅ Optimized queries with indexing
- ✅ Transaction support
- ✅ Scalable schema design

---

## 🔧 **Environment Configuration**

### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### **Backend (.env)**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms_erp
JWT_SECRET=your_jwt_secret
```

---

## 📊 **Performance Considerations**

- **Next.js**: Automatic code splitting and caching
- **NestJS**: Lazy loading modules and connection pooling
- **MySQL**: Indexed queries and optimized joins
- **API Response**: Efficient data transfer with pagination

---

This modern stack provides excellent performance, scalability, and developer experience for your LMS application! 🎉
