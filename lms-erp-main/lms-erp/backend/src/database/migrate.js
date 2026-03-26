/**
 * Migration script — run with: node src/database/migrate.js
 * Creates all tables if they don't exist. Safe to re-run.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'lms_erp',
    multipleStatements: true,
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } }),
  });

  console.log('Connected. Running migrations...\n');

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','employee') DEFAULT 'employee',
      avatar VARCHAR(500),
      department VARCHAR(255),
      employee_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      thumbnail VARCHAR(500),
      video_url VARCHAR(1000),
      price DECIMAL(10,2) DEFAULT 0,
      is_published TINYINT(1) DEFAULT 0,
      level ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
      language VARCHAR(100) DEFAULT 'English',
      instructor_id VARCHAR(36),
      category_id VARCHAR(36),
      passing_score INT DEFAULT 70,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sections (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      order_num INT DEFAULT 0,
      course_id VARCHAR(36),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      video_url VARCHAR(500),
      sharepoint_video_url VARCHAR(500),
      google_drive_url VARCHAR(500),
      video_file VARCHAR(500),
      duration INT DEFAULT 0,
      order_num INT DEFAULT 0,
      is_free TINYINT(1) DEFAULT 0,
      section_id VARCHAR(36),
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_documents (
      id VARCHAR(36) PRIMARY KEY,
      course_id VARCHAR(36),
      title VARCHAR(500),
      file_url VARCHAR(500),
      file_type VARCHAR(100),
      file_size INT,
      order_num INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      course_id VARCHAR(36),
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      status ENUM('active','completed','dropped') DEFAULT 'active',
      UNIQUE KEY unique_enrollment (user_id, course_id),
      FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id VARCHAR(36) PRIMARY KEY,
      enrollment_id VARCHAR(36),
      lesson_id VARCHAR(36),
      completed TINYINT(1) DEFAULT 0,
      completed_at TIMESTAMP NULL,
      UNIQUE KEY unique_progress (enrollment_id, lesson_id),
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id)     REFERENCES lessons(id)     ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id VARCHAR(36) PRIMARY KEY,
      course_id VARCHAR(36),
      title VARCHAR(500) NOT NULL,
      description TEXT,
      passing_score INT DEFAULT 70,
      order_num INT DEFAULT 0,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS questions (
      id VARCHAR(36) PRIMARY KEY,
      quiz_id VARCHAR(36),
      text TEXT NOT NULL,
      options JSON,
      correct_answer INT,
      explanation TEXT,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      quiz_id VARCHAR(36),
      answers JSON,
      score DECIMAL(5,2),
      passed TINYINT(1) DEFAULT 0,
      attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      course_id VARCHAR(36),
      issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      certificate_number VARCHAR(100) UNIQUE,
      FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ All tables created successfully.');

  // Patch existing tables — safe to re-run
  try {
    await db.query(`ALTER TABLE courses ADD COLUMN video_url VARCHAR(1000) NULL`);
    console.log('✅ Added video_url column to courses');
  } catch (e) {
    if (!e.message.includes('Duplicate column')) console.warn('video_url column:', e.message);
  }

  try {
    await db.query(`ALTER TABLE courses ADD COLUMN sharepoint_video_url VARCHAR(1000) NULL`);
    console.log('✅ Added sharepoint_video_url column to courses');
  } catch (e) {
    if (!e.message.includes('Duplicate column')) console.warn('sharepoint_video_url column:', e.message);
  }

  try {
    await db.query(`ALTER TABLE lessons ADD COLUMN sharepoint_video_url VARCHAR(500) NULL`);
    console.log('✅ Added sharepoint_video_url column to lessons');
  } catch (e) {
    if (!e.message.includes('Duplicate column')) console.warn('sharepoint_video_url column:', e.message);
  }

  try {
    await db.query(`ALTER TABLE lessons ADD COLUMN google_drive_url VARCHAR(500) NULL`);
    console.log('✅ Added google_drive_url column to lessons');
  } catch (e) {
    if (!e.message.includes('Duplicate column')) console.warn('google_drive_url column:', e.message);
  }

  try {
    await db.query(`ALTER TABLE certificates ADD COLUMN score DECIMAL(5,2) NULL`);
    console.log('✅ Added score column to certificates');
  } catch (e) {
    if (!e.message.includes('Duplicate column')) console.warn('score column:', e.message);
  }

  // Password reset tokens table
  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ password_reset_tokens table ready');

  // Email verification tokens table
  await db.query(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ email_verification_tokens table ready');

  try {
    await db.query(`ALTER TABLE users ADD COLUMN is_email_verified TINYINT(1) DEFAULT 0`);
    console.log('✅ Added is_email_verified column to users');
  } catch (e) {
    if (!e.message.includes('Duplicate column')) console.warn('is_email_verified column:', e.message);
  }

  await db.end();
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
