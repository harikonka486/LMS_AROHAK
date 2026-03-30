import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class EnrollmentsService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async findAll() {
    const [rows] = (await this.db.query(
      `SELECT e.id AS enrollment_id, e.enrolled_at, e.completed_at, e.status,
              COALESCE(u.name, e.user_name_snapshot, 'Deleted User') AS user_name,
              COALESCE(u.email, e.user_email_snapshot, '') AS user_email,
              COALESCE(u.employee_id, '') AS employee_id,
              COALESCE(u.department, '') AS department,
              COALESCE(c.title, e.course_title_snapshot, 'Course Deleted') AS course_title,
              COALESCE(c.level, 'N/A') AS level,
              CASE WHEN c.id IS NOT NULL THEN
                (SELECT COUNT(*) FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=c.id)
              ELSE 0 END AS total_lessons,
              (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id=e.id AND lp.completed=1) AS completed_lessons
       FROM enrollments e
       LEFT JOIN users u ON u.id = e.user_id
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE e.enrolled_at = (
         SELECT MAX(e2.enrolled_at) FROM enrollments e2
         WHERE COALESCE(e2.user_id, e2.user_name_snapshot) = COALESCE(e.user_id, e.user_name_snapshot)
           AND COALESCE(e2.course_id, e2.course_title_snapshot) = COALESCE(e.course_id, e.course_title_snapshot)
           AND COALESCE(e2.status,'active') = (
             SELECT COALESCE(e3.status,'active') FROM enrollments e3
             WHERE COALESCE(e3.user_id, e3.user_name_snapshot) = COALESCE(e.user_id, e.user_name_snapshot)
               AND COALESCE(e3.course_id, e3.course_title_snapshot) = COALESCE(e.course_id, e.course_title_snapshot)
             ORDER BY FIELD(COALESCE(e3.status,'active'),'completed','active','dropped')
             LIMIT 1
           )
       )
       ORDER BY e.enrolled_at DESC`,
    )) as any;
    return rows;
  }

  async enroll(userId: string, courseId: string) {
    const [[course]] = (await this.db.query(
      'SELECT * FROM courses WHERE id=?',
      [courseId],
    )) as any;
    if (!course) throw new NotFoundException('Course not found');
    const [[existing]] = (await this.db.query(
      'SELECT id FROM enrollments WHERE user_id=? AND course_id=?',
      [userId, courseId],
    )) as any;
    if (existing) throw new BadRequestException('Already enrolled');
    const id = uuid();
    await this.db.query(
      'INSERT INTO enrollments (id,user_id,course_id,course_title_snapshot,user_name_snapshot,user_email_snapshot) VALUES (?,?,?,?,?,?)',
      [id, userId, courseId, course.title, null, null],
    );
    // Snapshot user details
    const [[user]] = (await this.db.query('SELECT name, email FROM users WHERE id=?', [userId])) as any;
    if (user) {
      await this.db.query(
        'UPDATE enrollments SET user_name_snapshot=?, user_email_snapshot=? WHERE id=?',
        [user.name, user.email, id],
      );
    }
    const [[enrollment]] = (await this.db.query(
      'SELECT * FROM enrollments WHERE id=?',
      [id],
    )) as any;
    return enrollment;
  }

  async findMy(userId: string) {
    const [rows] = (await this.db.query(
      `
      SELECT e.*, c.title AS course_title, c.thumbnail, c.level, c.passing_score,
             u.name AS instructor_name,
             (SELECT COUNT(*) FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=c.id) AS total_lessons,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id=e.id AND lp.completed=1) AS completed_lessons,
             (SELECT COUNT(*) FROM quizzes WHERE course_id=c.id) AS total_quizzes,
             (SELECT COUNT(DISTINCT qa.quiz_id) FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
              WHERE qa.user_id=e.user_id AND q.course_id=c.id AND qa.passed=1) AS passed_quizzes
      FROM enrollments e JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=c.instructor_id
      WHERE e.user_id=? ORDER BY e.enrolled_at DESC
    `,
      [userId],
    )) as any;
    return rows;
  }

  async unenroll(enrollmentId: string) {
    const [[enrollment]] = (await this.db.query(
      'SELECT id, user_id, course_id FROM enrollments WHERE id=?',
      [enrollmentId],
    )) as any;
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    // Delete the enrollment only — certificates are preserved
    await this.db.query('DELETE FROM enrollments WHERE id=?', [enrollmentId]);

    return { message: 'Unenrolled successfully.' };
  }

  async check(userId: string, courseId: string) {
    const [[enrollment]] = (await this.db.query(
      'SELECT * FROM enrollments WHERE user_id=? AND course_id=?',
      [userId, courseId],
    )) as any;
    return { enrolled: !!enrollment, enrollment: enrollment || null };
  }
}
