# Arohak LMS API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users API](#users-api)
3. [Courses API](#courses-api)
4. [Sections API](#sections-api)
5. [Lessons API](#lessons-api)
6. [Quizzes API](#quizzes-api)
7. [Certificates API](#certificates-api)
8. [Documents API](#documents-api)
9. [Categories API](#categories-api)
10. [Error Handling](#error-handling)

---

## Base URL
```
Development: http://localhost:4000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints (except login and register) require JWT authentication.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "employee",
    "department": "IT",
    "employee_id": "EMP001"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "employee",
  "department": "IT",
  "employee_id": "EMP001"
}
```

---

## Users API

### Get Current User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "employee",
  "department": "IT",
  "employee_id": "EMP001",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Update User Profile
```http
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "department": "Finance",
  "employee_id": "EMP002"
}
```

### Get Admin Statistics
```http
GET /users/stats
Authorization: Bearer <token>
Roles: admin
```

**Response:**
```json
{
  "totalUsers": 150,
  "totalCourses": 25,
  "totalEnrollments": 500,
  "totalCertificates": 350
}
```

---

## Courses API

### Get All Courses (Public)
```http
GET /courses?limit=12&page=1&category=tech&level=beginner&search=python
```

**Query Parameters:**
- `limit`: Number of courses per page (default: 12)
- `page`: Page number (default: 1)
- `category`: Filter by category ID
- `level`: Filter by level (beginner/intermediate/advanced)
- `search`: Search in course titles

**Response:**
```json
{
  "courses": [
    {
      "id": "course-uuid",
      "title": "Python Programming",
      "description": "Learn Python from scratch",
      "thumbnail": "/uploads/thumbnails/python.jpg",
      "video_url": "https://youtube.com/watch?v=...",
      "price": 0,
      "is_published": true,
      "level": "beginner",
      "language": "English",
      "instructor_name": "John Smith",
      "category_name": "Programming",
      "enrollment_count": 25,
      "section_count": 5,
      "quiz_count": 3,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 25
}
```

### Get My Courses (Admin)
```http
GET /courses/my
Authorization: Bearer <token>
Roles: admin
```

### Get Single Course
```http
GET /courses/:id
```

**Response:**
```json
{
  "id": "course-uuid",
  "title": "Python Programming",
  "description": "Learn Python from scratch",
  "thumbnail": "/uploads/thumbnails/python.jpg",
  "video_url": "https://youtube.com/watch?v=...",
  "price": 0,
  "is_published": true,
  "level": "beginner",
  "language": "English",
  "instructor_id": "instructor-uuid",
  "category_id": "category-uuid",
  "passing_score": 70,
  "sections": [
    {
      "id": "section-uuid",
      "title": "Introduction",
      "order_num": 1,
      "lessons": [
        {
          "id": "lesson-uuid",
          "title": "What is Python?",
          "description": "Introduction to Python",
          "video_url": "https://youtube.com/watch?v=...",
          "sharepoint_video_url": "https://sharepoint.com/...",
          "google_drive_url": "https://drive.google.com/...",
          "video_file": "/uploads/videos/intro.mp4",
          "duration": 1800,
          "is_free": true,
          "order_num": 1
        }
      ]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-uuid",
      "title": "Python Basics Quiz",
      "passing_score": 70,
      "questions": [
        {
          "id": "question-uuid",
          "text": "What is Python?",
          "options": [
            "Programming language",
            "Database",
            "Operating system",
            "Web browser"
          ],
          "correctAnswer": 0
        }
      ]
    }
  ]
}
```

### Create Course
```http
POST /courses
Authorization: Bearer <token>
Roles: admin
Content-Type: multipart/form-data

title=Python Programming
description=Learn Python from scratch
level=beginner
language=English
passing_score=70
category_id=category-uuid
thumbnail=@file.jpg
```

### Update Course
```http
PATCH /courses/:id
Authorization: Bearer <token>
Roles: admin
Content-Type: multipart/form-data

title=Advanced Python
description=Deep dive into Python
level=advanced
thumbnail=@new-file.jpg
```

### Delete Course
```http
DELETE /courses/:id
Authorization: Bearer <token>
Roles: admin
```

### Toggle Publish Status
```http
PATCH /courses/:id/publish
Authorization: Bearer <token>
```

---

## Sections API

### Add Section to Course
```http
POST /sections/course/:courseId
Authorization: Bearer <token>
Roles: admin
Content-Type: application/json

{
  "title": "Advanced Topics"
}
```

### Delete Section
```http
DELETE /sections/:sectionId
Authorization: Bearer <token>
Roles: admin
```

---

## Lessons API

### Add Lesson to Section
```http
POST /lessons/section/:sectionId
Authorization: Bearer <token>
Roles: admin
Content-Type: application/json

{
  "title": "Advanced Python Concepts",
  "description": "Deep dive into Python",
  "video_url": "https://youtube.com/watch?v=...",
  "sharepoint_video_url": "https://sharepoint.com/...",
  "google_drive_url": "https://drive.google.com/...",
  "duration": 3600,
  "is_free": false
}
```

### Update Lesson
```http
PATCH /lessons/:lessonId
Authorization: Bearer <token>
Roles: admin
Content-Type: multipart/form-data

title=Updated Lesson
video_file=@new-video.mp4
```

### Delete Lesson
```http
DELETE /lessons/:lessonId
Authorization: Bearer <token>
Roles: admin
```

---

## Quizzes API

### Add Quiz to Course
```http
POST /quizzes/course/:courseId
Authorization: Bearer <token>
Roles: admin
Content-Type: application/json

{
  "title": "Final Assessment",
  "passing_score": 80,
  "questions": [
    {
      "text": "What is Python?",
      "options": [
        "Programming language",
        "Database",
        "Operating system",
        "Web browser"
      ],
      "correctAnswer": 0
    }
  ]
}
```

### Delete Quiz
```http
DELETE /quizzes/:quizId
Authorization: Bearer <token>
Roles: admin
```

---

## Certificates API

### Get My Certificates
```http
GET /certificates/my
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "cert-uuid",
    "user_id": "user-uuid",
    "course_id": "course-uuid",
    "course_title": "Python Programming",
    "certificate_number": "CERT-1640995200000-USER123",
    "score": 85,
    "issued_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Single Certificate
```http
GET /certificates/:id
Authorization: Bearer <token>
```

### Verify Certificate
```http
GET /certificates/verify/:certificateNumber
```

**Response:**
```json
{
  "valid": true,
  "certificate": {
    "user_name": "John Doe",
    "course_title": "Python Programming",
    "score": 85,
    "issued_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Delete Certificate
```http
DELETE /certificates/:id
Authorization: Bearer <token>
```

---

## Documents API

### Upload Course Document
```http
POST /documents/course/:courseId
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=@document.pdf
title=Course Syllabus
```

### Get Course Documents
```http
GET /documents/course/:courseId
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "doc-uuid",
    "title": "Course Syllabus",
    "file_url": "/uploads/documents/syllabus.pdf",
    "file_type": "application/pdf",
    "file_size": 1024000,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Delete Document
```http
DELETE /documents/:documentId
Authorization: Bearer <token>
```

---

## Categories API

### Get All Categories
```http
GET /categories
```

**Response:**
```json
[
  {
    "id": "cat-uuid",
    "name": "Programming",
    "slug": "programming",
    "description": "Programming courses"
  }
]
```

### Create Category
```http
POST /categories
Authorization: Bearer <token>
Roles: admin
Content-Type: application/json

{
  "name": "Data Science",
  "slug": "data-science",
  "description": "Data science courses"
}
```

---

## Enrollments API

### Get My Enrollments
```http
GET /enrollments/my
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "enrollment-uuid",
    "course_id": "course-uuid",
    "course_title": "Python Programming",
    "instructor_name": "John Smith",
    "status": "active",
    "enrolled_at": "2024-01-01T00:00:00.000Z",
    "completed_lessons": 3,
    "total_lessons": 10,
    "quiz_count": 2
  }
]
```

### Enroll in Course
```http
POST /enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "course-uuid"
}
```

---

## Progress API

### Get Course Progress
```http
GET /progress/course/:courseId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "course_id": "course-uuid",
  "total_lessons": 10,
  "completed_lessons": 7,
  "progress_percentage": 70,
  "sections": [
    {
      "section_id": "section-uuid",
      "section_title": "Introduction",
      "total_lessons": 3,
      "completed_lessons": 3,
      "progress_percentage": 100
    }
  ]
}
```

### Update Lesson Progress
```http
POST /progress/lesson/:lessonId/complete
Authorization: Bearer <token>
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

### Common Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server error

### Validation Errors
```json
{
  "error": "Validation failed",
  "message": [
    "title is required",
    "email must be a valid email"
  ],
  "statusCode": 400
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Login/Register**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File uploads**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## File Uploads

### Supported File Types
- **Images**: jpg, jpeg, png, gif (max 5MB)
- **Documents**: pdf, doc, docx, ppt, pptx (max 10MB)
- **Videos**: mp4, avi, mov (max 100MB)

### Upload Response
```json
{
  "file_url": "/uploads/thumbnails/image.jpg",
  "file_name": "image.jpg",
  "file_size": 1024000,
  "content_type": "image/jpeg"
}
```

---

## Pagination

List endpoints support pagination:
```
GET /courses?limit=10&page=2
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Webhooks

### Course Completion Webhook
```http
POST /webhooks/course-completion
Content-Type: application/json

{
  "user_id": "user-uuid",
  "course_id": "course-uuid",
  "completed_at": "2024-01-01T00:00:00.000Z",
  "score": 85
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
// API Client Setup
const API_BASE = 'http://localhost:4000/api';

class LMSClient {
  constructor(private token: string) {}

  async getCourses(params?: any) {
    const response = await fetch(`${API_BASE}/courses?${new URLSearchParams(params)}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async enrollInCourse(courseId: string) {
    const response = await fetch(`${API_BASE}/enrollments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ course_id: courseId })
    });
    return response.json();
  }
}

// Usage
const client = new LMSClient('your-jwt-token');
const courses = await client.getCourses({ limit: 10 });
await client.enrollInCourse('course-uuid');
```

### Python
```python
import requests

class LMSClient:
    def __init__(self, token, base_url='http://localhost:4000/api'):
        self.token = token
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def get_courses(self, params=None):
        response = requests.get(f'{self.base_url}/courses', 
                               params=params, headers=self.headers)
        return response.json()

    def enroll_in_course(self, course_id):
        response = requests.post(f'{self.base_url}/enrollments',
                                json={'course_id': course_id},
                                headers=self.headers)
        return response.json()

# Usage
client = LMSClient('your-jwt-token')
courses = client.get_courses({'limit': 10})
client.enroll_in_course('course-uuid')
```

---

*This API documentation provides comprehensive information for developers integrating with the Arohak LMS system.*
