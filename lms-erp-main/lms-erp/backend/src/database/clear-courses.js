/**
 * Clear all courses from the database
 * This will delete all courses, sections, lessons, quizzes, enrollments, and related data
 * Run with: node src/database/clear-courses.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function clearCourses() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'lms_erp',
    multipleStatements: true,
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } }),
  });

  console.log('Connected to database. Clearing all courses...\n');

  try {
    // Disable foreign key checks temporarily
    await db.query('SET FOREIGN_KEY_CHECKS = 0');

    // Clear all course-related tables in order of dependencies
    console.log('🗑️  Clearing certificates...');
    await db.query('DELETE FROM certificates');

    console.log('🗑️  Clearing quiz_attempts...');
    await db.query('DELETE FROM quiz_attempts');

    console.log('🗑️  Clearing questions...');
    await db.query('DELETE FROM questions');

    console.log('🗑️  Clearing quizzes...');
    await db.query('DELETE FROM quizzes');

    console.log('🗑️  Clearing lesson_progress...');
    await db.query('DELETE FROM lesson_progress');

    console.log('🗑️  Clearing enrollments...');
    await db.query('DELETE FROM enrollments');

    console.log('🗑️  Clearing course_documents...');
    await db.query('DELETE FROM course_documents');

    console.log('🗑️  Clearing lessons...');
    await db.query('DELETE FROM lessons');

    console.log('🗑️  Clearing sections...');
    await db.query('DELETE FROM sections');

    console.log('🗑️  Clearing courses...');
    await db.query('DELETE FROM courses');

    // Reset auto-increment values if any
    console.log('🔄 Resetting table counters...');
    await db.query('ALTER TABLE certificates AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE quiz_attempts AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE questions AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE quizzes AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE lesson_progress AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE enrollments AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE course_documents AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE lessons AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE sections AUTO_INCREMENT = 1');

    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ All courses and related data have been cleared successfully!');
    console.log('📊 Database is now ready for fresh course data.');

  } catch (error) {
    console.error('❌ Error clearing courses:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// Add confirmation prompt
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('⚠️  This will permanently delete ALL courses, sections, lessons, quizzes, and enrollments. Are you sure? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    console.log('\n🚀 Proceeding with course deletion...\n');
    clearCourses().catch(err => {
      console.error('Failed to clear courses:', err);
      process.exit(1);
    });
  } else {
    console.log('\n❌ Operation cancelled. No data was deleted.');
  }
  readline.close();
});
