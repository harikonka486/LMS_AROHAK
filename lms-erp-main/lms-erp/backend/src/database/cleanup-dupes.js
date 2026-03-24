/**
 * Removes duplicate courses (keeps the oldest by created_at or first inserted).
 * Run with: node src/database/cleanup-dupes.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanup() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'lms_erp',
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } }),
  });

  // Find duplicate titles
  const [dupes] = await db.query(
    'SELECT title, COUNT(*) as cnt FROM courses GROUP BY title HAVING cnt > 1'
  );
  console.log('Duplicate courses found:', dupes.length);

  for (const { title } of dupes) {
    // Get all rows for this title ordered by created_at (keep first)
    const [rows] = await db.query(
      'SELECT id FROM courses WHERE title=? ORDER BY created_at ASC',
      [title]
    );
    const keepId = rows[0].id;
    const deleteIds = rows.slice(1).map(r => r.id);
    console.log(`  Keeping ${keepId}, deleting ${deleteIds.length} duplicate(s) for: ${title}`);

    // Delete sections/lessons/quizzes for duplicates first (FK constraints)
    for (const id of deleteIds) {
      const [sections] = await db.query('SELECT id FROM sections WHERE course_id=?', [id]);
      for (const s of sections) {
        await db.query('DELETE FROM lessons WHERE section_id=?', [s.id]);
      }
      await db.query('DELETE FROM sections WHERE course_id=?', [id]);
      const [quizzes] = await db.query('SELECT id FROM quizzes WHERE course_id=?', [id]);
      for (const q of quizzes) {
        await db.query('DELETE FROM questions WHERE quiz_id=?', [q.id]);
      }
      await db.query('DELETE FROM quizzes WHERE course_id=?', [id]);
      await db.query('DELETE FROM courses WHERE id=?', [id]);
    }
  }

  console.log('Cleanup done.');
  await db.end();
}

cleanup().catch(err => { console.error(err); process.exit(1); });
