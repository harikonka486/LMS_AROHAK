# 🚀 LMS Project Tech Stack

## 📋 **Complete Technology Overview**

---

## 🎨 **Frontend: Next.js 14**

### **Core Framework**
- **Next.js 14.2.0** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.x** - Type safety and development experience

### **Styling & UI**
- **Tailwind CSS 3.3.5** - Utility-first CSS framework
- **Lucide React 0.294.0** - Icon library
- **CSS Modules** - Component-scoped styling

### **State Management**
- **Zustand 4.4.0** - Lightweight state management
- **TanStack Query 5.x** - Server state and data fetching
- **React Hook Form 7.48.0** - Form state management
- **Zod 3.22.0** - Schema validation

### **Development Tools**
- **ESLint 8.0.0** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

---

## 🔧 **Backend: NestJS**

### **Core Framework**
- **NestJS 11.0.1** - Progressive Node.js framework
- **TypeScript 5.7.3** - Type safety
- **Express.js** - HTTP server (underlying NestJS)

### **Database & ORM**
- **MySQL 8.0** - Relational database
- **MySQL2 3.20.0** - MySQL driver for Node.js
- **Raw SQL Queries** - Direct database operations

### **Authentication & Security**
- **Passport.js 0.7.0** - Authentication middleware
- **JWT 11.0.2** - JSON Web Tokens
- **bcryptjs 3.0.3** - Password hashing
- **class-validator 0.15.x** - Input validation
- **class-transformer 0.5.x** - Data transformation

### **Development Tools**
- **NestJS CLI 11.0.0** - Scaffolding and development
- **ESLint 9.18.0** - Code linting
- **Prettier** - Code formatting
- **Jest 30.0.0** - Testing framework

---

## 🗄️ **Database: MySQL 8.0**

### **Database Configuration**
- **Version**: MySQL 8.0
- **Driver**: mysql2 (Node.js)
- **Connection**: Pool-based connection management
- **Character Set**: utf8mb4 (full Unicode support)

### **Schema Design**
- **Relational Model** - Normalized tables with foreign keys
- **Indexing** - Optimized queries with proper indexes
- **Transactions** - ACID compliance for data integrity

---

## 🌐 **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    LMS Architecture                        │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Frontend      │    Backend      │      Database            │
│   Next.js 14    │   NestJS 11     │     MySQL 8.0           │
│   Port: 3000    │   Port: 4000    │     Port: 3306           │
└─────────────────┴─────────────────┴─────────────────────────┘
         │                   │                   │
         │                   │                   │
    React Components   RESTful API      Tables & Relations
    App Router         JWT Auth          CRUD Operations
    Server Components  Business Logic    Data Persistence
    Static Export      Validation        Connection Pooling
```

---

## 📁 **Project Structure**

### **Frontend Directory**
```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication group
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # Employee dashboard
│   ├── courses/           # Course pages
│   └── learn/             # Learning interface
├── components/            # Reusable React components
├── lib/                  # Utilities, API client, store
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS config
└── package.json          # Dependencies and scripts
```

### **Backend Directory**
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
│   ├── categories/       # Course categories
│   ├── database/         # MySQL connection
│   ├── mail/             # Email service
│   ├── main.ts           # Application entry point
│   └── app.module.ts     # Root module
├── package.json          # Dependencies and scripts
└── nest-cli.json        # NestJS CLI configuration
```

---

## 🔌 **Data Flow**

### **Request Flow**
1. **User Action** → Next.js Frontend
2. **API Call** → Axios HTTP request
3. **Authentication** → JWT token in headers
4. **Backend Processing** → NestJS controller/service
5. **Database Query** → MySQL with mysql2
6. **Response** → JSON data back to frontend
7. **State Update** → TanStack Query cache update

### **Authentication Flow**
1. **Login Request** → POST /api/auth/login
2. **Validation** → NestJS validation pipe
3. **Database Check** → MySQL user query
4. **JWT Generation** → Sign token with user data
5. **Token Storage** → Zustand state + localStorage
6. **API Calls** → Include JWT in Authorization header

---

## 🚀 **Development Commands**

### **Frontend (Next.js)**
```bash
npm install              # Install dependencies
npm run dev              # Development server (localhost:3000)
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint check
```

### **Backend (NestJS)**
```bash
npm install              # Install dependencies
npm run start:dev        # Development server (localhost:4000)
npm run build            # TypeScript compilation
npm run start:prod       # Production server
npm run migrate          # Database migrations
npm run seed             # Seed demo data
npm run lint             # ESLint check
npm run test             # Run tests
```

### **Database (MySQL)**
```bash
mysql -u root -p         # Connect to MySQL
CREATE DATABASE lms_erp;  # Create database
npm run migrate          # Run migrations
npm run seed             # Seed demo data
```

---

## 🔧 **Environment Configuration**

### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### **Backend (.env)**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms_erp

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=4000
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

---

## 🎯 **Key Features by Technology**

### **Next.js Features**
- ✅ Server-Side Rendering (SSR)
- ✅ Static Site Generation (SSG)
- ✅ API Routes (for full-stack)
- ✅ Image Optimization
- ✅ Automatic Code Splitting
- ✅ Built-in CSS Support

### **NestJS Features**
- ✅ Modular Architecture
- ✅ Dependency Injection
- ✅ Decorators-based Development
- ✅ Validation Pipes
- ✅ Guard-based Authorization
- ✅ WebSocket Support

### **MySQL Features**
- ✅ ACID Transactions
- ✅ Foreign Key Constraints
- ✅ Indexing and Performance
- ✅ JSON Data Type Support
- ✅ Full-Text Search

---

## 📦 **Package Dependencies Summary**

### **Frontend Dependencies Count**
- **Production**: 12 packages
- **Development**: 6 packages
- **Total**: ~18 packages

### **Backend Dependencies Count**
- **Production**: 13 packages
- **Development**: 28 packages
- **Total**: ~41 packages

---

## 🎉 **Why This Tech Stack?**

### **Next.js**
- **Performance**: Automatic optimization and caching
- **Developer Experience**: Excellent TypeScript support
- **Flexibility**: Supports both SSR and static generation
- **Ecosystem**: Rich plugin and component ecosystem

### **NestJS**
- **Scalability**: Modular architecture for large applications
- **Type Safety**: Full TypeScript support
- **Productivity**: Decorators and dependency injection
- **Maintainability**: Clear separation of concerns

### **MySQL**
- **Reliability**: Mature and battle-tested
- **Performance**: Excellent for read-heavy applications
- **Compatibility**: Works well with Node.js ecosystem
- **Features**: Rich feature set with JSON support

---

This modern full-stack tech stack provides excellent performance, developer experience, and scalability for your LMS application! 🚀
