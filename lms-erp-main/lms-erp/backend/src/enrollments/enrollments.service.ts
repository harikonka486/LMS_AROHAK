import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class EnrollmentsService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async enroll(userId: string, courseId: string) {
    const [[course]] = await this.db.query('SELECT * FROM courses WHERE id=?', [courseId]) as any;
    if (!course) throw new NotFoundException('Course not found');
    const [[existing]] = await this.db.query('SELECT id FROM enrollments WHERE user_id=? AND course_id=?', [userId, courseId]) as any;
    if (existing) throw new BadRequestException('Already enrolled');
    const id = uuid();
    await this.db.query('INSERT INTO enrollments (id,user_id,course_id) VALUES (?,?,?)', [id, userId, courseId]);
    const [[enrollment]] = await this.db.query('SELECT * FROM enrollments WHERE id=?', [id]) as any;
    return enrollment;
  }

  async findMy(userId: string) {
    const [rows] = await this.db.query(`
      SELECT e.*, c.title AS course_title, c.thumbnail, c.level, c.passing_score,
             u.name AS instructor_name,
             (SELECT COUNT(*) FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=c.id) AS total_lessons,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id=e.id AND lp.completed=1) AS completed_lessons,
             (SELECT COUNT(*) FROM quizzes WHERE course_id=c.id) AS total_quizzes,
             (SELECT COUNT(DISTINCT qa.quiz_id) FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
              WHERE qa.user_id=e.user_id AND q.course_id=c.id AND qa.passed=1) AS passed_quizzes
      FROM enrollments e JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=c.instructor_id
      WHERE e.user_id=? ORDER BY e.enrolled_at DESC
    `, [userId]) as any;
    return rows;
  }

  async check(userId: string, courseId: string) {
    const [[enrollment]] = await this.db.query(
      'SELECT * FROM enrollments WHERE user_id=? AND course_id=?', [userId, courseId],
    ) as any;
    return { enrolled: !!enrollment, enrollment: enrollment || null };
  }
}
