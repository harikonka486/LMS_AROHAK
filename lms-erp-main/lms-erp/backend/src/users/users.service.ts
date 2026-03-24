import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class UsersService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async findAll() {
    const [rows] = await this.db.query(
      'SELECT id,name,email,role,employee_id,department,created_at FROM users ORDER BY created_at DESC',
    ) as any;
    return rows;
  }

  async getStats() {
    const [[{ totalCourses }]] = await this.db.query('SELECT COUNT(*) AS totalCourses FROM courses') as any;
    const [[{ totalEnrollments }]] = await this.db.query('SELECT COUNT(*) AS totalEnrollments FROM enrollments') as any;
    const [[{ completedEnrollments }]] = await this.db.query("SELECT COUNT(*) AS completedEnrollments FROM enrollments WHERE status='completed'") as any;
    const [[{ totalCertificates }]] = await this.db.query('SELECT COUNT(*) AS totalCertificates FROM certificates') as any;
    const [[{ totalUsers }]] = await this.db.query('SELECT COUNT(*) AS totalUsers FROM users') as any;
    return { totalCourses, totalEnrollments, completedEnrollments, totalCertificates, totalUsers };
  }

  async changeRole(id: string, role: string) {
    if (!['employee', 'admin'].includes(role)) throw new BadRequestException('Invalid role');
    await this.db.query('UPDATE users SET role=? WHERE id=?', [role, id]);
    return { success: true };
  }

  async getUserProgress(id: string) {
    const [rows] = await this.db.query(`
      SELECT e.id AS enrollment_id, e.status, e.enrolled_at, e.completed_at,
             c.id AS course_id, c.title AS course_title, c.level,
             (SELECT COUNT(*) FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=c.id) AS total_lessons,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id=e.id AND lp.completed=1) AS completed_lessons,
             (SELECT COUNT(*) FROM quizzes WHERE course_id=c.id) AS total_quizzes,
             (SELECT COUNT(DISTINCT qa.quiz_id) FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
              WHERE qa.user_id=e.user_id AND q.course_id=c.id AND qa.passed=1) AS passed_quizzes,
             (SELECT certificate_number FROM certificates WHERE user_id=e.user_id AND course_id=c.id LIMIT 1) AS certificate_number
      FROM enrollments e JOIN courses c ON c.id=e.course_id
      WHERE e.user_id=? ORDER BY e.enrolled_at DESC
    `, [id]) as any;
    return rows;
  }

  async deleteUser(id: string, currentUserId: string) {
    if (id === currentUserId) throw new BadRequestException('Cannot delete yourself');
    await this.db.query('DELETE FROM users WHERE id=?', [id]);
    return { success: true };
  }
}
