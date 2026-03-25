import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { v4 as uuid } from 'uuid';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class ProgressService {
  constructor(@Inject(DB_POOL) private db: Pool) {}

  async syncEnrollmentStatus(
    enrollmentId: string,
    userId: string,
    courseId: string,
  ) {
    const [[{ totalLessons }]] = (await this.db.query(
      'SELECT COUNT(*) AS totalLessons FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=?',
      [courseId],
    )) as any;
    const [[{ doneLessons }]] = (await this.db.query(
      'SELECT COUNT(*) AS doneLessons FROM lesson_progress WHERE enrollment_id=? AND completed=1',
      [enrollmentId],
    )) as any;
    const [[{ totalQuizzes }]] = (await this.db.query(
      'SELECT COUNT(*) AS totalQuizzes FROM quizzes WHERE course_id=?',
      [courseId],
    )) as any;
    const [[{ passedQuizzes }]] = (await this.db.query(
      `
      SELECT COUNT(DISTINCT qa.quiz_id) AS passedQuizzes
      FROM quiz_attempts qa JOIN quizzes q ON q.id=qa.quiz_id
      WHERE qa.user_id=? AND q.course_id=? AND qa.passed=1
    `,
      [userId, courseId],
    )) as any;

    const lessonsComplete =
      Number(totalLessons) > 0 && Number(doneLessons) >= Number(totalLessons);
    const quizzesComplete =
      Number(totalQuizzes) === 0 ||
      Number(passedQuizzes) >= Number(totalQuizzes);

    if (lessonsComplete && quizzesComplete) {
      await this.db.query(
        "UPDATE enrollments SET status='completed', completed_at=COALESCE(completed_at, NOW()) WHERE id=?",
        [enrollmentId],
      );
    }
    return { totalLessons, doneLessons, totalQuizzes, passedQuizzes };
  }

  async completeLesson(lessonId: string, userId: string) {
    const [[lesson]] = (await this.db.query(
      'SELECT l.*, s.course_id FROM lessons l JOIN sections s ON s.id=l.section_id WHERE l.id=?',
      [lessonId],
    )) as any;
    if (!lesson) throw new NotFoundException('Lesson not found');
    const [[enrollment]] = (await this.db.query(
      'SELECT * FROM enrollments WHERE user_id=? AND course_id=?',
      [userId, lesson.course_id],
    )) as any;
    if (!enrollment) throw new ForbiddenException('Not enrolled');
    await this.db.query(
      `
      INSERT INTO lesson_progress (id,enrollment_id,lesson_id,completed,completed_at) VALUES (?,?,?,1,NOW())
      ON DUPLICATE KEY UPDATE completed=1, completed_at=NOW()
    `,
      [uuid(), enrollment.id, lessonId],
    );
    const stats = await this.syncEnrollmentStatus(
      enrollment.id,
      userId,
      lesson.course_id,
    );
    return {
      completed: true,
      totalLessons: stats.totalLessons,
      completedLessons: stats.doneLessons,
    };
  }

  async getCourseProgress(courseId: string, userId: string) {
    const [[enrollment]] = (await this.db.query(
      'SELECT * FROM enrollments WHERE user_id=? AND course_id=?',
      [userId, courseId],
    )) as any;
    if (!enrollment) return { enrolled: false };
    const [[{ total }]] = (await this.db.query(
      'SELECT COUNT(*) AS total FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=?',
      [courseId],
    )) as any;
    const [progress] = (await this.db.query(
      'SELECT * FROM lesson_progress WHERE enrollment_id=?',
      [enrollment.id],
    )) as any;
    const completed = progress.filter((p: any) => p.completed).length;
    await this.syncEnrollmentStatus(enrollment.id, userId, courseId);
    const [[fresh]] = (await this.db.query(
      'SELECT * FROM enrollments WHERE id=?',
      [enrollment.id],
    )) as any;
    return {
      enrolled: true,
      progress,
      completedLessons: completed,
      totalLessons: Number(total),
      percentage: total > 0 ? Math.round((completed / Number(total)) * 100) : 0,
      completedAt: fresh.completed_at,
      status: fresh.status,
    };
  }
}
